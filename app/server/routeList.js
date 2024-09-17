import {readFile} from 'fs/promises';
import {join, resolve as pathResolve} from 'path';

// Could forego this and don't i18nize server responses (do on client) or
//  cache the locales)

import express from 'express';
import {jml} from 'jamilih/src/jml-jsdom.js';
import csurf from 'csurf';

import {
  checkLocaleRoutes, routeGetter, layoutAndTitleGetter
} from './routeUtils.js';

import AccountManager from './modules/account-manager.js';
import {isNullish, hasOwn, parseCLIJSON} from './modules/common.js';
import EmailDispatcher from './modules/email-dispatcher.js';
import getLogger from './modules/getLogger.js';
import {i18n, getLangDir} from './modules/i18n.js';
import {emailPattern} from './modules/patterns.js';

import getDirname from './modules/getDirname.js';

const __dirname = getDirname(import.meta.url);

/**
 * @typedef {{
 *   name: string,
 *   user: string,
 *   country: string,
 *   date: string
 * }} UserAccount
 */

/**
 * @typedef {{
 *   code: string
 *   name: string
 * }} CountryInfo
 */

/**
 * @param {import('express').Application} app
 * @param {import('./app.js').RouteConfig} config
 * @returns {Promise<void>}
 */
const routeList = async (app, config) => {
  const getLayoutAndTitle = layoutAndTitleGetter(config, jml);
  const {
    log,
    loggerLocale = 'en-US',
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    DB_URL,
    dbOpts: {DB_NAME, adapter},
    SERVE_COVERAGE,
    composeResetPasswordEmailView,
    composeActivationEmailView,
    fromText,
    fromURL,
    requireName,
    router,
    fallback,
    localesBasePath,
    postLoginRedirectPath,
    customRoute = [],
    rootUser = [],
    crossDomainJSRedirects,
    opts,
    cwd,
    disableXSRF = false,
    csurfOptions
  } = config;

  const setI18n = i18n(localesBasePath);

  const countryCodes = /** @type {string[]} */ (config.countryCodes
    ? Array.isArray(config.countryCodes)
      ? config.countryCodes
      : JSON.parse(config.countryCodes)
    : JSON.parse(
      // @ts-expect-error It's ok
      await readFile(new URL('modules/country-codes.json', import.meta.url))
    ));

  const composeResetPasswordEmailConfig = {
    fromText, fromURL
  };

  /**
   * @param {import('intl-dom').I18NCallback<string>} _
   * @returns {CountryInfo[]}
   */
  const getCountries = (_) => {
    return countryCodes.map((code) => {
      return {
        code,
        name: _(`country${code}`)
      };
    });
  };

  /**
   * @param {import('express').Request} req
   */
  const hasRootAccess = (req) => {
    return Boolean(req.session.user?.user && rootUser.includes(
      req.session.user.user
    ));
  };

  log('AwaitingI18NAndLogging');

  // Throw early if there are problems
  const getRoutes = routeGetter(customRoute);
  await checkLocaleRoutes(getRoutes, localesBasePath);

  const [globalI18n, errorLogger] = await Promise.all([
    setI18n({
      // @ts-expect-error Why not accepting empty overload here?
      acceptsLanguages: () => [loggerLocale]
    }),
    getLogger({loggerLocale, errorLog: true})
  ]);

  /**
   * @param {Error} e
   * @returns {void}
   */
  const logErrorProperties = (e) => {
    errorLogger('ServerError', null, e);
    for (const [k, val] of Object.entries(e)) {
      errorLogger('ERROR', null, k, val);
    }
  };

  log('AwaitingDatabaseAccountConnection');
  const am = await (new AccountManager(adapter, {
    DB_URL,
    DB_NAME,
    log,
    _: globalI18n
  }).connect());
  const ed = new EmailDispatcher({
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    composeResetPasswordEmailView:
      composeResetPasswordEmailView &&
        typeof composeResetPasswordEmailView === 'string'
        // // eslint-disable-next-line no-unsanitized/method -- User path
        ? (await import(
          pathResolve(cwd, composeResetPasswordEmailView)
        )).default
        : undefined,
    composeActivationEmailView:
      composeActivationEmailView &&
        typeof composeActivationEmailView === 'string'
        // // eslint-disable-next-line no-unsanitized/method -- User path
        ? (await import(pathResolve(cwd, composeActivationEmailView))).default
        : undefined
  });

  /**
   * @param {import('express').Request} req
   * @param {string[]} privs
   */
  const getUserAccess = async (req, privs) => {
    const rootAccess = hasRootAccess(req);
    if (rootAccess) {
      return privs.map(() => {
        return rootAccess;
      });
    }

    const user = req.session?.user?.user;

    const privInfos = (await Promise.all([
      am.getPrivilegesForGroup('nogin.guests'),
      user ? am.getPrivilegesForGroup('nogin.loggedInUsers') : null,
      user
        // eslint-disable-next-line promise/prefer-await-to-then -- Convenient
        ? am.getGroupForUser(user).then((groupName) => {
          if (!groupName) {
            return null;
          }
          return am.getPrivilegesForGroup(groupName);
        })
        : null
    ])).flat();

    const privSet = privInfos.reduce((set, item) => {
      if (item) {
        set.add(item.privilegeName);
      }
      return set;
    }, new Set());


    return privs.map((priv) => {
      return privSet.has(priv);
    });
  };

  const GetRoutes = {
    /**
     * Login and Logout.
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async root (routes, req, res) {
      const _ = await setI18n(req, res);

      /**
       * @returns {void}
       */
      function login () {
        const title = _('PleaseLoginToAccount');
        const {signup} = routes;
        res.render('login', {
          ...getLayoutAndTitle({
            _, title, template: 'login',
            csrfToken: req.csrfToken()
          }),
          emailPattern,
          signup
        });
      }
      // check if the user has an auto login key saved in a cookie
      if (req.signedCookies.login === undefined) {
        login();
        return;
      }
      // attempt automatic login
      let o;
      try {
        // Checks by `cookie` and `ip`
        o = await am.validateLoginKey(
          req.signedCookies.login,
          /** @type {string} */
          (req.ip)
        );
      } catch {
      }

      if (o) {
        // By the time we get here, we should have
        //  1. A signed login cookie (from posting to `/`, with
        //    "remember-me" set and a successful `manualLogin`, i.e.,
        //    finding the `activated` user with right `passVer` and
        //    successful submission of a password to match that
        //    in the account).
        //  2. Passing `validateLoginKey` (i.e., confirming that
        //     same secure cookie came with the current IP address)
        //  So we could only fail in `autoLogin` with one of these:
        //     1. A DB `findOne` error (returning `null`)
        //     2. Finding that the user is now no longer `activated`,
        //         resulting in the account not being found and `null`
        //         being returned.
        //     3. The `user` on the account has since changed
        //         in the database (without the `cookie`/`ip` changing),
        //         resulting in the account not being found and `null`
        //         being returned.
        //     4. Another account exists with the same `cookie`/`ip` combo
        //         (as the next command might find that record instead).
        //         In such a case, if the passwords match, that
        //         object would be given instead and if not, then `autoLogin`
        //         would fail and neither object be set.
        //     5. The account of this user changed since the `Promise`
        //         just above (e.g., the password or user has since
        //         changed), causing the potential for the passwords
        //         to no longer match.
        const _o = await am.autoLogin(
          /** @type {string} */ (o.user),
          /** @type {string} */ (o.pass)
        );
        if (_o) {
          /**
           * @type {import('express-session').Session & {
           *   user: Partial<import('./modules/account-manager.js').AccountInfo>
           * }}
           */ (
            req.session
          ).user = _o;
          let queryRedirect = /** @type {string} */ (req.query[
            _('query_redirect')
          ]);
          // Using user value should not be a security concern, as
          //  all GET requests should be idempotent and validate
          //  credentials; however, if some XSS uses this, the user
          //  may think they are still on the same domain after
          //  the redirect and mistakenly believe it safe to offer
          //  credentials.
          if (queryRedirect && queryRedirect.includes(':')) {
            queryRedirect = '';
          }
          res.redirect(
            queryRedirect || postLoginRedirectPath || routes.home
          );
          return;
        }
      }
      login();
    },

    /**
     * Control panel.
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async home (routes, req, res) {
      // Disallow empty string also
      if (!('user' in req.session) || !req.session.user) {
        res.redirect(routes.root);
      } else {
        const _ = await setI18n(req, res);
        const {user} = req.session;
        const title = _('ControlPanel');
        res.render('home', {
          user,
          ...getLayoutAndTitle({
            _, title, template: 'home',
            csrfToken: req.csrfToken()
          }),
          countries: getCountries(_),
          emailPattern,
          requireName
        });
      }
    },

    /**
     * New accounts.
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async signup (routes, req, res) {
      const _ = await setI18n(req, res);
      const title = _('Signup');
      res.render('signup', {
        emptyUser: {
          _id: '',
          name: '',
          email: '',
          country: '',
          user: ''
        },
        ...getLayoutAndTitle({
          _, title, template: 'signup'
        }),
        countries: getCountries(_),
        emailPattern,
        requireName
      });
    },

    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async resetPassword (routes, req, res) {
      const _ = await setI18n(req, res);
      const queryKey = /** @type {string} */ (req.query[_('query_key')]);
      let o, e;
      try {
        o = await am.validatePasswordKey(
          queryKey,
          /** @type {string} */
          (req.ip)
        );
      } catch (error) {
        // `validatePasswordKey` just looks up database records, so no reason
        //   to err
        // istanbul ignore next
        e = error;
      }
      if (e || isNullish(o)) {
        res.redirect(routes.root);
      } else {
        /**
         * @type {import('express-session').Session & {
         *   passKey: string
         * }}
         */ (req.session).passKey = queryKey;
        const title = _('ResetPassword');
        res.render('reset-password', {
          ...getLayoutAndTitle({
            _, title, template: 'reset-password',
            csrfToken: req.csrfToken()
          })
        });
      }
    },

    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async activation (routes, req, res) {
      const _ = await setI18n(req, res);
      const title = _('Activation');
      const code = /** @type {string} */ (req.query[_('query_c')]);
      if (code) {
        try {
          await am.activateAccount(code);
        } catch (err) {
          const e = /** @type {Error} */ (err);
          const message = [
            'activationCodeProvidedInvalid'
          ].includes(e.message)
            ? _(e.message, {lb: '\n'})
            // Shouldn't normally throw any other errors
            // istanbul ignore next
            : e.message;

          log('message', {message});

          // Todo: We could supply the precise message to the user, at
          //  least with a revealable cause
          res.status(400).render(
            'activation-failed', {
              ...getLayoutAndTitle({
                _, title,
                template: 'activation-failed',
                error: 'activationCodeProvidedInvalid'
              })
            }
          );
          return;
        }
        res.render(
          'activated', {
            ...getLayoutAndTitle({_, title, template: 'activated'})
          }
        );
      } else {
        res.status(400).render(
          'activation-failed', {
            ...getLayoutAndTitle({
              _, title,
              template: 'activation-failed',
              error: 'ActivationCodeRequired'
            })
          }
        );
      }
    },

    /**
     * View, delete & reset accounts (currently view only).
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async users (_routes, req, res) {
      const [
        accessResult,
        i18nResult,
        getAllRecordsResult
      ] = await Promise.allSettled([
        getUserAccess(req, [
          'nogin.readUsers', 'nogin.deleteUsers', 'nogin.readGroup',
          'nogin.readPrivilege'
        ]),
        setI18n(req, res),
        am.getAllRecords()
      ]);

      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      const {value: _} = i18nResult;

      if (getAllRecordsResult.status === 'rejected') {
        res.status(400).send('bad-get-all-records-result');
        return;
      }

      if (accessResult.status === 'rejected') {
        res.status(400).send('bad-access');
        return;
      }

      const accounts =
        /**
        * @type {(import('./modules/account-manager.js').AccountInfo & {
        *   date: string
        * })[]}
        */
        (getAllRecordsResult.value) ?? [];

      // If adding adding/edit features, ensure have privileges of
      //   `nogin.editUser` and `nogin.createUser`
      const [
        hasReadUsersAccess, hasDeleteUsersAccess, hasReadGroupAccess,
        hasReadPrivilegeAccess
      ] = accessResult.value;

      if (!hasReadUsersAccess) {
        pageNotFound(_, res);
        return;
      }

      const groups = hasReadGroupAccess
        ? await Promise.all(
          /**
           * @type {Promise<{
           *   group: string,
           *   privileges:
           *     import('./modules/account-manager.js').PrivilegeInfo[]
           * }>[]}
           */ (accounts.map(async ({user}) => {
            const group = await am.getGroupForUser(user);
            if (!group) {
              return null;
            }
            return {
              group,
              privileges: await am.getPrivilegesForGroup(group)
            };
          }).filter(Boolean))
        )
        : [];

      const title = _('AccountList');
      res.render('users', {
        ...getLayoutAndTitle({
          _, title, template: 'users',
          csrfToken: req.csrfToken()
        }),
        hasDeleteUsersAccess,
        hasReadGroupAccess,
        accounts: accounts.map(
          /**
           * @param {{
           *   name: string,
           *   user: string,
           *   country: string,
           *   date: Date
           * }} cfg
           * @param {number} idx
           * @returns {UserAccount & {
           *   groupInfo: {}|{
           *     group: string,
           *     privileges?:
           *       import('./modules/account-manager.js').PrivilegeInfo[]
           *   }
           * }}
           */
          ({name, user, country, date}, idx) => {
            return {
              user,
              name: name || '',
              groupInfo: hasReadGroupAccess && hasReadPrivilegeAccess
                ? groups[idx] ?? {}
                : hasReadGroupAccess
                  ? {
                    ...groups[idx],
                    privileges: undefined
                  }
                  : {},
              country: country ? _('country' + country) : '',
              date: new Intl.DateTimeFormat(
                _.resolvedLocale, {dateStyle: 'full'}
              ).format(date)
            };
          }
        )
      });
    },

    /**
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @returns {Promise<void>}
     */
    async coverage (_routes, req, res, next) {
      if (SERVE_COVERAGE) {
        // Tried just this, but apparently must be used with `app.use`
        // express.static(join(__dirname, '../../coverage'))(req, res, next);

        // SHOW COVERAGE HTML ON SERVER
        // We could add this in a separate file, but we'll leverage express here
        app.use(req.url, express.static(join(__dirname, '../../coverage')));
        next(); // Now check static
        return;
      }

      const _ = await setI18n(req, res);
      pageNotFound(_, res);
    },

    /**
     * View, delete & reset accounts (currently view only).
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async accessAPI (_routes, req, res) {
      const _ = await setI18n(req, res);
      const title = _('accessAPI');
      res.render('accessAPI', {
        ...getLayoutAndTitle({
          _, title, template: 'accessAPI'
          // Add if making POST requests from this page
          // csrfToken: req.csrfToken()
        })
      });
    },

    /**
     * View, delete & edit groups.
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async groups (_routes, req, res) {
      const [
        accessResult,
        i18nResult,
        readGroupsResult,
        getAllRecords,
        privilegesInfo
      ] = await Promise.allSettled([
        getUserAccess(req, [
          'nogin.readGroup', 'nogin.editGroup',
          'nogin.addUserToGroup', 'nogin.removeUserFromGroup',
          'nogin.addPrivilegeToGroup',
          'nogin.removePrivilegeFromGroup',
          'nogin.readUsers',
          'nogin.readPrivilege'
        ]),
        setI18n(req, res),
        readGroups(),
        am.getAllRecords(),
        am.getAllPrivileges()
      ]);

      if (accessResult.status === 'rejected') {
        res.status(400).send('bad-access');
        return;
      }
      if (getAllRecords.status === 'rejected') {
        res.status(400).send('bad-records');
        return;
      }
      if (privilegesInfo.status === 'rejected') {
        res.status(400).send('bad-privileges-info');
        return;
      }

      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      if (readGroupsResult.status === 'rejected') {
        res.status(400).send('bad-group-read');
        return;
      }
      const {value: _} = i18nResult;

      const [
        hasReadGroupAccess, hasEditGroupAccess,
        hasAddUserToGroupAccess, hasRemoveUserFromGroupAccess,
        hasAddPrivilegeToGroupAccess, hasRemovePrivilegeFromGroupAccess,
        hasReadUsersAccess, hasReadPrivilegeAccess
      ] = accessResult.value;

      if (!hasReadGroupAccess) {
        pageNotFound(_, res);
        return;
      }

      /**
       * @type {{
       *   groupName: string;
       *   builtin: boolean;
       *   usersInfo?: {
       *     user: string;
       *     _id: string;
       *   }[];
       *   privileges?: import("./modules/account-manager.js").PrivilegeInfo[];
       * }[]}
       */
      let readGroupsResultValue = readGroupsResult.value;
      if (!hasRemovePrivilegeFromGroupAccess && !hasReadPrivilegeAccess) {
        readGroupsResultValue = readGroupsResultValue.map((val) => {
          delete val.privileges;
          return val;
        });
      }
      if (!hasRemoveUserFromGroupAccess && !hasReadUsersAccess) {
        readGroupsResultValue = readGroupsResultValue.map((val) => {
          delete val.usersInfo;
          return val;
        });
      }

      const title = _('groups');
      res.render('groups', {
        ...getLayoutAndTitle({
          _, title, template: 'groups',
          csrfToken: req.csrfToken()
        }),
        groupsInfo: readGroupsResultValue.sort(
          ({groupName: gn1, builtin: bi1}, {groupName: gn2, builtin: bi2}) => {
            return bi1 && !bi2
              ? -1
              : bi2 && !bi1
                ? 1
                : gn1 < gn2 ? -1 : gn1 > gn2 ? 1 : 0;
          }
        ),
        hasEditGroupAccess,
        hasAddUserToGroupAccess,
        hasRemoveUserFromGroupAccess,
        hasAddPrivilegeToGroupAccess,
        hasRemovePrivilegeFromGroupAccess,
        hasReadPrivilegeAccess,
        hasReadUsersAccess,
        privileges: hasAddPrivilegeToGroupAccess // Implies priv read access
          ? privilegesInfo.value.map(({
            privilegeName
          }) => privilegeName)
          : [],
        users: hasReadUsersAccess || hasAddUserToGroupAccess
          ? getAllRecords.value.map(
            ({user}) => /** @type {string} */ (user)
          )
          : []
      });
    },

    /**
     * View, delete, and edit privileges.
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async privileges (_routes, req, res) {
      const [
        accessResult,
        i18nResult,
        readPrivilegesResult
      ] = await Promise.allSettled([
        getUserAccess(req, [
          'nogin.readPrivilege',
          'nogin.editPrivilege',
          'nogin.addPrivilegeToGroup',
          'nogin.removePrivilegeFromGroup',
          'nogin.readGroup',
          'nogin.readUsers'
        ]),
        setI18n(req, res),
        readPrivileges()
      ]);

      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      if (readPrivilegesResult.status === 'rejected') {
        res.status(400).send('bad-privilege-read');
        return;
      }
      if (accessResult.status === 'rejected') {
        res.status(400).send('bad-access');
        return;
      }

      const {value: _} = i18nResult;

      const [
        hasReadPrivilegeAccess,
        hasEditPrivilegeAccess,
        hasAddPrivilegeToGroupAccess,
        hasRemovePrivilegeFromGroupAccess,
        hasReadGroupAccess,
        hasReadUsersAccess
      ] = accessResult.value;

      if (!hasReadPrivilegeAccess) {
        pageNotFound(_, res);
        return;
      }

      /**
       * @type {{
       *   privilegeName: string;
       *   builtin: boolean;
       *   description: string;
       *   groupsInfo?: {
       *     groupName: string;
       *     builtin: boolean;
       *     usersInfo?: {
       *       user: string;
       *      _id: string;
       *     }[];
       *   }[];
       * }[]}
       */
      let readPrivilegesResultValue = readPrivilegesResult.value;
      if (!hasRemovePrivilegeFromGroupAccess && !hasReadGroupAccess) {
        readPrivilegesResultValue = readPrivilegesResultValue.map((val) => {
          delete val.groupsInfo;
          return val;
        });
      } else if (!hasReadUsersAccess) {
        readPrivilegesResultValue = readPrivilegesResultValue.map((val) => {
          return {
            ...val,
            groupsInfo: val.groupsInfo?.map((groupInfo) => {
              return {
                ...groupInfo,
                usersInfo: undefined
              };
            })
          };
        });
      }

      const title = _('Privileges');
      res.render('privileges', {
        ...getLayoutAndTitle({
          _, title, template: 'privileges',
          csrfToken: req.csrfToken()
        }),
        hasEditPrivilegeAccess,
        hasAddPrivilegeToGroupAccess,
        hasRemovePrivilegeFromGroupAccess,
        hasReadGroupAccess,
        hasReadUsersAccess,
        privilegesInfo: readPrivilegesResultValue,
        groups: hasAddPrivilegeToGroupAccess
          ? (await am.getAllGroups()).map(({groupName}) => groupName)
          : []
      });
    }
  };

  /**
   * @returns {Promise<{
   *   privilegeName: string,
   *   builtin: boolean,
   *   description: string,
   *   groupsInfo: {
   *     groupName: string,
   *     builtin: boolean,
   *     usersInfo: {
   *       user: string,
   *       _id: string
   *     }[]
   *   }[]
   * }[]>}
   */
  const readPrivileges = async () => {
    const privileges = await am.getAllPrivileges();

    const groups = await readGroups();

    return privileges.map(({privilegeName, description, builtin}) => {
      return {
        privilegeName,
        description,
        builtin,
        groupsInfo:
        /**
         * @type {{
         *   groupName: string,
         *   builtin: boolean,
         *   usersInfo: {
         *     user: string,
         *     _id: string
         *   }[]
         * }[]}
         */ (groups.map((group) => {
          const privilegeGroup = group.privileges.find(({
            privilegeName: pn
          }) => {
            return pn === privilegeName;
          });
          if (privilegeGroup) {
            return {
              groupName: group.groupName,
              usersInfo: group.usersInfo
            };
          }
          return undefined;
        }).filter(Boolean))
      };
    }).sort(
      ({
        privilegeName: pn1, builtin: bi1}, {privilegeName: pn2, builtin: bi2
      }) => {
        return bi1 && !bi2
          ? 1
          : bi2 && !bi1
            ? -1
            : pn1 < pn2 ? -1 : pn1 > pn2 ? 1 : 0;
      }
    );
  };

  /**
   * @returns {Promise<{
   *   groupName: string,
   *   builtin: boolean,
   *   usersInfo: {user: string, _id: string}[],
   *   privileges: import('./modules/account-manager.js').PrivilegeInfo[]
   * }[]>}
   */
  const readGroups = async () => {
    const groups = await am.getAllGroups();

    // const records = await am.getAllRecords();
    // console.log('records', records);

    return await Promise.all(groups.map(async (group) => {
      console.log('group', group);
      return {
        success: true,
        groupName: group.groupName,
        builtin: group.builtin,
        usersInfo: await Promise.all(group.userIDs.map(async (usrID) => {
          // eslint-disable-next-line @stylistic/max-len -- Long
          return /** @type {(Partial<import('./modules/account-manager.js').AccountInfo> & {user: string, _id: string})[]} */ (
            await am.getRecords({
              user: {$eq: usrID}
            })
          ).map(({user: usr, _id}) => ({user: usr, _id}))[0];
        })),
        privileges: await Promise.all(group.privilegeIDs.map(
          async (privilegeID) => {
            // eslint-disable-next-line @stylistic/max-len -- Long
            return /** @type {import('./modules/account-manager.js').PrivilegeInfo} */ (
              await am.getPrivilege(privilegeID)
            );
          }
        ))
      };
    }));
  };

  const PostRoutes = {
    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async root (routes, req, res) {
      let o;
      try {
        o = await am.manualLogin(req.body.user, req.body.pass);
      } catch (er) {
        const err = /** @type {Error} */ (er);
        const _ = await setI18n(req, res);
        const message = [
          'user-not-found',
          'bad-password'
        ].includes(err.message)
          ? _(err.message)
          : err.message;

        res.status(400).send(message);
        return;
      }

      req.session.user = o;

      if (req.body['remember-me'] === 'false') {
        res.status(200).send(o);
      } else {
        const key = await am.generateLoginKey(
          /** @type {string} */ (o.user),
          /** @type {string} */ (req.ip)
        );
        // Is there value in signing this key? The unsigned value
        //  seems of no special value (unlike a password)
        // `signed` requires `cookie-parser` with express
        res.cookie('login', key, {maxAge: 900000, signed: true});
        res.status(200).send(o);
      }
    },

    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async logout (routes, req, res) {
      res.clearCookie('login');
      const _ = await setI18n(req, res);
      req.session.destroy(() => {
        res.status(200).send(_('OK'));
      });
    },

    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async home (routes, req, res) {
      if (!('user' in req.session) || isNullish(req.session.user)) {
        res.status(400).send('session-lost');
        return;
      }
      const {name, email, pass, country} = req.body;
      // We add `id` here to ensure only posting change for user's own
      //   account, since could otherwise be injecting a different
      //   user's name here
      const _ = await setI18n(req, res);
      let o;
      try {
        const sess = /**
         * @type {import('express-session').Session & {
         *   user: import('./modules/account-manager.js').AccountInfo
         * }}
         */ (req.session);
        o = await am.updateAccount({
          id: sess.user._id,
          user: sess.user.user,
          name,
          email,
          pass,
          country
        }, {
          async changedEmailHandler (acct, user) {
            try {
              // TODO this promise takes a moment to return, add a loader to
              //   give user feedback
              await ed.dispatchActivationLink(
                {
                  ...(
                    /**
                     * @type {import('./modules/account-manager.js').
                     *   AccountInfo & {
                     *   activationCode: string
                     * }}
                     */ (
                      acct
                    )
                  ), // (`name`, `activationCode`)
                  user,
                  // Send to updated email (as deliberately not yet saved
                  //   on `acct`).
                  email
                },
                composeResetPasswordEmailConfig,
                _,
                getLangDir(_)
              );
            } catch (e) {
              logErrorProperties(/** @type {Error} */ (e));
              // Cause this `updateAccount` to reject and be handled below
              throw new Error('problem-dispatching-link');
            }
          }
        });
      } catch (er) {
        const error = /** @type {Error} */ (er);
        // We send a code and let the client i18nize
        // We should probably follow this pattern
        log('message', {message: error.message});
        const message = [
          'email-taken',
          'session-lost',
          'problem-dispatching-link'
        ].includes(error.message)
          ? error.message
          : _('ErrorUpdatingAccount');
        res.status(400).send(message);
        return;
      }
      req.session.user = o.value;
      res.status(200).send(_('OK'));
    },

    /**
     * @param {import('./routeUtils.js').Routes} routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async signup (routes, req, res) {
      const {name, email, user, pass, country} = req.body;
      const [
        i18nResult, addNewAccountResult
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.addNewAccount({
          name,
          email,
          user,
          pass,
          country
        })
      ]);
      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      const {value: _} = i18nResult;
      if (addNewAccountResult.status === 'rejected') {
        res.status(400).send(addNewAccountResult.reason.message);
        return;
      }
      const {value: o} = addNewAccountResult;
      try {
        // TODO this promise takes a moment to return, add a loader to
        //   give user feedback
        await ed.dispatchActivationLink(
          o,
          composeResetPasswordEmailConfig,
          _,
          getLangDir(_)
        );
      } catch (e) {
        res.status(400).send('DispatchActivationLinkError');
        logErrorProperties(/** @type {Error} */ (e));
        return;
      }
      res.status(200).send(_('OK'));
    },

    /**
     * Password reset.
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async lostPassword (_routes, req, res) {
      const {email} = req.body;
      const [
        i18nResult, generatePasswordKeyResult
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.generatePasswordKey(
          email,
          /** @type {string} */
          (req.ip)
        )
      ]);
      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      const {value: _} = i18nResult;
      if (generatePasswordKeyResult.status === 'rejected') {
        res.status(400).send(generatePasswordKeyResult.reason.message);
        return;
      }
      const {value: account} = generatePasswordKeyResult;
      try {
        // TODO this promise takes a moment to return, add a loader to
        //   give user feedback
        /* const { status, text } = */
        await ed.dispatchResetPasswordLink(
          /**
           * @type {Partial<import('./modules/account-manager.js').
           *   AccountInfo> & {
           *   name: string,
           *   user: string,
           *   passKey: string,
           *   email: string
           * }}
           */
          (account),
          composeResetPasswordEmailConfig,
          _,
          getLangDir(_)
        );
        res.status(200).send(_('OK'));
      } catch (_e) {
        logErrorProperties(/** @type {Error} */ (_e));
        res.status(400).send(_('UnableToDispatchPasswordReset'));
      }
    },

    /**
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async resetPassword (_routes, req, res) {
      if (
        // User might have lost session cookie
        !('passKey' in req.session) || !req.session.passKey
      ) {
        res.status(404).send('bad-session');
        return;
      }
      const {passKey} = req.session;
      const newPass = req.body.pass;
      // destroy the session immediately after retrieving the stored passkey
      req.session.destroy(() => {
        //
      });
      const [
        i18nResult, updatePasswordResult
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.updatePassword(/** @type {string} */ (passKey), newPass)
      ]);
      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      const {value: _} = i18nResult;
      if (updatePasswordResult.status === 'rejected') {
        res.status(400).send(_('UnableToUpdatePassword'));
        return;
      }
      const {value: o} = updatePasswordResult;
      if (o) {
        res.status(200).send(_('OK'));
      } else {
        res.status(400).send(_('UnableToUpdatePassword'));
      }
    },

    /**
     * Should be safe as express-session stores session object server-side.
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async delete (_routes, req, res) {
      const {selfdelete} = req.body;
      const sess = req.session;
      const [
        i18nResult, {status}
      ] = await Promise.allSettled([
        setI18n(req, res),
        selfdelete
          ? sess.user
            ? am.deleteAccountById(/** @type {string} */ (sess.user._id))
            : Promise.reject(new Error('Missing session user'))
          : (await getUserAccess(req, [
            'nogin.deleteUsers'
          ]))[0]
            ? typeof req.body?.user === 'string' && req.body?.user
              ? am.deleteAccounts({
                user: {$in: [req.body.user]}
              })
              : Promise.reject(new Error('Missing user argument'))
            : Promise.reject(new Error('No privileges to delete user'))
      ]);
      if (i18nResult.status === 'rejected') {
        res.status(400).send('bad-i18n');
        return;
      }
      const {value: _} = i18nResult;
      if (status === 'rejected') {
        res.status(400).send(_('RecordNotFound'));
        return;
      }

      if (selfdelete) {
        res.clearCookie('login');
        req.session.destroy(() => {
          res.status(200).send(_('OK'));
        });
      } else {
        res.status(200).send(_('OK'));
      }
    },

    /**
     * Should be safe as express-session stores session object server-side.
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async reset (_routes, req, res) {
      const _ = await setI18n(req, res);

      const [hasDeleteUsersAccess] = await getUserAccess(req, [
        'nogin.deleteUsers'
      ]);

      if (!hasDeleteUsersAccess) {
        pageNotFound(_, res);
        return;
      }
      await am.deleteAllAccounts();

      // Since we are deleting the user's own account, we log them out
      res.clearCookie('login');
      req.session.destroy(() => {
        res.status(200).send(_('OK'));
      });
    },

    /**
     *
     * @param {import('./routeUtils.js').Routes} _routes
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async accessAPI (_routes, req, res) {
      const _ = await setI18n(req, res);

      const [
        hasReadUsersAccess,
        hasReadGroupAccess,
        hasEditGroupAccess,
        hasAddUserToGroupAccess,
        hasRemoveUserFromGroupAccess,
        hasReadPrivilegeAccess,
        hasEditPrivilegeAccess,
        hasAddPrivilegeToGroupAccess,
        hasRemovePrivilegeFromGroupAccess
      ] = await getUserAccess(req, [
        'nogin.readUsers',
        'nogin.readGroup',
        'nogin.editGroup',
        'nogin.addUserToGroup',
        'nogin.removeUserFromGroup',
        'nogin.readPrivilege',
        'nogin.editPrivilege',
        'nogin.addPrivilegeToGroup',
        'nogin.removePrivilegeFromGroup'
      ]);

      const {
        verb,
        groupName,
        newGroupName,
        userID,
        privilegeName,
        description,
        newPrivilegeName
      } = req.body;

      /**
       * @todo This verb should really be a GET request.
       * @type {{
       *   success: true,
       *   value?: ({
       *     groupName: string,
       *     usersInfo: {user: string, _id: string}[]
       *   }|string|{
       *   privilegeName: string,
       *   groupsInfo: {
       *     groupName: string,
       *     builtin: boolean,
       *     usersInfo: {
       *       user: string,
       *       _id: string
       *     }[]
       *   }[]
       * })[]
       * }}
       */
      let resp = {success: true};
      switch (verb) {
      case 'readUsers':
        if (!hasReadUsersAccess) {
          pageNotFound(_, res);
          return;
        }
        resp = {
          success: true,
          value: (await am.getAllRecords()).map(
            ({user}) => /** @type {string} */ (user)
          )
        };
        break;
      case 'readGroups':
        if (!hasReadGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        resp = {
          success: true,
          value: await readGroups()
        };
        break;
      case 'createGroup':
        if (!hasEditGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.addNewGroup({
            groupName
          });
        } catch (err) {
          if ([
            'bad-groupname', 'groupname-taken'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'deleteGroup':
        if (!hasEditGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.deleteGroupByGroupName(groupName);
        } catch (err) {
          res.status(400).send(/** @type {Error} */ (err).message);
          return;
        }
        break;
      case 'renameGroup':
        if (!hasEditGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.renameGroup({
            groupName,
            newGroupName
          });
        } catch (err) {
          if ([
            'bad-groupname', 'groupname-taken',
            'bad-old-groupname'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'addUserToGroup':
        if (!hasAddUserToGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.addUserToGroup({
            groupName,
            userID
          });
        } catch (err) {
          if ([
            'bad-groupname', 'user-missing'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'removeUserFromGroup':
        if (!hasRemoveUserFromGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.removeUserFromGroup({
            groupName,
            userID
          });
        } catch (err) {
          if ([
            'bad-groupname', 'user-missing'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;

      case 'readPrivileges':
        if (!hasReadPrivilegeAccess) {
          pageNotFound(_, res);
          return;
        }
        resp = {
          success: true,
          value: await readPrivileges()
        };
        break;
      case 'createPrivilege':
        if (!hasEditPrivilegeAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.addNewPrivilege({
            privilegeName, description
          });
        } catch (err) {
          if ([
            'bad-privilegename', 'privilegename-taken'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'deletePrivilege':
        if (!hasEditPrivilegeAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.deletePrivilegeByPrivilegeName(privilegeName);
        } catch (err) {
          if ([
            'bad-privilegename'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'editPrivilege':
        if (!hasEditPrivilegeAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.editPrivilege({
            privilegeName,
            newPrivilegeName,
            description
          });
        } catch (err) {
          if ([
            'bad-privilegename', 'privilegename-taken',
            'bad-old-privilegename'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'addPrivilegeToGroup':
        if (!hasAddPrivilegeToGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.addPrivilegeToGroup({
            groupName,
            privilegeName
          });
        } catch (err) {
          if ([
            'bad-groupname', 'privilege-missing'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;
      case 'removePrivilegeFromGroup':
        if (!hasRemovePrivilegeFromGroupAccess) {
          pageNotFound(_, res);
          return;
        }
        try {
          await am.removePrivilegeFromGroup({
            groupName,
            privilegeName
          });
        } catch (err) {
          if ([
            'bad-groupname', 'privilege-missing'
          ].includes(/** @type {Error} */ (err).message)) {
            res.status(400).send(_(/** @type {Error} */ (err).message));
          } else {
            res.status(400).send(/** @type {Error} */ (err).message);
          }
          return;
        }
        break;

      default:
        console.log('Unrecognized verb', verb);
        pageNotFound(_, res);
        break;
      }
      res.status(200).json(resp);
    }
  };

  [
    'bootstrap',
    '@fortawesome/fontawesome-free',
    '@fortawesome/fontawesome-free/solid',
    'github-fork-ribbon-css',
    'intl-dom',
    'jamilih',
    'jquery',
    'jquery-form',
    '@popperjs/core'
  ].forEach((mod) => {
    const path = '/node_modules/' + mod;
    app.use(
      path,
      express.static(join(cwd, path))
    );
  });

  // Following to exclude as will always be present when
  //   instrumented; see https://github.com/cypress-io/code-coverage#instrument-backend-code
  // istanbul ignore else
  if (typeof __coverage__ !== 'undefined') {
    // See https://github.com/cypress-io/code-coverage

    // ADD APP
    /* eslint-disable n/no-unpublished-import -- Only for testing */
    // @ts-expect-error Not bothering
    (await import('@cypress/code-coverage/middleware/express.js')).default(app);
    /* eslint-enable n/no-unpublished-import -- Only for testing */
  }

  /**
   * @param {import('intl-dom').I18NCallback} args
   * @param {import('./routeUtils.js').Routes} routes
   * @param {string} userAgent
   * @returns {string}
   */
  const wrapResult = (args, routes, userAgent) => {
    // No need to lint here as linting result in Cypress `lang` test.
    // Since this file is dynamic, we don't import `IntlDom` despite
    //  a module being available
    return `
'use strict';
/* globals IntlDom -- Non-ESM */
window.Nogin = {
  disableXSRF: ${disableXSRF},
  postLoginRedirectPath: ${JSON.stringify(postLoginRedirectPath ?? '')},
  Routes: ${JSON.stringify(routes)},
  _: IntlDom.i18nServer(${JSON.stringify({
    strings: {
      ...args.strings
    },
    resolvedLocale: args.resolvedLocale
  })}),
  // Avoid shorthand for compatibility
  redirect: function (key) {
    // Use var for compatibility
    var permittingXDomainRedirects = ${
  crossDomainJSRedirects &&
    // `location.href` not supported in Firefox 2 per
    //   `eslint-plugin-compat`
    // However, can't test during UI test: https://github.com/cypress-io/cypress/issues/2100
    !(/Firefox\/2(?=\D)/u).test(userAgent)
    ? 'true'
    : 'false'};
    if (permittingXDomainRedirects) {
      location.href = (key === 'root' && this.postLoginRedirectPath) ||
        this.Routes[key];
      return;
    }
    location.assign(
      (key === 'root' && this.postLoginRedirectPath) ||
        this.Routes['safe_' + key]
    );
  }
};
`;
  };

  // To save the client extra requests
  // We don't i18nize this route, as the client will need it to find the paths
  app.get('/_lang', async function (req, res) {
    res.type('.js');

    const _ = await setI18n(req, res);
    const routes = getRoutes(_);

    res.status(200).send(
      wrapResult(
        _,
        routes,
        /** @type {string} */ (req.get('User-Agent'))
      )
    );
  });

  if (router) {
    // // eslint-disable-next-line no-unsanitized/method -- User path
    (await import(pathResolve(cwd, router))).default(app, opts);
  }

  /**
   * Reverse detect the locale key from the locale value.
   * @param {import('./routeUtils.js').Routes} routes
   * @param {string} locale
   * @param {import('express').Request} req
   * @returns {string} The route code; empty string if not found
   */
  function getRouteForLocale (routes, locale, req) {
    const pathBeforeSlashes = /\/[^/]*/u;
    const {pathname} = new URL(req.url, `http://${req.headers.host}`);
    const path = pathname.match(pathBeforeSlashes)?.[0];

    const routeObj = Object.entries(routes).find(([, message]) => {
      return message === path;
    });
    return routeObj ? routeObj[0] : '';
  }

  /**
   * @param {import('./modules/email-dispatcher.js').Internationalizer} _
   * @param {import('express').Response} res
   * @returns {void}
   */
  function pageNotFound (_, res) {
    const title = _('PageNotFound');
    res.status(404).render('404', {
      ...getLayoutAndTitle({_, title, template: '404'})
    });
  }

  // We do not use `req.csrfToken()` on `signup`. While it might be
  //  a problem with click-jacking (we are using `helmet` to protect
  //  against this unwanted frame embedding), we don't use this on `login` as
  //  this should normally not be harmful by itself to get a user
  //  logged in (though we do check for subsequent actions). Likewise
  //  for `logout`.
  const openRoutes = new Set([
    // Probably best not to allow cross-site even for these less harmful ones
    // 'logout', 'lostPassword',
    'signup'
  ]);

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} _next
   * @param {"get"|"post"} method
   * @returns {Promise<{
   *   _: import('intl-dom').I18NCallback<string>,
   *   route: string,
   *   routes: import('./routeUtils.js').Routes,
   *   error: Error|undefined
   * }>}
   */
  const i18nAndRoutes = async function (req, res, _next, method) {
    const _ = await setI18n(req, res);
    const routes = getRoutes(_);
    const route = getRouteForLocale(routes, _.resolvedLocale, req);

    let error;
    if (!disableXSRF && !openRoutes.has(route)) {
      if (error) { // Deliberately not reaching
        console.log('route', method, route);
      }
      // Note: We don't use separate middleware for this, as we need
      //  a dynamic route (we could pre-build if examining all locales in
      //  beginning, but this would need to take into account locales
      //  reusing the same name).
      const csrf = csurf(
        parseCLIJSON(csurfOptions)
      );

      // Passing `next` here causes problems; we are no longer in middleware,
      //   so make our own `next`
      // eslint-disable-next-line @stylistic/max-len -- Long
      // eslint-disable-next-line promise/prefer-await-to-callbacks -- Middleware
      csrf(req, res, (err) => {
        if (err) {
          error = err;
        }
      });
    }

    return {_, route, routes, error};
  };

  // eslint-disable-next-line sonarjs/csrf -- Need to review
  app.post('*', async function (req, res, next) {
    const {
      _, route, routes, error
    } = await i18nAndRoutes(req, res, next, 'post');

    if (!error && hasOwn(PostRoutes, route)) {
      await PostRoutes[
        /** @type {keyof PostRoutes} */
        (route)
      ](routes, req, res);
      return;
    }
    console.log('ERRRRROR1', error, route, req.url);
    pageNotFound(_, res);
  });

  app.get('*', async function (req, res, next) {
    const {
      _, route, routes, error
    } = await i18nAndRoutes(req, res, next, 'get');

    if (!error && hasOwn(GetRoutes, route)) {
      await GetRoutes[
        /** @type {keyof GetRoutes} */
        (route)
      ](routes, req, res, next);
      return;
    }

    const notFoundNext = () => {
      console.log('ERRRRROR2', error, route, req.url);
      pageNotFound(_, res);
    };

    if (fallback) {
      // // eslint-disable-next-line no-unsanitized/method -- User path
      (await import(pathResolve(cwd, fallback))).default(
        req, res, notFoundNext, opts
      );
      return;
    }

    notFoundNext();
  });

  // To create custom Bad CSRF page:
  /*
  // eslint-disable-next-line
  //   promise/prefer-await-to-callbacks -- Middleware
  app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
      next(err);
      return;
    }

    // handle CSRF token errors here
    res.status(403);
    res.send('form tampered with');
  });
  */
};

export default routeList;

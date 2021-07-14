'use strict';

const {join, resolve: pathResolve} = require('path');

// Todo[engine:node@>12.9.0]: Remove `Promise.allSettled` polyfill (or
//  forego this and don't i18nize server responses (do on client) or
//  cache the locales)
// eslint-disable-next-line node/no-unsupported-features/es-builtins
Promise.allSettled = require('promise.allsettled/polyfill')();

const express = require('express');
const jsdom = require('jamilih/dist/jml-jsdom.js');
const csurf = require('csurf');

const {
  checkLocaleRoutes, routeGetter, layoutAndTitleGetter
} = require('./routeUtils.js');
const AccountManager = require('./modules/account-manager.js');
const {isNullish, hasOwn, parseCLIJSON} = require('./modules/common.js');
const EmailDispatcher = require('./modules/email-dispatcher.js');
const getLogger = require('./modules/getLogger.js');
const {i18n, getLangDir} = require('./modules/i18n.js');
const {emailPattern} = require('./modules/patterns.js');

const jml = jsdom.default;

module.exports = async function (app, config) {
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
    showUsers,
    fromText,
    fromURL,
    requireName,
    router,
    localesBasePath,
    postLoginRedirectPath,
    customRoute = [],
    crossDomainJSRedirects,
    opts,
    cwd,
    disableXSRF = false,
    csurfOptions
  } = config;

  const setI18n = i18n(localesBasePath);

  const countryCodes = config.countryCodes
    ? Array.isArray(config.countryCodes)
      ? config.countryCodes
      : JSON.parse(config.countryCodes)
    // eslint-disable-next-line node/global-require
    : require('./modules/country-codes.json');

  const composeResetPasswordEmailConfig = {
    fromText, fromURL
  };

  const getCountries = (_) => {
    return countryCodes.map((code) => {
      return {
        code,
        name: _(`country${code}`)
      };
    });
  };

  log('AwaitingI18NAndLogging');

  // Throw early if there are problems
  const getRoutes = routeGetter(customRoute);
  await checkLocaleRoutes(getRoutes, localesBasePath);

  const [globalI18n, errorLogger] = await Promise.all([
    setI18n({
      acceptsLanguages: () => [loggerLocale]
    }),
    getLogger({loggerLocale, errorLog: true})
  ]);

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
        // eslint-disable-next-line max-len
        // eslint-disable-next-line node/global-require, import/no-dynamic-require
        ? require(pathResolve(cwd, composeResetPasswordEmailView))
        : undefined,
    composeActivationEmailView:
      composeActivationEmailView &&
        typeof composeActivationEmailView === 'string'
        // eslint-disable-next-line max-len
        // eslint-disable-next-line node/global-require, import/no-dynamic-require
        ? require(pathResolve(cwd, composeActivationEmailView))
        : undefined
  });

  const GetRoutes = {
    /*
      Login and Logout
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
        o = await am.validateLoginKey(req.signedCookies.login, req.ip);
      } catch (err) {
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
        const _o = await am.autoLogin(o.user, o.pass);
        if (_o) {
          req.session.user = _o;
          let queryRedirect = req.query[
            _('query_redirect')
          ];
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

    /*
     * Control panel.
    */
    async home (routes, req, res) {
      // Disallow empty string also
      if (!req.session.user) {
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

    /*
      new accounts
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

    async resetPassword (routes, req, res) {
      const _ = await setI18n(req, res);
      const queryKey = req.query[_('query_key')];
      let o, e;
      try {
        o = await am.validatePasswordKey(queryKey, req.ip);
      } catch (error) {
        // `validatePasswordKey` just looks up database records, so no reason
        //   to err
        // istanbul ignore next
        e = error;
      }
      if (e || isNullish(o)) {
        res.redirect(routes.root);
      } else {
        req.session.passKey = queryKey;
        const title = _('ResetPassword');
        res.render('reset-password', {
          ...getLayoutAndTitle({
            _, title, template: 'reset-password',
            csrfToken: req.csrfToken()
          })
        });
      }
    },

    async activation (routes, req, res) {
      const _ = await setI18n(req, res);
      const title = _('Activation');
      const code = req.query[_('query_c')];
      if (code) {
        try {
          await am.activateAccount(code);
        } catch (e) {
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

    /*
     * View, delete & reset accounts (currently view only).
    */
    async users (routes, req, res) {
      const [
        {value: _},
        {
          value:
            // istanbul ignore next
            accounts = []
        }
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.getAllRecords()
      ]);

      // Todo[>=3.0.0]: `/users` should always be enabled when there are (read)
      //   privileges.
      if (!showUsers) {
        pageNotFound(_, res);
        return;
      }

      const title = _('AccountList');
      res.render('users', {
        ...getLayoutAndTitle({
          _, title, template: 'users'
          // Enable if allowing any modification behaviors
          // csrfToken: req.csrfToken()
        }),
        accounts: accounts.map(({name, user, country, date}) => {
          return {
            user,
            name: name || '',
            country: country ? _('country' + country) : '',
            date: new Intl.DateTimeFormat(
              _.resolvedLocale, {dateStyle: 'full'}
            ).format(date)
          };
        })
      });
    },

    async coverage (routes, req, res, next) {
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
    }
  };

  const PostRoutes = {
    async root (routes, req, res) {
      let o;
      try {
        o = await am.manualLogin(req.body.user, req.body.pass);
      } catch (err) {
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
        const key = await am.generateLoginKey(o.user, req.ip);
        // Is there value in signing this key? The unsigned value
        //  seems of no special value (unlike a password)
        // `signed` requires `cookie-parser` with express
        res.cookie('login', key, {maxAge: 900000, signed: true});
        res.status(200).send(o);
      }
    },

    async logout (routes, req, res) {
      res.clearCookie('login');
      const _ = await setI18n(req, res);
      req.session.destroy((e) => { res.status(200).send(_('OK')); });
    },

    async home (routes, req, res) {
      if (isNullish(req.session.user)) {
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
        o = await am.updateAccount({
          id: req.session.user._id,
          user: req.session.user.user,
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
                  ...acct, // (`name`, `activationCode`)
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
              logErrorProperties(e);
              // Cause this `updateAccount` to reject and be handled below
              throw new Error('problem-dispatching-link');
            }
          }
        });
      } catch (error) {
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

    async signup (routes, req, res) {
      const {name, email, user, pass, country} = req.body;
      const [
        {value: _}, {status, reason: error, value: o}
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
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
      if (status === 'rejected') {
        res.status(400).send(error.message);
        return;
      }
      try {
        // TODO this promise takes a moment to return, add a loader to
        //   give user feedback
        await ed.dispatchActivationLink(
          o, composeResetPasswordEmailConfig, _, getLangDir(_)
        );
      } catch (e) {
        res.status(400).send('DispatchActivationLinkError');
        logErrorProperties(e);
        return;
      }
      res.status(200).send(_('OK'));
    },

    /*
     * Password reset.
    */
    async lostPassword (routes, req, res) {
      const {email} = req.body;
      const [
        {value: _}, {status, reason: error, value: account}
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.generatePasswordKey(email, req.ip)
      ]);
      if (status === 'rejected') {
        res.status(400).send(error.message);
        return;
      }
      try {
        // TODO this promise takes a moment to return, add a loader to
        //   give user feedback
        /* const { status, text } = */
        await ed.dispatchResetPasswordLink(
          account, composeResetPasswordEmailConfig, _, getLangDir(_)
        );
        res.status(200).send(_('OK'));
      } catch (_e) {
        logErrorProperties(_e);
        res.status(400).send(_('UnableToDispatchPasswordReset'));
      }
    },

    async resetPassword (routes, req, res) {
      const {passKey} = req.session;
      if (
        // User might have lost session cookie
        !passKey
      ) {
        res.status(404).send('bad-session');
        return;
      }
      const newPass = req.body.pass;
      // destroy the session immediately after retrieving the stored passkey
      req.session.destroy();
      const [
        {value: _}, {value: o}
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.updatePassword(passKey, newPass)
      ]);
      if (o) {
        res.status(200).send(_('OK'));
      } else {
        res.status(400).send(_('UnableToUpdatePassword'));
      }
    },

    /*
     * Should be safe as express-session stores session object server-side.
     */
    async delete (routes, req, res) {
      const [
        {value: _}, {status}
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ] = await Promise.allSettled([
        setI18n(req, res),
        req.session.user
          ? am.deleteAccountById(req.session.user._id)
          : Promise.reject(new Error('Missing session user'))
      ]);
      if (status === 'rejected') {
        res.status(400).send(_('RecordNotFound'));
        return;
      }
      res.clearCookie('login');
      req.session.destroy((_e) => {
        res.status(200).send(_('OK'));
      });
    }
    // Todo[>=3.0.0]: Should be available to UI but require privileges.
    /*
    async reset (routes, req, res) {
      await am.deleteAllAccounts();
    }
    */
  };

  [
    'bootstrap',
    '@fortawesome/fontawesome-free',
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
  if (global.__coverage__) {
    // See https://github.com/cypress-io/code-coverage

    // ADD APP
    // eslint-disable-next-line node/no-unpublished-require, node/global-require
    require('@cypress/code-coverage/middleware/express.js')(app);
  }

  const wrapResult = (args, routes, userAgent) => {
    // No need to lint here as linting result in Cypress `lang` test.
    // Since this file is dynamic, we don't import `IntlDom` despite
    //  a module being available
    return `
'use strict';
/* globals IntlDom */
window.Nogin = {
  disableXSRF: ${disableXSRF},
  postLoginRedirectPath: ${postLoginRedirectPath},
  Routes: ${JSON.stringify(routes)},
  _: IntlDom.i18nServer(${JSON.stringify(args)}),
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
      location.href = (key === 'home' && this.postLoginRedirectPath) ||
        this.Routes[key];
      return;
    }
    location.assign(
      (key === 'home' && this.postLoginRedirectPath) ||
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
    const {resolvedLocale, strings} = _;
    const routes = getRoutes(_);

    res.status(200).send(
      wrapResult(
        {resolvedLocale, strings},
        routes,
        req.get('User-Agent')
      )
    );
  });

  if (router) {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    require(pathResolve(cwd, router))(app, opts);
  }

  /**
   * Reverse detect the locale key from the locale value.
   * @param {Routes} routes
   * @param {string} locale
   * @param {Request} req
   * @returns {string} The route code; empty string if not found
   */
  function getRouteForLocale (routes, locale, req) {
    const pathBeforeSlashes = /\/[^/]*/u;
    const {pathname} = new URL(req.url, `http://${req.headers.host}`);
    const path = pathname.match(pathBeforeSlashes)[0];

    const routeObj = Object.entries(routes).find(([, message]) => {
      return message === path;
    });
    return routeObj ? routeObj[0] : '';
  }

  /**
   * @param {Internationalizer} _
   * @param {Response} res
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

  const i18nAndRoutes = async function (req, res, next, method) {
    const _ = await setI18n(req, res);
    const routes = getRoutes(_);
    const route = getRouteForLocale(routes, _.resolvedLocale, req);

    let error;
    if (!disableXSRF && !openRoutes.has(route)) {
      console.log('route', method, route);
      // Note: We don't use separate middleware for this, as we need
      //  a dynamic route (we could pre-build if examining all locales in
      //  beginning, but this would need to take into account locales
      //  reusing the same name).
      const csrf = csurf(
        parseCLIJSON(csurfOptions)
      );

      // Passing `next` here causes problems; we are no longer in middleware,
      //   so make our own `next`
      // eslint-disable-next-line max-len -- Long
      // eslint-disable-next-line promise/prefer-await-to-callbacks -- Middleware
      csrf(req, res, (err) => {
        if (err) {
          error = err;
        }
      });
    }

    return {_, route, routes, error};
  };

  app.post('*', async function (req, res, next) {
    const {
      _, route, routes, error
    } = await i18nAndRoutes(req, res, next, 'post');

    if (!error && hasOwn(PostRoutes, route)) {
      await PostRoutes[route](routes, req, res);
      return;
    }
    console.log('ERRRRROR1', error, route);
    pageNotFound(_, res);
  });

  app.get('*', async function (req, res, next) {
    const {
      _, route, routes, error
    } = await i18nAndRoutes(req, res, next, 'get');

    if (!error && hasOwn(GetRoutes, route)) {
      await GetRoutes[route](routes, req, res, next);
      return;
    }
    console.log('ERRRRROR2', error, route);
    pageNotFound(_, res);
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

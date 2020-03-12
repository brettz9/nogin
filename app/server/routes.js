'use strict';

const {join} = require('path');
const express = require('express');
const fileFetch = require('file-fetch');
const {JSDOM} = require('jsdom');
const {findLocaleStrings} = require('intl-dom');

const AccountManager = require('./modules/account-manager.js');
const EmailDispatcher = require('./modules/email-dispatcher.js');

// For intl-dom
global.fetch = fileFetch;
global.document = (new JSDOM()).window.document;

// Todo[engine:node@>12.9.0]: Remove polyfill (or forego this and don't
//  i18nize server responses (do on client))
// eslint-disable-next-line node/no-unsupported-features/es-builtins
Promise.allSettled = require('promise.allsettled/polyfill')();

const {isNullish} = require('./modules/common.js');
const setI18n = require('./modules/i18n.js')();
const getLogger = require('./modules/getLogger.js');
const layoutView = require('./views/layout.js');

const nonSpecialChars = '[^<>()[\\]\\\\.,;:\\s@"]+';
const ipv4Address = '\\[\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\]';

const emailPattern = '^(' +
  '(' +
    // 1+ initial chars. excluding special chars.
    nonSpecialChars +
    // (Optional) dot followed by 1+ chars., excluding
    //   any special chars.
    '(\\.' + nonSpecialChars + ')*' +
  ')|' +
  // Or quoted value
  '(".+")' +
')@(' +
  '(' +
    ipv4Address +
  ')|' +
  '(' +
    // 1+ sequences of:
    //    1+ alphanumeric (or hyphen) followed by dot
    // ...followed by 2+ alphabetic characters
    '([a-zA-Z\\-\\d]+\\.)+[a-zA-Z]{2,}' +
  ')' +
')$';

module.exports = async function (app, config) {
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
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    injectHTML,
    localScripts,
    fromText,
    fromURL,
    triggerCoverage,
    router,
    opts
  } = config;

  const countryCodes = config.countryCodes
    ? JSON.parse(config.countryCodes)
    // eslint-disable-next-line global-require
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
  const [globalI18n, errorLogger] = await Promise.all([
    setI18n({
      acceptsLanguages: () => loggerLocale
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
    NL_SITE_URL
  });

  /**
  * @callback LayoutCallback
  * @param {PlainObject} templateArgs
  * @returns {JamilihArray}
  */

  /**
  * @typedef {PlainObject} TitleWithLayoutCallback
  * @property {Internationalizer} _
  * @property {string} title
  * @property {LayoutCallback} layout
  */

  /**
  * @typedef {PlainObject} LayoutAndTitleArgs
  * @property {Internationalizer} _
  * @property {string} title
  * @property {string} template The template name (made available to
  * `injectHTML` so it can vary the generated HTML per template).
  * @property {string} error
  */

  /**
   * @param {LayoutAndTitleArgs} businessLogicArgs
   * @returns {TitleWithLayoutCallback}
   */
  const getLayoutAndTitle = (businessLogicArgs) => {
    const {_, title} = businessLogicArgs;
    return {
      _,
      title,
      layout (templateArgs) {
        const cfg = {
          // Though should be trusted anyways, do not let template
          //   arguments override.
          ...templateArgs,
          triggerCoverage,
          favicon,
          stylesheet,
          noBuiltinStylesheets,
          userJS,
          userJSModule,
          localScripts,
          ...businessLogicArgs
        };
        return layoutView(
          cfg,
          // eslint-disable-next-line global-require, import/no-dynamic-require
          injectHTML ? require(injectHTML)(cfg) : {}
        );
      }
    };
  };

  /*
    login & logout
  */
  app.get('/', async function (req, res) {
    const _ = await setI18n(req, res);

    /**
     * @returns {void}
     */
    function login () {
      const title = _('PleaseLoginToAccount');
      res.render('login', {
        ...getLayoutAndTitle({_, title, template: 'login'}),
        emailPattern
      });
    }
    // check if the user has an auto login key saved in a cookie
    if (req.signedCookies.login === undefined) {
      login();
    } else {
      // attempt automatic login
      let o;
      try {
        o = await am.validateLoginKey(req.signedCookies.login, req.ip);
      } catch (err) {
      }

      if (o) {
        const _o = await am.autoLogin(o.user, o.pass);
        req.session.user = _o;
        res.redirect('/home');
      } else {
        login();
      }
    }
  });

  app.post('/', async function (req, res) {
    let o;
    try {
      o = await am.manualLogin(req.body.user, req.body.pass);
    } catch (err) {
      const _ = await setI18n(req, res);
      const message = [
        'user-not-found',
        'bad-password',
        'unexpected-pass-version-error'
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
  });

  app.post('/logout', async function (req, res) {
    res.clearCookie('login');
    const _ = await setI18n(req, res);
    req.session.destroy((e) => { res.status(200).send(_('OK')); });
  });

  /**
   * Control panel.
  */
  app.get('/home', async function (req, res) {
    if (isNullish(req.session.user)) {
      res.redirect('/');
    } else {
      const _ = await setI18n(req, res);
      const {user = {}} = req.session;
      const title = _('ControlPanel');
      res.render('home', {
        user,
        ...getLayoutAndTitle({_, title, template: 'home'}),
        countries: getCountries(_),
        emailPattern
      });
    }
  });

  app.post('/home', async function (req, res) {
    if (isNullish(req.session.user)) {
      res.redirect('/');
    } else {
      const {name, email, pass, country, user} = req.body;
      // We add `id` here to ensure only posting change for user's own
      //   account, since could otherwise be injecting a different
      //   user's name here
      const [
        {value: _}, {status, reason: error, value: o}
        // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ] = await Promise.allSettled([
        setI18n(req, res),
        am.updateAccount({
          id: req.session.user._id,
          name,
          user,
          email,
          pass,
          country
        })
      ]);
      if (status === 'rejected') {
        // We send a code and let the client i18nize
        // We should probably follow this pattern
        log('message', {message: error.message});
        const message = [
          'email-taken'
        ].includes(error.message)
          ? error.message
          : _('ErrorUpdatingAccount');
        res.status(400).send(message);
        return;
      }
      req.session.user = o.value;
      res.status(200).send(_('OK'));
    }
  });

  /*
    new accounts
  */
  app.get('/signup', async function (req, res) {
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
      ...getLayoutAndTitle({_, title, template: 'signup'}),
      countries: getCountries(_),
      emailPattern
    });
  });

  app.post('/signup', async function (req, res) {
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
      await ed.dispatchActivationLink(o, composeResetPasswordEmailConfig, _);
    } catch (e) {
      res.status(400).send(_('EmailServerError'));
      logErrorProperties(e);
      return;
    }
    res.status(200).send(_('OK'));
  });

  app.get('/activation', async function (req, res) {
    const _ = await setI18n(req, res);
    const title = _('Activation');
    if (req.query.c) {
      try {
        await am.activateAccount(req.query.c);
      } catch (e) {
        const message = [
          'activationCodeProvidedInvalid'
        ].includes(e.message)
          ? _(e.message, {lb: '\n'})
          : e.message;

        log('message', {message});

        // Todo: We could supply the precise message to the user, at
        //  least with a revealable cause

        res.render(
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
  });

  /**
   * Password reset.
  */
  app.post('/lost-password', async function (req, res) {
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
        account, composeResetPasswordEmailConfig, _
      );
      res.status(200).send(_('OK'));
    } catch (_e) {
      logErrorProperties(_e);
      res.status(400).send(_('UnableToDispatchPasswordReset'));
    }
  });

  app.get('/reset-password', async function (req, res) {
    let e;
    const [
      {value: _}, {status, reason: error, value: o}
      // eslint-disable-next-line node/no-unsupported-features/es-builtins
    ] = await Promise.allSettled([
      setI18n(req, res),
      am.validatePasswordKey(req.query.key, req.ip)
    ]);
    if (status === 'rejected') {
      e = error;
    }
    if (e || isNullish(o)) {
      res.redirect('/');
    } else {
      req.session.passKey = req.query.key;
      const title = _('ResetPassword');
      res.render('reset-password', {
        ...getLayoutAndTitle({_, title, template: 'reset-password'})
      });
    }
  });

  app.post('/reset-password', async function (req, res) {
    const newPass = req.body.pass;
    const {passKey} = req.session;
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
  });

  // Todo[>=1.0.0-beta.1]: Should require (read) privileges!
  /**
   * View, delete & reset accounts (currently view only).
  */
  app.get('/users', async function (req, res) {
    const [
      {value: _},
      {
        // istanbul ignore next
        value: accounts = []
      }
      // eslint-disable-next-line node/no-unsupported-features/es-builtins
    ] = await Promise.allSettled([
      setI18n(req, res),
      am.getAllRecords()
    ]);
    const title = _('AccountList');
    res.render('users', {
      ...getLayoutAndTitle({_, title, template: 'users'}),
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
  });

  /**
   * Should be safe as express-session stores session object server-side.
   */
  app.post('/delete', async function (req, res) {
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
  });

  // Todo[>=1.0.0-beta.1]: Should require privileges and expect POST/DELETE!
  /**
   * @param {Request} req
   * @param {Response} res
   * @returns {void}
   */
  app.get('/reset', async function (req, res) {
    await am.deleteAllAccounts();
    res.redirect('/users');
  });

  if (SERVE_COVERAGE) {
    // SHOW COVERAGE HTML ON SERVER
    // We could add this in a separate file, but we'll leverage express here
    app.use('/coverage', express.static(join(__dirname, '../../coverage')));
  }

  [
    'bootstrap',
    'font-awesome',
    'github-fork-ribbon-css',
    'intl-dom',
    'jamilih',
    'jquery',
    'jquery-form',
    'popper.js'
  ].forEach((mod) => {
    const path = '/node_modules/' + mod;
    app.use(
      path,
      express.static(join(__dirname, '../..' + path))
    );
  });

  if (global.__coverage__) {
    // See https://github.com/cypress-io/code-coverage

    // ADD APP
    // eslint-disable-next-line node/no-unpublished-require, global-require
    require('@cypress/code-coverage/middleware/express.js')(app);
  }

  const wrapResult = (args) => {
    return `
      /* globals IntlDom */
      window._ = IntlDom.i18nServer(${JSON.stringify(args)});
`;
  };

  // To save the client extra requests
  app.get('/lang', async function (req, res) {
    res.type('.js');

    const acceptLanguage = req.header('accept-language') || 'en-US';
    const languages = acceptLanguage.split(';')[0].split(',');
    const {strings, locale: resolvedLocale} = await findLocaleStrings({
      localesBasePath: __dirname,
      locales: languages
    });
    res.status(200).send(wrapResult({resolvedLocale, strings}));
  });

  if (router) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(router)(app, opts);
  }

  app.get('*', async function (req, res) {
    const _ = await setI18n(req, res);
    const title = _('PageNotFound');
    res.status(404).render('404', {
      ...getLayoutAndTitle({_, title, template: '404'})
    });
  });
};

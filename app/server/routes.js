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
    fromURL
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
          SERVE_COVERAGE,
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
    // check if the user has an auto login key saved in a cookie
    if (req.signedCookies.login === undefined) {
      const title = _('PleaseLoginToAccount');
      res.render('login', {
        ...getLayoutAndTitle({_, title}),
        emailPattern
      });
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
        const title = _('PleaseLoginToAccount');
        res.render('login', {
          ...getLayoutAndTitle({_, title}),
          emailPattern
        });
      }
    }
  });

  app.post('/', async function (req, res) {
    let o;
    try {
      o = await am.manualLogin(req.body.user, req.body.pass);
    } catch (err) {
      res.status(400).send(err.message);
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
      let o, _;
      try {
        // We add `id` here to ensure only posting change for user's own
        //   account, since could otherwise be injecting a different
        //   user's name here
        [o, _] = await Promise.all([
          am.updateAccount({
            id: req.session.user._id,
            name,
            user,
            email,
            pass,
            country
          }),
          setI18n(req, res)
        ]);
      } catch (e) {
        res.status(400).send(_('ErrorUpdatingAccount'));
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
    let _, o;
    try {
      [_, o] = await Promise.all([
        setI18n(req, res),
        am.addNewAccount({
          name,
          email,
          user,
          pass,
          country
        })
      ]);
    } catch (e) {
      res.status(400).send(e.message);
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
        res.render(
          'activation-failed', {
            ...getLayoutAndTitle({_, title, template: 'activation-failed'})
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
      res.status(400).send(_('ActivationCodeRequired'));
    }
  });

  /**
   * Password reset.
  */
  app.post('/lost-password', async function (req, res) {
    const {email} = req.body;
    let account, _;
    try {
      [account, _] = await Promise.all([
        am.generatePasswordKey(email, req.ip),
        setI18n(req, res)
      ]);
    } catch (e) {
      res.status(400).send(e.message);
      return;
    }
    try {
      /* const { status, text } = */
      await ed.dispatchResetPasswordLink(
        account, composeResetPasswordEmailConfig, _
      );
      // TODO this promise takes a moment to return, add a loader to
      //   give user feedback
      res.status(200).send(_('OK'));
    } catch (_e) {
      logErrorProperties(_e);
      res.status(400).send(_('UnableToDispatchPasswordReset'));
    }
  });

  app.get('/reset-password', async function (req, res) {
    let o, _, e;
    try {
      [o, _] = await Promise.all([
        am.validatePasswordKey(req.query.key, req.ip),
        setI18n(req, res)
      ]);
    } catch (err) {
      e = err;
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
    let o, _;
    try {
      [o, _] = await Promise.all([
        am.updatePassword(passKey, newPass),
        setI18n(req, res)
      ]);
    } catch (err) {}
    if (o) {
      res.status(200).send(_('OK'));
    } else {
      res.status(400).send(_('UnableToUpdatePassword'));
    }
  });

  // todo[>=1.7.0]: Should require (read) privileges!
  /**
   * View, delete & reset accounts (currently view only).
  */
  app.get('/users', async function (req, res) {
    const [accounts, _] = await Promise.all([
      am.getAllRecords(),
      setI18n(req, res)
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
    const _ = await setI18n(req, res);
    try {
      /* obj = */ await am.deleteAccountById(req.session.user._id);
    } catch (err) {
      res.status(400).send(_('RecordNotFound'));
      return;
    }
    res.clearCookie('login');
    req.session.destroy((_e) => {
      res.status(200).send(_('OK'));
    });
  });

  // todo[>=1.7.0]: Should require privileges and expect POST/DELETE!
  /**
   * @param {Request} req
   * @param {Response} res
   * @returns {void}
   */
  app.get('/reset', async function (req, res) {
    await am.deleteAllAccounts();
    res.redirect('/users');
  });

  /* istanbul ignore else */
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

  /* istanbul ignore next */
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
    res.end();
  });

  app.get('*', async function (req, res) {
    const _ = await setI18n(req, res);
    const title = _('PageNotFound');
    res.status(404).render('404', {
      ...getLayoutAndTitle({_, title, template: '404'})
    });
  });
};

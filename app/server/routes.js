'use strict';

const {join} = require('path');
const express = require('express');

const AccountManager = require('./modules/account-manager.js');
const EmailDispatcher = require('./modules/email-dispatcher.js');

const {isNullish, hasOwn} = require('./modules/common.js');
const setPugI18n = require('./modules/pug-i18n.js')();

module.exports = async function (app, config) {
  const {
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NL_SITE_URL,
    DB_URL,
    DB_NAME,
    SERVE_COVERAGE,
    countries
  } = config;

  const AM = await (new AccountManager({
    DB_URL,
    DB_NAME
  })).connect();
  const ED = new EmailDispatcher({
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NL_SITE_URL
  });

  /*
    login & logout
  */
  app.get('/', async function (req, res) {
    const _ = await setPugI18n(req, res);
    // check if the user has an auto login key saved in a cookie
    if (req.signedCookies.login === undefined) {
      res.render('login', {
        // Todo: Localize these dynamic strings (on server and client)
        title: _('PleaseLoginToAccount')
      });
    } else {
      // attempt automatic login
      let o;
      try {
        o = await AM.validateLoginKey(req.signedCookies.login, req.ip);
      } catch (err) {
      }

      if (o) {
        const _o = await AM.autoLogin(o.user, o.pass);
        req.session.user = _o;
        res.redirect('/home');
      } else {
        res.render('login', {
          title: _('PleaseLoginToAccount')
        });
      }
    }
  });

  app.post('/', async function (req, res) {
    let o;
    try {
      o = await AM.manualLogin(req.body.user, req.body.pass);
    } catch (err) {
      res.status(400).send(err.message);
      return;
    }

    req.session.user = o;
    if (req.body['remember-me'] === 'false') {
      res.status(200).send(o);
    } else {
      const key = await AM.generateLoginKey(o.user, req.ip);
      // `signed` requires `cookie-parser` with express
      res.cookie('login', key, {maxAge: 900000, signed: true});
      res.status(200).send(o);
    }
  });

  app.post('/logout', async function (req, res) {
    res.clearCookie('login');
    const _ = await setPugI18n(req, res);
    req.session.destroy((e) => { res.status(200).send(_('OK')); });
  });

  /*
    control panel
  */
  app.get('/home', async function (req, res) {
    if (isNullish(req.session.user)) {
      res.redirect('/');
    } else {
      const _ = await setPugI18n(req, res);
      res.render('home', {
        title: _('ControlPanel'),
        // Todo: i18nize visible values
        countries,
        udata: req.session.user
      });
    }
  });

  app.post('/home', async function (req, res) {
    if (isNullish(req.session.user)) {
      res.redirect('/');
    } else {
      const {name, email, pass, country} = req.body;
      let o, _;
      try {
        [o, _] = await Promise.all([
          AM.updateAccount({
            id: req.session.user._id,
            name,
            email,
            pass,
            country
          }),
          setPugI18n(req, res)
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
    const _ = await setPugI18n(req, res);
    res.render('signup', {
      title: _('Signup'),
      // Todo: i18nize visible values
      countries
    });
  });

  app.post('/signup', async function (req, res) {
    const {name, email, user, pass, country} = req.body;
    let _;
    try {
      [_] = await Promise.all([
        setPugI18n(req, res),
        AM.addNewAccount({
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
    res.status(200).send(_('OK'));
  });

  /*
    password reset
  */
  app.post('/lost-password', async function (req, res) {
    const {email} = req.body;
    let account, _;
    try {
      [account, _] = await Promise.all([
        AM.generatePasswordKey(email, req.ip),
        setPugI18n(req, res)
      ]);
    } catch (e) {
      res.status(400).send(e.message);
      return;
    }
    try {
      /* const { status, text } = */
      await ED.dispatchResetPasswordLink(account, _);
      // TODO this promise takes a moment to return, add a loader to
      //   give user feedback
      res.status(200).send(_('OK'));
    } catch (_e) {
      for (const k in _e) {
        if (hasOwn(_e, k)) {
          console.log('ERROR:', k, _e[k]);
        }
      }
      res.status(400).send(_('UnableToDispatchPasswordReset'));
    }
  });

  app.get('/reset-password', async function (req, res) {
    let o, _, e;
    try {
      [o, _] = await Promise.all([
        AM.validatePasswordKey(req.query.key, req.ip),
        setPugI18n(req, res)
      ]);
    } catch (err) {
      e = err;
    }
    if (e || isNullish(o)) {
      res.redirect('/');
    } else {
      req.session.passKey = req.query.key;
      res.render('reset', {
        title: _('ResetPassword')
      });
    }
  });

  app.post('/reset-password', async function (req, res) {
    const newPass = req.body.pass;
    const {passKey} = req.session;
    // destory the session immediately after retrieving the stored passkey
    req.session.destroy();
    let o, _;
    try {
      [o, _] = await Promise.all([
        AM.updatePassword(passKey, newPass),
        setPugI18n(req, res)
      ]);
    } catch (err) {}
    if (o) {
      res.status(200).send(_('OK'));
    } else {
      res.status(400).send(_('UnableToUpdatePassword'));
    }
  });

  /*
    view, delete & reset accounts
  */
  app.get('/print', async function (req, res) {
    const [accounts, _] = await Promise.all([
      AM.getAllRecords(),
      setPugI18n(req, res)
    ]);
    res.render('print', {
      title: _('AccountList'),
      // Todo: i18nize?
      accts: accounts
    });
  });

  app.post('/delete', async function (req, res) {
    const _ = await setPugI18n(req, res);
    try {
      /* obj = */ await AM.deleteAccount(req.session.user._id);
    } catch (err) {
      res.clearCookie('login');
      req.session.destroy((_e) => {
        res.status(200).send(_('OK'));
      });
      return;
    }
    res.status(400).send(_('RecordNotFound'));
  });

  app.get('/reset', async function (req, res) {
    await AM.deleteAllAccounts();
    res.redirect('/print');
  });

  if (SERVE_COVERAGE) {
    // SHOW COVERAGE HTML ON SERVER
    // We could add this in a separate file, but we'll leverage express here
    app.use('/coverage', express.static(join(__dirname, '../../coverage')));
  }

  if (global.__coverage__) {
    // See https://github.com/cypress-io/code-coverage

    // ADD APP
    // eslint-disable-next-line node/no-unpublished-require, global-require
    require('@cypress/code-coverage/middleware/express.js')(app);
  }

  app.get('*', async function (req, res) {
    const _ = await setPugI18n(req, res);
    res.render('404', {
      title: _('PageNotFound')
    });
  });
};

'use strict';

/**
  * Node.js Login Boilerplate
  * More Info : https://github.com/braitsch/node-login
  * Copyright (c) 2013-2018 Stephen Braitsch
**/

const http = require('http');
const { join } = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const stylus = require('stylus');

const routes = require('./app/server/routes.js');

const _ = require('./app/server/messages/en/messages.json');

/**
 *
 * @param {string} str
 * @param {PlainObject<string,string>} [data={}] Values for substitution
 * @returns {string}
 */
const substitute = (str, data = {}) => {
  return Object.entries(data).reduce((s, [ky, val]) => {
    // Todo: This only allows one replacement
    return s.replace('${' + ky + '}', val);
  }, str) || str;
};

const getLogger = (options) => {
  /**
   *
   * @param {string} key
   * @param {PlainObject<string,string>} [data={}] Values for substitution
   * @param {...(string|PlainObject)} other Other items to log, e.g., errors
   * @returns {string|null}
   */
  return (key, data = {}, ...other) => {
    if (options.logging === false) {
      return null;
    }
    console.log(substitute(_[key], data), ...other);
    return key;
  };
};

// Todo: Small repo to convert command-line-usage into jsdoc (and
//   use here in place of `PlainObject` `options`)
/**
 * @param {PlainObject} options
 * @returns {Promise<void>}
 */
exports.createServer = async function (options) {
  const log = getLogger(options);
  const app = express();

  const {
    cwd = process.cwd(),
    config = cwd ? `${cwd}/node-login.json` : null
  } = options;

  const cfg = config
    // eslint-disable-next-line global-require, import/no-dynamic-require
    ? require(config)
    : null;

  const {
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NL_SITE_URL,
    DB_NAME = 'node-login',
    secret,
    // eslint-disable-next-line global-require
    countries = require('./app/server/modules/country-list.js'),
    PORT = 3000,
    DB_HOST = 'localhost',
    DB_PORT = 27017,
    DB_USER,
    DB_PASS,
    JS_DIR = '/app/public',
    SERVE_COVERAGE = false
  } = { ...cfg, ...options, config: null };

  app.locals.pretty = true;

  app.set('port', PORT);
  app.set('views', join(__dirname, '/app/server/views'));
  app.set('view engine', 'pug');
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    stylus.middleware({ src: join(__dirname, JS_DIR), sourcemap: true })
  );
  app.use(express.static(join(__dirname, JS_DIR)));

  let DB_URL;
  // build mongo database connection url
  if (app.get('env') !== 'live') {
    DB_URL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  // prepend url with authentication credentials
  } else {
    DB_URL = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }

  app.use(session({
    secret,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: DB_URL,
      mongoOptions: { useUnifiedTopology: true, useNewUrlParser: true }
    })
  }));

  await routes(app, {
    countries,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NL_SITE_URL,
    DB_URL,
    DB_NAME,
    SERVE_COVERAGE
  });

  http.createServer(app).listen(app.get('port'), () => {
    // Todo: Add more (i18nized) logging messages and on client,
    //   making log/substitute utilities external or in own repo;
    //   also make i18n tool for optionDefinitions definitions?
    log(_.express_server_listening, { port: app.get('port') });
  });
};

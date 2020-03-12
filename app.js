'use strict';

// Todo: Internationalize attributes like `aria-label`

/**
 * Original project: https://github.com/braitsch/node-login.
 * @copyright (c) 2013-2018 Stephen Braitsch
*/

const http = require('http');
const {join, resolve: pathResolve} = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
// Though not needed for `express-session`, `cookie-parser` is needed for
//   creating signed cookies (see `routes.js`) (or if we were to use
//   non-signed cookies and access `req.cookies`).
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const stylus = require('stylus');
const RateLimit = require('express-rate-limit');

const routes = require('./app/server/routes.js');
const getLogger = require('./app/server/modules/getLogger.js');
const DBFactory = require('./app/server/modules/db-factory.js');
const jmlEngine = require('./app/server/modules/jmlEngine.js');

/**
 * @param {MainOptionDefinitions} options
 * @returns {Promise<void>}
 */
exports.createServer = async function (options) {
  // We can't add an internationaalized log that we are awaiting the loggers!
  const [log, errorLog] = await Promise.all([
    getLogger(options),
    getLogger({...options, errorLog: true})
  ]);
  const app = express();

  const {
    cwd = process.cwd(),
    config = 'nogin.json'
  } = options;

  let cfg;
  try {
    cfg = config
    // eslint-disable-next-line global-require, import/no-dynamic-require
      ? require(pathResolve(cwd, config))
      : null;
  } catch (err) {
    errorLog('noConfigFileDetected', {config});
    return;
  }

  const opts = {...cfg, ...options, config: null};
  const {
    loggerLocale,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    secret,
    countries,
    PORT = 3000,
    JS_DIR = '/app/public',
    staticDir,
    middleware,
    router,
    SERVE_COVERAGE = false,
    RATE_LIMIT = 700,
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    localScripts,
    countryCodes,
    fromText,
    fromURL
  } = opts;

  const dbOpts = DBFactory.getDefaults(opts);

  // Doubles as limiting automated login attempts!
  const limiter = new RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: RATE_LIMIT
  });

  app.locals.pretty = true;

  // We name it "js" instead of "jml" since more convenient for
  //  file extension
  app.engine('js', jmlEngine);
  app.set('port', PORT);
  app.set('views', join(__dirname, '/app/server/views'));
  app.set('view engine', 'js');

  app.use(limiter);
  // Todo: Use https://github.com/ebourmalo/cookie-encrypter also?
  app.use(cookieParser(secret));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(
    stylus.middleware({src: join(__dirname, JS_DIR), sourcemap: true})
  );
  if (JS_DIR !== '/app/public') {
    app.use(express.static(join(__dirname, JS_DIR)));
  }
  app.use(express.static(join(__dirname, '/app/public')));

  if (staticDir) {
    staticDir.forEach((sd) => {
      app.use(express.static(sd));
    });
  }
  if (middleware) {
    middleware.forEach((mw) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      app.use(require(mw)(opts));
    });
  }

  const isProduction = app.get('env') === 'production';

  if (isProduction) {
    if (!dbOpts.DB_USER || !dbOpts.DB_PASS) {
      errorLog('ProductionNeedsUserAndPass');
      return;
    }
  }

  const DB_URL = DBFactory.getURL(
    dbOpts.adapter, isProduction, dbOpts
  );

  // Todo: Make configurable as well as allowing `genid`, `name`,
  //   `rolling`, `unset`?
  const sess = {
    cookie: {
      // Todo: Allow configurability for `domain`, `expires`, `httpOnly`,
      //        `maxAge`, `path`, `sameSite`; see
      //        https://www.npmjs.com/package/express-session
    },
    secret,
    // proxy: true, // `undefined` checks `trust proxy` (see below)
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: DB_URL,
      mongoOptions: {
        useUnifiedTopology: true,
        useNewUrlParser: true
      }
    })
  };

  if (isProduction) {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
  }

  app.use(session(sess));

  log('BeginningRoutes');
  await routes(app, {
    log,
    loggerLocale,
    countries,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    DB_URL,
    SERVE_COVERAGE,
    dbOpts,
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    localScripts,
    countryCodes,
    fromText,
    fromURL,
    // User is using instrumenting
    triggerCoverage: JS_DIR !== '/app/public'
  });

  if (router) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(router)(app, opts);
  }

  log('BeginningServer');
  http.createServer(app).listen(app.get('port'), () => {
    // Todo: Add more (i18nized) logging messages
    //   also make i18n tool for `optionDefinitions` definitions?
    log('express_server_listening', {port: String(app.get('port'))});
  });
};

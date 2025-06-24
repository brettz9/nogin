// Todo: Internationalize attributes like `aria-label`

/**
 * Original project: https://github.com/braitsch/node-login.
 * @copyright (c) 2013-2018 Stephen Braitsch
*/

import * as http from 'http';
import {join, resolve as pathResolve} from 'path';
import express from 'express';
import session from 'express-session';
// Though not needed for `express-session`, `cookie-parser` is needed for
//   creating signed cookies (see `routeList.js`) (or if we were to use
//   non-signed cookies and access `req.cookies`).
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import stylus from 'stylus';
// eslint-disable-next-line import/no-named-as-default -- Bug
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// @ts-expect-error No TS
import hostValidation from 'host-validation';

import routes from './routeList.js';
import getLogger from './modules/getLogger.js';
import DBFactory from './modules/db-factory.js';
import jmlEngine from './modules/jmlEngine.js';
import {parseCLIJSON} from './modules/common.js';
import getDirname from './modules/getDirname.js';

/**
 * These are a subset of the CLI options.
 * @typedef {{
 *   loggerLocale: string,
 *   NL_EMAIL_USER: string,
 *   NL_EMAIL_PASS: string,
 *   NL_EMAIL_HOST: string,
 *   NL_EMAIL_FROM: string,
 *   NS_EMAIL_TIMEOUT: number,
 *   NL_SITE_URL: string,
 *   cwd: string,
 *   localesBasePath: string,
 *   postLoginRedirectPath: string,
 *   customRoute: string[],
 *   rootUser: string[],
 *   crossDomainJSRedirects: boolean,
 *   composeResetPasswordEmailView: string,
 *   composeActivationEmailView: string,
 *   requireName: boolean,
 *   router: string,
 *   fallback: string,
 *   useESM: boolean,
 *   noPolyfill: boolean,
 *   injectHTML: string,
 *   countryCodes: string,
 *   favicon: string,
 *   stylesheet: string,
 *   noBuiltinStylesheets: boolean,
 *   userJS: string,
 *   userJSModule: string,
 *   localScripts: boolean,
 *   fromText: string,
 *   fromURL: string,
 *   SERVE_COVERAGE: boolean,
 *   disableXSRF: boolean,
 *   csurfOptions: string,
 *   signupAgreement?: string|{[locale: string]: string},
 * }} RouteConfigFromOptions
 */

/**
 * @typedef {RouteConfigFromOptions & {
 *   log: import('./modules/getLogger.js').Logger,
 *   DB_URL: string,
 *   opts: import('./optionDefinitions.js').MainOptionDefinitions,
 *   dbOpts: import('./modules/db-factory.js').DbOptions,
 *   triggerCoverage: boolean
 * }} RouteConfig
 */

const __dirname = getDirname(import.meta.url);

/**
 * @param {Partial<import('./optionDefinitions.js').
 *   MainOptionDefinitions>
 * } options
 * @returns {Promise<void>}
 */
const createServer = async function (options) {
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
      // // eslint-disable-next-line no-unsanitized/method -- User path
      ? (await import(pathResolve(cwd, config))).default
      : null;
  } catch {
    errorLog('noConfigFileDetected', {
      // eslint-disable-next-line object-shorthand -- TS
      config: /** @type {string} */ (config)
    });
    return;
  }

  const opts =
    /**
     * @type {import('./optionDefinitions.js').
     *   MainOptionDefinitions}
     */ ({...cfg, ...options, config: null});
  const {
    loggerLocale,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    secret,
    PORT = 3000,
    JS_DIR = '../public',
    staticDir,
    middleware,
    router,
    fallback,
    RATE_LIMIT = 700,
    SERVE_COVERAGE = false,
    composeResetPasswordEmailView,
    composeActivationEmailView,
    injectHTML,
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    localScripts,
    countryCodes,
    fromText,
    fromURL,
    requireName,
    localesBasePath = __dirname,
    useESM,
    noPolyfill,
    postLoginRedirectPath,
    customRoute,
    rootUser,
    crossDomainJSRedirects,
    noHelmet,
    noHostValidation,
    disableXSRF,
    transferLimit,
    sessionCookieOptions = {
      sameSite: 'lax' // Not concerned about strict for GET access
    },
    csurfOptions = {
      cookie: {
        // secure: true, // HTTPS-only
        signed: true,
        // Better to use `strict` but apparently disallows embedded iframe use
        sameSite: 'lax'
      }
    },
    helmetOptions,
    signupAgreement
  } = opts;

  const dbOpts = DBFactory.getDefaults(opts);

  // Doubles as limiting automated login attempts!
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: RATE_LIMIT
  });

  app.locals.pretty = true;

  // We name it "js" instead of "jml" since more convenient for
  //  file extension
  app.engine('js', jmlEngine);
  app.set('port', PORT);
  app.set('views', join(__dirname, '/views'));
  app.set('view engine', 'js');

  app.use(limiter);
  // Todo: Use https://github.com/ebourmalo/cookie-encrypter also?
  app.use(cookieParser(secret));

  // See https://stackoverflow.com/questions/19917401/error-request-entity-too-large
  app.use(express.json({limit: transferLimit ?? '50mb'}));
  app.use(express.urlencoded({extended: true, limit: transferLimit ?? '50mb'}));

  app.use(
    stylus.middleware({src: join(__dirname, JS_DIR), sourcemap: true})
  );
  if (JS_DIR !== '../public') {
    app.use(express.static(join(__dirname, JS_DIR)));
  }
  app.use(express.static(join(__dirname, '../public')));

  if (!noHelmet) {
    app.use(helmet(
      parseCLIJSON(helmetOptions)
    ));
  }

  if (!noHostValidation) {
    app.use(hostValidation({hosts: [
      new URL(NL_SITE_URL).host
    ]}));
  }

  if (staticDir) {
    staticDir.forEach((sd) => {
      app.use(express.static(sd));
    });
  }
  if (middleware) {
    const middlewareImports = await Promise.all(middleware.map(async (mw) => {
      // // eslint-disable-next-line no-unsanitized/method -- User path
      return await import(mw);
    }));

    /**
     * @type {({default: (opts: import('./optionDefinitions.js').
     *   MainOptionDefinitions) => import('express').Application})[]}
     */
    middlewareImports.forEach((imported) => {
      app.use(imported.default(opts));
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
    /** @type {"mongodb"} */ (dbOpts.adapter),
    isProduction,
    /**
     * @type {import('./modules/db-factory.js').
     *   DbConfig}
     */ (dbOpts)
  );

  // Also allowing `genid`, `name`, `rolling`, `unset`?
  const sessionOptions = {
    // proxy: true, // `undefined` checks `trust proxy` (see below)
    resave: true,
    saveUninitialized: true,
    // Not setting the above two is deprecated, so allow just overriding
    ...(opts.sessionOptions ? parseCLIJSON(opts.sessionOptions) : null)
  };

  const sess = {
    secret,
    store: MongoStore.create({
      mongoUrl: DB_URL
    }),
    cookie: parseCLIJSON(sessionCookieOptions),
    ...sessionOptions
  };

  if (isProduction) {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
  }

  app.use(session(sess));

  log('BeginningRoutes');

  await routes(app, /** @type {RouteConfig} */ ({
    log,
    loggerLocale,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS,
    NL_EMAIL_FROM,
    NS_EMAIL_TIMEOUT,
    NL_SITE_URL,
    DB_URL,
    SERVE_COVERAGE,
    composeResetPasswordEmailView,
    composeActivationEmailView,
    dbOpts,
    injectHTML,
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    localScripts,
    countryCodes,
    fromText,
    fromURL,
    requireName,
    router,
    fallback,
    localesBasePath,
    postLoginRedirectPath,
    customRoute,
    rootUser,
    crossDomainJSRedirects,
    cwd,
    useESM,
    disableXSRF,
    csurfOptions,
    noPolyfill,
    opts,
    // If making this customizable, need to set as global for use by
    //  `app/public/js/utilities/ajaxFormClientSideValidate.js`
    // csrfKey: 'csrf-token',
    // User is using instrumenting
    triggerCoverage: JS_DIR !== '../public',
    signupAgreement
  }));

  log('BeginningServer');
  http.createServer(app).listen(app.get('port'), () => {
    // Todo: Add more (i18nized) logging messages
    //   also make i18n tool for `optionDefinitions` definitions?
    log('express_server_listening', {port: String(app.get('port'))});
  });
};

export {createServer};

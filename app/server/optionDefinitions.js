import {readFile} from 'fs/promises';

import commonDefinitions from '../../bin/common-definitions.js';
import dbDefinitions from '../../bin/db-definitions.js';

const pkg = JSON.parse(
  // @ts-expect-error It's ok
  await readFile(new URL('../../package.json', import.meta.url))
);

/**
 * @typedef {{
 *   loggerLocale: string,
 *   noLogging: boolean,
 *   DB_NAME: string,
 *   DB_HOST: string,
 *   DB_PORT: number,
 *   DB_USER: string,
 *   DB_PASS: string,
 *   NL_EMAIL_USER: string,
 *   NL_EMAIL_PASS: string,
 *   NL_EMAIL_HOST: string,
 *   NL_EMAIL_FROM: string,
 *   NS_EMAIL_TIMEOUT: number,
 *   NL_SITE_URL: string,
 *   PORT: number,
 *   secret: string,
 *   cwd: string,
 *   JS_DIR: string,
 *   localesBasePath: string,
 *   postLoginRedirectPath: string,
 *   customRoute: string[],
 *   crossDomainJSRedirects: boolean,
 *   composeResetPasswordEmailView: string,
 *   composeActivationEmailView: string,
 *   requireName: boolean,
 *   staticDir: string[],
 *   middleware: string[],
 *   router: string,
 *   fallback: string,
 *   useESM: boolean,
 *   noPolyfill: boolean,
 *   injectHTML: string,
 *   config: string|null,
 *   countryCodes: string,
 *   adapter: string,
 *   favicon: string,
 *   stylesheet: string,
 *   noBuiltinStylesheets: boolean,
 *   userJS: string,
 *   userJSModule: string,
 *   localScripts: boolean,
 *   fromText: string,
 *   fromURL: string,
 *   SERVE_COVERAGE: boolean,
 *   RATE_LIMIT: number,
 *   disableXSRF: boolean,
 *   noHelmet: boolean,
 *   noHostValidation: boolean,
 *   helmetOptions: string|{noSniff: boolean},
 *   csurfOptions: string,
 *   sessionCookieOptions: string|{
 *     genid: () => number
 *   },
 *   sessionOptions: string|{name: string, secret: string},
 *   transferLimit: string,
 *   rootUser: string[]
 *   signupAgreement?: string|{[locale: string]: string},
 * }} MainOptionDefinitions
 */

/**
 * @param {string} s
 * @returns {string}
 */
const getChalkTemplateEscape = (s) => {
  return s.replaceAll(/[{}\\]/gu, (ch) => {
    return `\\u${
      /** @type {number} */ (ch.codePointAt(0)).toString(16).padStart(4, '0')
    }`;
  });
};

/** @type {import('command-line-usage').OptionDefinition[]} */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  {
    name: 'NL_EMAIL_USER', type: String,
    description: 'Email user. Required; no defaults.',
    typeLabel: '{underline user}'
  },
  {
    name: 'NL_EMAIL_PASS', type: String,
    description: 'Email password (for `NL_EMAIL_USER`). Required; no defaults.',
    typeLabel: '{underline pass}'
  },
  {
    name: 'NL_EMAIL_HOST', type: String,
    description: 'Email host. Required; no defaults.',
    typeLabel: '{underline host}'
  },
  {
    name: 'NL_EMAIL_FROM', alias: 'f', type: String,
    description: 'Email "from". Required; no defaults.',
    typeLabel: '{underline from}'
  },
  {
    name: 'NS_EMAIL_TIMEOUT', type: Number,
    description: 'Millisecond duration for attempting to send emails. ' +
      'Defaults to 5000.',
    typeLabel: '{underline timeout-in-ms}'
  },
  {
    name: 'NL_SITE_URL', type: String,
    description: 'Email site URL. Base URL added within password reset and ' +
      'activation emails. Required; no defaults.',
    typeLabel: '{underline url}'
  },
  {
    name: 'PORT', type: Number,
    description: 'HTTP/S port. Defaults to 3000',
    typeLabel: '{underline port}'
  },
  ...commonDefinitions,
  ...dbDefinitions,
  {
    name: 'secret', type: String,
    description: '`cookieParser` secret. Required; no defaults.',
    typeLabel: '{underline secret}'
  },
  {
    name: 'cwd', type: String,
    description: 'Current working directory; used with `--config`; ' +
      'defaults to `process.cwd()`',
    typeLabel: '{underline cwd path}'
  },
  {
    name: 'JS_DIR', alias: 'd', type: String,
    description: 'Not normally needed; used to point to instrumented path. ' +
      'Defaults to `/app/public`',
    typeLabel: '{underline path}'
  },
  {
    name: 'localesBasePath', type: String,
    description: 'Points to a base path for finding locales. Defaults to ' +
      '`app/server`. Only needed if overriding built-in locales.',
    typeLabel: '{underline path}'
  },
  {
    name: 'postLoginRedirectPath', type: String,
    description: 'Points to a path or URL to which to redirect after users ' +
      'successfully log in. Defaults to `/home` (or locale equivalent). Note ' +
      'that if you are overriding this option, you should provide another ' +
      'means to your users to visit `/home`, e.g., through the ' +
      'accessibility-recommended approach of having a site-wide navigation ' +
      'bar, so as to allow your users to update or delete their accounts. ' +
      'Note that this option will be overridden by any `redirect` query ' +
      'parameter present in the URL.',
    typeLabel: '{underline path or URL}'
  },
  {
    name: 'customRoute', type: String, multiple: true,
    description: 'A convenience to allow overriding the default route name ' +
      'per locale, e.g., `en-US=home=/updateAccount` would change the ' +
      '`/home` path to `/updateAccount` for the `en-US` locale. If present, ' +
      'this will take precedence over the routes in `localesBasePath`.',
    typeLabel: '{underline locale=route=path}'
  },
  {
    name: 'rootUser', type: String, multiple: true,
    description: 'Users who are granted all available privileges to view and ' +
    // Todo: add description as implementing privileges and groups; also
    //        add to README
    'edit users.', // , privileges, and groups.',
    typeLabel: '{underline user}'
  },
  {
    name: 'crossDomainJSRedirects', type: Boolean,
    description: 'Whether to allow cross-domain redirects (for some values ' +
      'set by `customRoute`). Note that the very old Firefox 2 will not ' +
      'be able to make cross-domain redirects regardless of this setting, so ' +
      'it will always use the (safe) locale redirect.'
  },
  {
    name: 'composeResetPasswordEmailView', type: String,
    description: 'Path to a Node file that will be imported. The file must ' +
      'have an ESM default function export that ' +
      'accepts the template options (_, jml, baseurl, name, user, passKey, ' +
      'fromText, fromURL). Defaults to ' +
      '`/app/server/views/composeResetPasswordEmail.js`.',
    typeLabel: '{underline path}'
  },
  {
    name: 'composeActivationEmailView', type: String,
    description: 'Path to a Node file that will be imported. The file must ' +
      'have an ESM default function export that ' +
      'accepts the template options (_, jml, baseurl, name, user, ' +
      'activationCode, fromText, fromURL). Defaults to ' +
      '`/app/server/views/composeActivationEmail.js`.',
    typeLabel: '{underline path}'
  },
  {
    name: 'requireName', type: Boolean,
    description: 'Whether to require a name (separate from user name, as ' +
      'in a real name) from users. Default is `false`.'
  },
  {
    name: 'staticDir', type: String, multiple: true,
    description: 'Point to absolute path at which to serve static files on ' +
      'the same server. Multiple allowed. Not required. To require serving ' +
      'within a particular non-root path, use `router` with Express\' ' +
      '`app.get()` or `app.post`. See https://expressjs.com/en/api.html',
    typeLabel: '{underline absolute path}'
  },
  {
    name: 'middleware', type: String, multiple: true,
    description: 'Path to a Node file that will be imported. The file must ' +
      'have an ESM default function export that will be ' +
      'passed the resolved options. Multiple allowed. Not required. To ' +
      'require serving within a particular non-root path, ' +
      'use `router` with Express\' `app.use()`. See ' +
      'https://expressjs.com/en/api.html#app.use',
    typeLabel: '{underline path}'
  },
  {
    name: 'router', type: String,
    description: 'Path to a Node file that will be imported. The file must ' +
      'have an ESM default function export that will be ' +
      'passed the Express `app` instance and resolved options. Not required.',
    typeLabel: '{underline path}'
  },
  {
    name: 'fallback', type: String,
    description: 'Path to a Node file that will be imported. Use for a file ' +
      'server. The file must have an ESM default function export that will ' +
      'be passed the `req` object, `res` object, and `next` function. ' +
      'Probably required.',
    typeLabel: '{underline path}'
  },
  {
    name: 'useESM', type: Boolean,
    description: 'Mainly for easier debugging. Whether to use browser ESM ' +
      'source modules where available in place of compiled IIFE code. ' +
      'Defaults to `false`.'
  },
  {
    name: 'noPolyfill', type: Boolean,
    description: 'Whether to drop the core-js polyfills for ' +
      'compatibility with older browsers. Defaults to `false`.'
  },
  {
    name: 'injectHTML', type: String,
    description: 'Path to a Node file that will be imported. The file must ' +
      'have an ESM default function export that will be ' +
      'passed a config object, including a `template` string indicating ' +
      'the template being built. Must return an object with any of 4 ' +
      'optional methods (`headPre`, `headPost`, `bodyPre`, and/or ' +
      '`bodyPost`) which should either be an HTML string or an array of ' +
      'Jamilih children to be appended at the given position (or return an ' +
      'empty array to add nothing). Not required.',
    typeLabel: '{underline path}'
  },
  {
    name: 'config', alias: 'c', type: String,
    description: 'Used to set config; when `cwd` is set, defaults to ' +
      '"<cwd>/nogin.json"; of lower priority than other CLI ' +
      'arguments; may also be a JavaScript file (nogin.js).',
    typeLabel: '{underline config path}'
  },
  {
    name: 'countryCodes', type: String,
    description: 'Two-letter country codes as JSON array; defaults to ' +
      'codes in `/app/server/modules/country-codes.json`',
    typeLabel: '{underline country code}'
  },
  {
    name: 'adapter', type: String, alias: 'a',
    description: 'The database adapter to use. Defaults to "mongodb", the ' +
      'only current option.',
    typeLabel: '{underline "mongodb"}'
  },
  {
    name: 'favicon', type: String,
    description: 'The path to a favicon; defaults to blank.',
    typeLabel: '{underline favicon path}'
  },
  {
    name: 'stylesheet', type: String,
    description: 'The path to a custom CSS stylesheet; defaults to no extra ' +
      'stylesheets being used',
    typeLabel: '{underline stylesheet path or URL}'
  },
  {
    name: 'noBuiltinStylesheets', type: Boolean,
    description: 'Whether to suppress addition of built-in stylesheets, ' +
      'Bootstrap, and gh-fork-ribbon.css. Defaults to `false`, i.e., ' +
      'built-in stylesheets are applied.'
  },
  {
    name: 'userJS', type: String,
    description: 'Regular client-side JavaScript file to load after other ' +
      'scripts (none by default)',
    typeLabel: '{underline path or URL}'
  },
  {
    name: 'userJSModule', type: String,
    description: 'ESM client-side JavaScript file to load after other ' +
      'scripts (none by default)',
    typeLabel: '{underline path or URL}'
  },
  {
    name: 'localScripts', type: Boolean,
    description: 'Whether to load framework scripts locally instead of ' +
      'via CDN. Defaults to `false`.'
  },
  {
    name: 'fromText', type: String,
    description: 'Person\'s name to include as from text in email ' +
      'notifications (password resets).',
    typeLabel: '{underline from}'
  },
  {
    name: 'fromURL', type: String,
    description: 'URL of person to include as link on from text in email ' +
      'notifications (password resets).',
    typeLabel: '{underline URL}'
  },
  {
    name: 'SERVE_COVERAGE', alias: 's', type: Boolean,
    description: 'Whether to host coverage within `/coverage`; defaults ' +
      'to `false`.'
  },
  {
    name: 'RATE_LIMIT', alias: 'r', type: Number,
    description: 'Used for mitigating DoS attacks; defaults to 700',
    typeLabel: '{underline rate limit}'
  },
  {
    name: 'disableXSRF', type: Boolean,
    description: 'Disable Cross-site Resource Forgery checking. This ' +
      'setting should normally not be used.'
  },
  {
    name: 'noHelmet', type: Boolean,
    description: 'Disable helmet use entirely. Off by default.'
  },
  {
    name: 'noHostValidation', type: Boolean,
    description: 'Disable hostValidation use entirely. Off by default.'
  },
  {
    name: 'helmetOptions', type: String,
    description: 'Options to be supplied to helmet. Defaults to ' +
      getChalkTemplateEscape(
        '`{frameguard: {action: "SAMEORIGIN"}}`'
      ),
    typeLabel: '{underline options}'
  },
  {
    name: 'csurfOptions', type: String,
    description: 'Options to be supplied to csurf. Defaults to ' +
      getChalkTemplateEscape(
        '`{cookie: {signed: true, sameSite: "lax"}`'
      ) +
      '; you may wish to add `secure: true` to the `cookie` if serving on ' +
      'HTTPS.',
    typeLabel: '{underline options}'
  },
  {
    name: 'sessionCookieOptions', type: String,
    description: 'Options to be supplied to `cookie` of `express-session`.' +
      'Defaults to ' +
      getChalkTemplateEscape(`{sameSite: 'lax'}`),
    typeLabel: '{underline options}'
  },
  {
    name: 'sessionOptions', type: String,
    description: 'Options to be supplied to `express-session`.' +
      'Defaults to ' +
      getChalkTemplateEscape(
        `{resave: true, saveUninitialized: true}` +
        ' along with `cookie: sessionCookieOptions`, `secret`, and ' +
        '`store: MongoStore.create({mongoUrl: DB_URL})`'
      ),
    typeLabel: '{underline options}'
  },
  {
    name: 'transferLimit', type: String,
    description: 'Options to be supplied to `express.json` and ' +
      '`express.urlencoded`. Defaults to 10mb',
    typeLabel: '{underline limit}'
  },
  {
    name: 'signupAgreement', type: String,
    description: 'JSON containing locale-keyed signup agreements. ' +
      'Defaults to no signup agreement.'
  }
];

/**
 * @type {[
 *   import('command-line-usage').Content,
 *   import('command-line-usage').OptionList
 * ]}
 */
const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    content: pkg.description +
      '\n\n{italic nogin [help|' +
      '(add|create|remove|delete|update|view|read)' +
      '] [options]}\n\nRun {italic nogin help <verb>} for the ' +
      'allowable options of the verbs.'
  },
  {
    optionList: optionDefinitions
  }
];

export {optionDefinitions as definitions, cliSections as sections};

'use strict';

const commonDefinitions = require('../../bin/common-definitions.js');
const dbDefinitions = require('../../bin/db-definitions.js');

const pkg = require('../../package.json');

/**
 * @typedef {PlainObject<string,PlainObject>} MainOptionDefinitions
 * @todo Indicate specific properties; small repo to convert
 * `command-line-usage` into jsdoc (and use here)
 */

/**
 * @type {MainOptionDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  {
    name: 'NL_EMAIL_USER', type: String,
    description: 'Email user',
    typeLabel: '{underline user}'
  },
  {
    name: 'NL_EMAIL_PASS', type: String,
    description: 'Email password',
    typeLabel: '{underline pass}'
  },
  {
    name: 'NL_EMAIL_HOST', type: String,
    description: 'Email host; defaults to smtp.gmail.com',
    typeLabel: '{underline host}'
  },
  {
    name: 'NL_EMAIL_FROM', alias: 'f', type: String,
    description: 'Email "from"; defaults to ' +
      '`Node Login <do-not-reply@gmail.com>`',
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
    description: 'Email site URL. Defaults to "http://localhost:3000"',
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
    description: '`cookieParser` secret',
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
    name: 'config', alias: 'c', type: String,
    description: 'Used to set config; when `cwd` is set, defaults to ' +
      '"<cwd>/node-login.json"; of lower priority than other CLI ' +
      'arguments; may also be a JavaScript file (node-login.js).',
    typeLabel: '{underline config path}'
  },
  {
    name: 'noLogging', alias: 'l', type: Boolean,
    description: 'Whether to disable logging; defaults to `false` (logging ' +
      'is enabled).'
  },
  {
    name: 'countryCodes', type: String, multiple: true,
    description: 'Two-letter country codes; defaults to codes in ' +
      '`/app/server/modules/country-codes.json`',
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
      'stylesheets being used'
  },
  {
    name: 'noBuiltinStylesheets', type: Boolean,
    description: 'Whether to suppress addition of built-in stylesheets, ' +
      'Bootstrap, and gh-fork-ribbon.css'
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
    description: 'Used for mitigating DoS attacks; defaults to 100',
    typeLabel: '{underline rate limit}'
  }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    content: pkg.description +
      '\n\n{italic node-login [help|' +
      '(add|create|remove|delete|update|view|read)' +
      '] [options]}\n\nRun {italic node-login help <verb>} for the ' +
      'allowable options of the verbs.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

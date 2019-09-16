'use strict';

// Todo: Add `description` and `typeLabel` (e.g., '{underline argTypeName}')
const optionDefinitions = [
  // multiple: true, defaultOption: true
  { name: 'NL_EMAIL_HOST', type: String },
  { name: 'NL_EMAIL_USER', type: String },
  { name: 'NL_EMAIL_PASS', type: String },
  { name: 'NL_EMAIL_FROM', alias: 'f', type: String },
  { name: 'NL_SITE_URL', type: String },
  { name: 'secret', type: String },
  {
    name: 'config', alias: 'c', type: String,
    description: 'Used to set config; of lower priority than CLI arguments'
  },
  { name: 'logging', alias: 'l', type: Boolean },
  { name: 'countries', type: String },
  { name: 'PORT', type: Number },
  { name: 'DB_NAME', alias: 'n', type: String },
  { name: 'DB_HOST', alias: 't', type: String },
  { name: 'DB_PORT', alias: 'p', type: Number },
  { name: 'DB_USER', alias: 'u', type: String },
  { name: 'DB_PASS', alias: 'x', type: String },
  { name: 'JS_DIR', alias: 'd', type: String },
  { name: 'SERVE_COVERAGE', alias: 's', type: Boolean }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // content: '' // We get this automatically from `package.json` by default
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

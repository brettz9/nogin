'use strict';

const commonDefinitions = require('./common-definitions.js');
const dbDefinitions = require('./db-definitions.js');

/**
 * @typedef {PlainObject<string,PlainObject>} AddOptionDefinitions
 * @todo Indicate specific properties (auto-generate?)
 */

/**
 * @type {AddOptionDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  ...commonDefinitions,
  ...dbDefinitions,
  {
    name: 'cwd', type: String,
    description: 'Current working directory; used with `userFile`; ' +
      'defaults to `process.cwd()`',
    typeLabel: '{underline cwd path}'
  },
  {
    name: 'userFile', multiple: true, type: String,
    description: 'Path to file with account info as JSON object or array of ' +
      'objects. Is not used by default.',
    typeLabel: '{underline path}'
  },
  // `AccountInfo`
  {
    name: 'user', multiple: true, type: String, defaultOption: true,
    description: 'Username to add',
    typeLabel: '{underline username}'
  },
  {
    name: 'name', multiple: true, type: String,
    description: 'Name of user to add',
    typeLabel: '{underline name}'
  },
  {
    name: 'email', multiple: true, type: String,
    description: 'Email address to add',
    typeLabel: '{underline email}'
  },
  {
    name: 'country', multiple: true, type: String,
    description: 'Two digit recognized country code',
    typeLabel: '{underline country code}'
  },
  {
    name: 'pass', multiple: true, type: String,
    description: 'Password to add; will be overwritten with hash',
    typeLabel: '{underline password`}'
  },
  {
    name: 'passVer', multiple: true, type: Number,
    description: 'Auto-generated schema version for password objects. ' +
      'Defaults to `1` and currently only supports `1`.',
    typeLabel: '{underline password-version`}'
  },
  {
    name: 'date', multiple: true, type: Number,
    description: '(Auto-generated) timestamp to add',
    typeLabel: '{underline date-timestamp}'
  },
  {
    name: 'activated', multiple: true, type: Boolean,
    description: '(Auto-set) activated flag to add'
  },
  {
    name: 'activationCode', multiple: true, type: String,
    description: 'Primarily for testing only: (Auto-set) activation code ' +
      'to add',
    typeLabel: '{underline activationCode}'
  },
  {
    name: 'unactivatedEmail', multiple: true, type: String,
    description: 'Primarily for testing only: Email address to which the ' +
      'user wishes to update but which has not yet been activated',
    typeLabel: '{underline email}'
  },
  {
    name: 'activationRequestDate', multiple: true, type: Number,
    description: 'Primarily for testing only: (Auto-set) request date used ' +
      'to determine if activation has expired by time an individual visits ' +
      'the email.',
    typeLabel: '{underline timestamp integer}'
  },
  {
    name: 'passKey', multiple: true, type: String,
    description: '(Auto-set) (Temporary) password key to add',
    typeLabel: '{underline passKey}'
  },
  {
    name: 'ip', multiple: true, type: String,
    description: '(Auto-set) IP address to add',
    typeLabel: '{underline ip}'
  },
  {
    name: 'cookie', multiple: true, type: String,
    description: '(Auto-set) cookie to add',
    typeLabel: '{underline cookie}'
  },
  {
    name: '_id', multiple: true, type: String,
    description: '(Auto-set) id to add',
    typeLabel: '{underline id}'
  }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // We get this automatically from `package.json` by default
    content: 'Add the specified user account to the database.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

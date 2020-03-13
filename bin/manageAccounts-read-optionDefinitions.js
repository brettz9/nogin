'use strict';

const commonDefinitions = require('./common-definitions.js');
const dbDefinitions = require('./db-definitions.js');

/**
 * @typedef {PlainObject<string,PlainObject>} ReadOptionDefinitions
 * @todo Indicate specific properties (auto-generate?)
 */

/**
 * @type {ReadOptionDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  ...commonDefinitions,
  ...dbDefinitions,
  // `AccountInfo`
  {
    name: 'user', multiple: true, type: String, defaultOption: true,
    description: 'Username to query',
    typeLabel: '{underline username}'
  },
  {
    name: 'name', multiple: true, type: String,
    description: 'Name of user to query',
    typeLabel: '{underline name}'
  },
  {
    name: 'email', multiple: true, type: String,
    description: 'Email address to query',
    typeLabel: '{underline email}'
  },
  {
    name: 'pass', multiple: true, type: String,
    description: 'Password to query',
    typeLabel: '{underline password`}'
  },
  {
    name: 'passVer', multiple: true, type: Number,
    description: 'Auto-generated schema version for password objects to query.',
    typeLabel: '{underline password-version`}'
  },
  {
    name: 'date', multiple: true, type: Number,
    description: '(Auto-generated) timestamp to query',
    typeLabel: '{underline date-timestamp}'
  },
  {
    name: 'activationCode', multiple: true, type: String,
    description: '(Auto-set) activation code to query',
    typeLabel: '{underline activationCode}'
  },
  {
    name: 'activated', multiple: true, type: Boolean,
    description: '(Auto-set) activated flag to query'
  },
  {
    name: 'passKey', multiple: true, type: String,
    description: '(Auto-set) (Temporary) password key to read',
    typeLabel: '{underline passKey}'
  },
  {
    name: 'ip', multiple: true, type: String,
    description: '(Auto-set) IP address to read',
    typeLabel: '{underline ip}'
  },
  {
    name: 'cookie', multiple: true, type: String,
    description: '(Auto-set) cookie to read',
    typeLabel: '{underline cookie}'
  },
  {
    name: '_id', multiple: true, type: String,
    description: '(Auto-set) id to read',
    typeLabel: '{underline id}'
  }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // We get this automatically from `package.json` by default
    content: 'Read the specified user account from the database.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

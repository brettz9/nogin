'use strict';

const commonDefinitions = require('./common-definitions.js');
const dbDefinitions = require('./db-definitions.js');

/**
 * @typedef {PlainObject<string,PlainObject>} UpdateOptionDefinitions
 * @todo Indicate specific properties (auto-generate?)
 */

/**
 * @type {UpdateOptionDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  ...commonDefinitions,
  ...dbDefinitions,
  // `AccountInfo`
  {
    name: 'user', multiple: true, type: String, defaultOption: true,
    description: 'Username to update',
    typeLabel: '{underline username}'
  },
  {
    name: 'name', multiple: true, type: String,
    description: 'Name of user to update',
    typeLabel: '{underline name}'
  },
  {
    name: 'email', multiple: true, type: String,
    description: 'Email address to update',
    typeLabel: '{underline email}'
  },
  {
    name: 'pass', multiple: true, type: String,
    description: 'Password to update',
    typeLabel: '{underline password`}'
  },
  {
    name: 'passVer', multiple: true, type: Number,
    description: 'Auto-generated schema version for password objects ' +
      'to update.',
    typeLabel: '{underline password-version`}'
  },
  {
    name: 'date', multiple: true, type: Number,
    description: '(Auto-generated) timestamp to update',
    typeLabel: '{underline date-timestamp}'
  },
  {
    name: 'activationCode', multiple: true, type: String,
    description: '(Auto-set) activation code to update',
    typeLabel: '{underline activationCode}'
  },
  {
    name: 'activated', multiple: true, type: Boolean,
    description: '(Auto-set) activated flag to update'
  },
  {
    name: 'passKey', multiple: true, type: String,
    description: '(Auto-set) (Temporary) password key to update',
    typeLabel: '{underline passKey}'
  },
  {
    name: 'ip', multiple: true, type: String,
    description: '(Auto-set) IP address to update',
    typeLabel: '{underline ip}'
  },
  {
    name: 'cookie', multiple: true, type: String,
    description: '(Auto-set) cookie to update',
    typeLabel: '{underline cookie}'
  },
  {
    name: '_id', multiple: true, type: String,
    description: '(Auto-set) id to update',
    typeLabel: '{underline id}'
  }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // We get this automatically from `package.json` by default
    content: 'Update the specified user account in the database.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

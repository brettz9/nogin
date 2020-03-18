'use strict';

const commonDefinitions = require('./common-definitions.js');
const dbDefinitions = require('./db-definitions.js');

/**
 * @typedef {PlainObject<string,PlainObject>} RemoveOptionDefinitions
 * @todo Indicate specific properties (auto-generate?)
 */

/**
 * @type {RemoveOptionDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  ...commonDefinitions,
  ...dbDefinitions,
  // `AccountInfo`
  {
    name: 'user', multiple: true, type: String, defaultOption: true,
    description: 'Username to remove',
    typeLabel: '{underline username}'
  },
  {
    name: 'name', multiple: true, type: String,
    description: 'Name of user to remove',
    typeLabel: '{underline name}'
  },
  {
    name: 'email', multiple: true, type: String,
    description: 'Email address to remove',
    typeLabel: '{underline email}'
  },
  {
    name: 'country', multiple: true, type: String,
    description: 'Two digit recognized country code',
    typeLabel: '{underline country code}'
  },
  {
    name: 'pass', multiple: true, type: String,
    description: 'Password to remove; will be overwritten with hash',
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
    description: '(Auto-generated) timestamp to remove',
    typeLabel: '{underline date-timestamp}'
  },
  {
    name: 'activated', multiple: true, type: Boolean,
    description: '(Auto-set) activated flag to remove'
  },
  {
    name: 'activationCode', multiple: true, type: String,
    description: 'Primarily for testing only: (Auto-set) activation code ' +
      'to remove',
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
    description: '(Auto-set) (Temporary) password key to remove',
    typeLabel: '{underline passKey}'
  },
  {
    name: 'ip', multiple: true, type: String,
    description: '(Auto-set) IP address to remove',
    typeLabel: '{underline ip}'
  },
  {
    name: 'cookie', multiple: true, type: String,
    description: '(Auto-set) cookie to remove',
    typeLabel: '{underline cookie}'
  },
  {
    name: '_id', multiple: true, type: String,
    description: '(Auto-set) id to remove',
    typeLabel: '{underline id}'
  },
  {
    name: 'all', type: Boolean,
    description: 'Required to indicate that wish to remove all accounts. ' +
      'Will otherwise err if no `user` is provided. Not used by default.'
  }
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // We get this automatically from `package.json` by default
    content: 'Remove the specified user account from the database.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

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
    name: 'country', multiple: true, type: String,
    description: 'Two digit recognized country code',
    typeLabel: '{underline country code}'
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
    name: 'activated', multiple: true, type: Boolean,
    description: '(Auto-set) activated flag to update'
  },
  {
    name: 'activationCode', multiple: true, type: String,
    description: 'Primarily for testing only: (Auto-set) activation code ' +
      'to update',
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
    content: 'Update the specified user account (indicated by `user`) ' +
      'in the database.'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

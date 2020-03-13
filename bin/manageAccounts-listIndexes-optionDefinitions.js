'use strict';

const commonDefinitions = require('./common-definitions.js');
const dbDefinitions = require('./db-definitions.js');

/**
 * @typedef {PlainObject<string,PlainObject>} ListIndexesDefinitions
 * @todo Indicate specific properties (auto-generate?)
 */

/**
 * @type {ListIndexesDefinitions}
 */
const optionDefinitions = [
  // multiple: true, defaultOption: true
  ...commonDefinitions,
  ...dbDefinitions
];

const cliSections = [
  {
    // Add italics: `{italic textToItalicize}`
    // We get this automatically from `package.json` by default
    content: 'List the nogin database\'s indexes'
  },
  {
    optionList: optionDefinitions
  }
];

exports.definitions = optionDefinitions;
exports.sections = cliSections;

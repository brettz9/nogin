import commonDefinitions from './common-definitions.js';
import dbDefinitions from './db-definitions.js';

/**
 * @typedef {import('./common-definitions.js').CommonDefinitions &
 *   import('./db-definitions.js').DbDefinitions
 * } ListIndexesDefinitions
 */

/**
 * @type {import('command-line-usage').
 *   OptionDefinition[]}
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

export {optionDefinitions as definitions, cliSections as sections};

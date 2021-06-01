#!/usr/bin/env node
'use strict';

const {cliBasics} = require('command-line-basics');
const getLogger = require('../app/server/modules/getLogger.js');

const {createServer} = require('../app.js');

/**
 * @returns {MainOptionDefinitions}
 */
function getOptions () {
  return cliBasics({
    optionsPath: '../app/server/optionDefinitions.js',
    cwd: __dirname
  });
}

/**
 * @returns {void}
 */
async function noVerb () {
  const options = getOptions();
  if (!options) {
    return;
  }

  try {
    await createServer(options);
  } catch (err) {
    console.error(err);
  }
}

(async () => {
let verb = process.argv[2];
switch (verb) {
case 'help':
  verb = process.argv[3];
  if (!verb) {
    process.argv[2] = '--help';
    await noVerb();
    return;
  }
  process.argv[2] = verb;
  process.argv[3] = '--help';
  // Fallthrough
case 'view':
case 'read':
case 'update':
case 'delete':
case 'remove':
case 'create':
case 'listIndexes':
case 'add':
  (async () => {
    // Avoid reprocessing verb (e.g., treating it as first default value)
    process.argv.splice(2, 1);

    const idx = process.argv.indexOf('--loggerLocale');
    const loggerLocale = idx > -1
      ? process.argv[idx + 1]
      : 'en-US';

    try {
      // eslint-disable-next-line node/global-require
      const manageAccounts = require('./manage-accounts.js');
      await manageAccounts(verb, {loggerLocale});
    } catch (err) {
      const errorLogger = await getLogger({loggerLocale, errorLog: true});
      errorLogger('Erred', null, err);
    }
    process.exit();
  })();
  break;
default: {
  await noVerb();
  break;
}
}
})();

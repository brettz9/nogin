#!/usr/bin/env node

import {cliBasics} from 'command-line-basics';
import getLogger from '../app/server/modules/getLogger.js';
import getDirname from '../app/server/modules/getDirname.js';
import {createServer} from '../app.js';
import manageAccounts from './manage-accounts.js';

const __dirname = getDirname(import.meta.url);

/**
 * @returns {Promise<MainOptionDefinitions>}
 */
async function getOptions () {
  return await cliBasics({
    optionsPath: '../app/server/optionDefinitions.js',
    cwd: __dirname
  });
}

/**
 * @returns {void}
 */
async function noVerb () {
  const options = await getOptions();
  if (!options) {
    return;
  }

  try {
    await createServer(options);
  } catch (err) {
    console.error(err);
  }
}

let verb = process.argv[2];
switch (verb) {
case 'help':
  verb = process.argv[3];
  if (!verb) {
    process.argv[2] = '--help';
    await noVerb();
    break;
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
case 'add': {
  // Avoid reprocessing verb (e.g., treating it as first default value)
  process.argv.splice(2, 1);

  const idx = process.argv.indexOf('--loggerLocale');
  const loggerLocale = idx > -1
    ? process.argv[idx + 1]
    : 'en-US';

  try {
    await manageAccounts(verb, {loggerLocale});
  } catch (err) {
    const errorLogger = await getLogger({loggerLocale, errorLog: true});
    errorLogger('Erred', null, err);
  }
  process.exit();
  break;
} default: {
  await noVerb();
  break;
}
}

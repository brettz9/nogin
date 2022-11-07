/**
 * @file Utility for running basic database CRUD commands for accounts
 * and setting specific kinds of account data. Wraps credentials/set-up
 * with `AccountManager` commands.
 */

import {readFile as readFileOrig} from 'fs';
import {resolve as pathResolve} from 'path';
import {promisify} from 'util';
import AccountManager from './account-manager.js';
import DBFactory from './db-factory.js';
import getLogger from './getLogger.js';
import {i18n} from './i18n.js';

const setI18n = i18n();

const readFile = promisify(readFileOrig);

/**
 * @param {DbConfig} options
 * @returns {Promise<AccountManager>}
 */
const getAccountManager = async (options) => {
  const dbOpts = DBFactory.getDefaults(options);
  const {adapter, DB_USER, DB_PASS, DB_NAME} = dbOpts;

  const DB_URL = DBFactory.getURL(
    adapter,
    DB_USER || DB_PASS,
    dbOpts
  );

  const [_, log] = await Promise.all([
    setI18n({
      acceptsLanguages: () => [options.loggerLocale || 'en-US']
    }),
    getLogger(options)
  ]);

  return (new AccountManager(adapter, {
    DB_URL,
    DB_NAME,
    _,
    log
  }).connect());
};

/**
 * @param {AddOptionDefinitions|UpdateOptionDefinitions} options
 * @param {boolean} update
 * @returns {Promise<AccountInfo[]>}
 */
async function getAccounts (options, update) {
  if (options.userFile) {
    return (await Promise.all(
      options.userFile.map((uf) => {
        return readFile(
          pathResolve(options.cwd || process.cwd(), uf),
          'utf8'
        );
      })
    )).flat().flatMap((fileContents) => {
      return JSON.parse(fileContents);
    });
  }

  const {
    user: users,
    email,
    pass
  } = options;
  return users.map((user, i) => {
    if (!update) {
      if (!pass || !pass[i]) {
        throw new TypeError(
          `A \`pass\` argument must be provided with \`user\`; ` +
          `for user "${user}" index ${i}`
        );
      }
      if (!email || !email[i]) {
        throw new TypeError(
          `An \`email\` argument must be provided with \`user\`; ` +
          `for user "${user}" index ${i}`
        );
      }
    }

    const ret = {
      user
    };
    [
      'name', 'email', 'country', 'pass', 'passVer',
      'date', 'activated',
      // These would mostly just be for testing
      'activationCode',
      'unactivatedEmail', 'activationRequestDate'
    ].forEach((prop) => {
      const obj = options[prop];
      if (obj && obj[i]) {
        ret[prop] = obj[i];
      }
    });

    return ret;
  });
}

/**
 * @param {AddOptionDefinitions} options
 * @returns {Promise<AccountInfo[]>}
 */
const addAccounts = async (options) => {
  const accounts = await getAccounts(options);
  const am = await getAccountManager(options);
  return Promise.all(
    accounts.map((acct) => {
      return am.addNewAccount(acct, {allowCustomPassVer: true});
    })
  );
};

/**
 * This method differs in that it only searches by `user`
 * and the other params are used to update. This might be
 * refactored to allow searching by multiple values for an
 * update as well as setting multiple other values (whether
 * for the same fields or not).
 * @param {UpdateOptionDefinitions} options
 * @returns {Promise<AccountInfo[]>}
 */
const updateAccounts = async (options) => {
  const accounts = await getAccounts(options, true);
  const am = await getAccountManager(options);
  return Promise.all(
    accounts.map(async (acct) => {
      await am.updateAccount(acct, {forceUpdate: true});
      return acct;
    })
  );
};

/**
 * @param {RemoveOptionDefinitions|ReadOptionDefinitions} options
 * @returns {AccountInfoFilter}
 */
function getAccountInfo (options) {
  const info = {};
  [
    'user', 'name', 'email', 'country', 'pass', 'passVer', 'date',
    'activated',
    'activationCode', 'unactivatedEmail', 'activationRequestDate'
    // Todo: Add 'passKey', 'ip', 'cookie', and '_id' (here and in
    //  `getAccounts` and `AccountInfoFilter` typedef)?
  ].forEach((prop) => {
    if (options[prop]) {
      info[prop] = {$in: options[prop]};
    }
  });
  return info;
}

/**
 * @param {RemoveOptionDefinitions} options
 * @returns {Promise<DeleteWriteOpResult>}
 */
const removeAccounts = async (options) => {
  const am = await getAccountManager(options);
  if (options.all) {
    return am.deleteAllAccounts();
  }
  return am.deleteAccounts(getAccountInfo(options));
};

/**
 * @param {ReadOptionDefinitions} [options]
 * @returns {Promise<AccountInfo[]>}
 */
const readAccounts = async (options = {}) => {
  const am = await getAccountManager(options);
  if (options.user) {
    return am.getRecords(getAccountInfo(options));
  }
  return am.getAllRecords();
};

/**
* @typedef {DbConfig} ValidateUserPasswordOptionDefinitions
* @param {string} user
* @param {string} pass
*/

/**
 * Could be a use for this on CLI, but less likely.
 * @param {ValidateUserPasswordOptionDefinitions} options
 * @returns {Promise<AccountInfo>}
 */
const validUserPassword = async (options) => {
  const am = await getAccountManager(options);
  const {user, pass} = options;
  return am.manualLogin(user, pass);
};

/**
 * Logs indexes.
 * @param {DbConfig} options
 * @returns {Promise<void>}
 */
const listIndexes = async (options) => {
  const am = await getAccountManager(options);
  return am.listIndexes();
};

export {
  getAccountManager,
  addAccounts, updateAccounts,
  removeAccounts, readAccounts, validUserPassword, listIndexes
};

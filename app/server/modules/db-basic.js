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

/**
 * @typedef {"name"|"email"|"country"|"pass"|"passVer"|
 *   "date"|"activated"|"activationCode"|"unactivatedEmail"|
 *   "activationRequestDate"} OtherAccountProperty
 */

const setI18n = i18n();

const readFile = promisify(readFileOrig);

/**
 * @param {import('./db-factory.js').DbConfig &
 *  import('../../../bin/common-definitions.js').CommonDefinitions} options
 * @returns {Promise<AccountManager>}
 */
const getAccountManager = async (options) => {
  const dbOpts = DBFactory.getDefaults(options);
  const {adapter, DB_USER, DB_PASS, DB_NAME} = dbOpts;

  const DB_URL = DBFactory.getURL(
    adapter,
    Boolean(DB_USER || DB_PASS),
    dbOpts
  );

  const [_, log] = await Promise.all([
    setI18n({
      // @ts-expect-error Why doesn't this work with first overload?
      acceptsLanguages: () => [
        options.loggerLocale || 'en-US'
      ]
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
 * @param {import('../../../bin/manageAccounts-add-optionDefinitions.js').
 *   AddOptionDefinitions|
 * import('../../../bin/manageAccounts-update-optionDefinitions.js').
 *   UpdateOptionDefinitions} options
 * @param {boolean} [update]
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
 */
async function getAccounts (options, update) {
  if ('userFile' in options && options.userFile) {
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
  return /** @type {string[]} */ (users).map((user, i) => {
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

    /** @type {Partial<import('./account-manager.js').AccountInfo>} */
    const ret = {
      user
    };
    [
      'name', 'email', 'country', 'pass', 'passVer',
      'date', 'activated',
      // These would mostly just be for testing
      'activationCode',
      'unactivatedEmail', 'activationRequestDate'
    ].forEach((pr) => {
      const prop =
        /**
         * @type {OtherAccountProperty}
         */ (pr);
      const obj = options[prop];
      if (obj && i in obj) {
        // @ts-expect-error Why is this problematic?
        ret[prop] = obj[i];
      }
    });

    return /** @type {import('./account-manager.js').AccountInfo} */ (
      ret
    );
  });
}

/**
 * @param {import('../../../bin/manageAccounts-add-optionDefinitions.js').
 *   AddOptionDefinitions} options
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
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
 * @param {import('../../../bin/manageAccounts-update-optionDefinitions.js').
 *   UpdateOptionDefinitions} options
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
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
 * @param {import('../../../bin/manageAccounts-remove-optionDefinitions.js').
 *   RemoveOptionDefinitions|
 * import('../../../bin/manageAccounts-read-optionDefinitions.js').
 *   ReadOptionDefinitions} options
 * @returns {import('./account-manager.js').AccountInfoFilter}
 */
function getAccountInfo (options) {
  /**
   * @type {{
   *   [key: string]: {$in: string[]|number[]|boolean[]|undefined}
   * }}
   */
  const info = {};
  [
    'user', 'name', 'email', 'country', 'pass', 'passVer', 'date',
    'activated',
    'activationCode', 'unactivatedEmail', 'activationRequestDate'
    // Todo: Add 'passKey', 'ip', 'cookie', and '_id' (here and in
    //  `getAccounts` and `AccountInfoFilter` typedef)?
  ].forEach((pr) => {
    const prop =
      /**
       * @type {"user"|OtherAccountProperty}
       */ (pr);
    if (options[prop]) {
      info[prop] = {$in: options[prop]};
    }
  });
  return /** @type {import('./account-manager.js').AccountInfoFilter} */ (
    info
  );
}

/**
 * @param {import('../../../bin/manageAccounts-remove-optionDefinitions.js').
 *   RemoveOptionDefinitions & {
 *   all?: boolean
 * }} options
 * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
 */
const removeAccounts = async (options) => {
  const am = await getAccountManager(options);
  if (options.all) {
    return am.deleteAllAccounts();
  }
  return am.deleteAccounts(getAccountInfo(options));
};

/**
 * @param {import('../../../bin/manageAccounts-read-optionDefinitions.js').
 *   ReadOptionDefinitions} [options]
 * @returns {Promise<Partial<import('./account-manager.js').AccountInfo>[]>}
 */
const readAccounts = async (options = {}) => {
  const am = await getAccountManager(options);
  if (options.user) {
    return am.getRecords(getAccountInfo(options));
  }
  return am.getAllRecords();
};

/**
 * @typedef {import('./db-factory.js').
 *  DbConfig & {
 *   user: string,
 *   pass: string
 * }} ValidateUserPasswordOptionDefinitions
 */

/**
 * Could be a use for this on CLI, but less likely.
 * @param {ValidateUserPasswordOptionDefinitions} options
 * @returns {Promise<Partial<import('./account-manager.js').AccountInfo>>}
 */
const validUserPassword = async (options) => {
  const am = await getAccountManager(options);
  const {user, pass} = options;
  return am.manualLogin(user, pass);
};

/**
 * Logs indexes.
 * @param {import('./db-factory.js').DbConfig} options
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

'use strict';

/**
 * @file Utility for running basic database CRUD commands for accounts
 * and setting specific kinds of account data. Wraps credentials/set-up
 * with `AccountManager` commands.
 */

const {readFile: readFileOrig} = require('fs');
const {resolve: pathResolve} = require('path');
const {promisify} = require('util');
const AccountManager = require('./account-manager.js');
const DBFactory = require('./db-factory.js');
const getLogger = require('./getLogger.js');
const {i18n} = require('./i18n.js');

const setI18n = i18n();

const readFile = promisify(readFileOrig);

/**
 * @param {DbConfig} options
 * @returns {Promise<AccountManager>}
 */
const getAccountManager = exports.getAccountManager = async (options) => {
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
    name,
    user: users,
    email,
    country,
    pass,
    passVer,
    date,
    activated,
    // These would mostly just be for testing
    activationCode,
    unactivatedEmail,
    activationRequestDate
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
    return {
      user,
      name: name && name[i],
      email: email && email[i],
      country: country && country[i],
      pass: pass && pass[i],
      passVer: passVer && passVer[i],
      date: date && date[i],
      activated: activated && activated[i],
      activationCode: activationCode && activationCode[i],
      unactivatedEmail: unactivatedEmail && unactivatedEmail[i],
      activationRequestDate: activationRequestDate && activationRequestDate[i]
    };
  });
}

/**
 * @param {AddOptionDefinitions} options
 * @returns {Promise<AccountInfo[]>}
 */
exports.addAccounts = async (options) => {
  const accounts = await getAccounts(options);
  const am = await getAccountManager(options);
  return Promise.all(
    accounts.map((acct) => {
      return am.addNewAccount(acct, {allowCustomPassVer: true});
    })
  );
};

/**
 * Thismethod differs in that it only searches by `user`
 * and the other params are used to update. This might be
 * refactored to allow searching by multiple values for an
 * update as well as setting multiple other values (whether
 * for the same fields or not).
 * @param {UpdateOptionDefinitions} options
 * @returns {Promise<AccountInfo[]>}
 */
exports.updateAccounts = async (options) => {
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
exports.removeAccounts = async (options) => {
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
exports.readAccounts = async (options = {}) => {
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
exports.validUserPassword = async (options) => {
  const am = await getAccountManager(options);
  const {user, pass} = options;
  return am.manualLogin(user, pass);
};

/**
 * Logs indexes.
 * @param {DbConfig} options
 * @returns {Promise<void>}
 */
exports.listIndexes = async (options) => {
  const am = await getAccountManager(options);
  return am.listIndexes();
};

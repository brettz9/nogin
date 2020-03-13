'use strict';

/**
 * @file Utility for running basic database CRUD commands for accounts
 * and setting specific kinds of account data. Wraps credentials/set-up
 * with `AccountManager` commands.
 */

// Todo[engine:node@>=12.0.0]: Remove flat/flatMap polyfill
require('array-flat-polyfill');

const {readFile: readFileOrig} = require('fs');
const {resolve: pathResolve} = require('path');
const {promisify} = require('util');
const AccountManager = require('./account-manager.js');
const DBFactory = require('./db-factory.js');
const getLogger = require('./getLogger.js');
const setI18n = require('./i18n.js')();

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
      acceptsLanguages: () => options.loggerLocale || 'en-US'
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
    email,
    country,
    pass,
    passVer,
    date,
    activationCode,
    activated
  } = options;
  return options.user.map((user, i) => {
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
      activationCode: activationCode && activationCode[i],
      activated: activated && activated[i]
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
      return am.addNewAccount(acct);
    })
  );
};

/**
 * @param {UpdateOptionDefinitions} options
 * @returns {Promise<AccountInfo[]>}
 */
exports.updateAccounts = async (options) => {
  const accounts = await getAccounts(options, true);
  const am = await getAccountManager(options);
  return Promise.all(
    accounts.map(async (acct) => {
      await am.updateAccount(acct, true);
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
    'activationCode', 'activated'
    // Todo: Add 'passKey', 'ip', 'cookie', and '_id' (here and in
    //  `getAccounts`)?
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
* @typedef {DbConfig} GenerateLoginOptionDefinitions
* @property {string|string[]} user
* @property {string|string[]} ip
*/

/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a login key since that key should really only be
 * useful in a browser.
 * @param {GenerateLoginOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
exports.generateLoginKeys = async (options) => {
  const am = await getAccountManager(options);
  const {ip, user} = options;
  const users = Array.isArray(user) ? user : [user];
  const ips = Array.isArray(ip) ? ip : [ip];
  return Promise.all(
    users.map((usr, i) => {
      return am.generateLoginKey(usr, ips[i]);
    })
  );
};

/**
* @typedef {DbConfig} GeneratePasswordOptionDefinitions
* @property {string|string[]} email
* @property {string|string[]} ip
*/

/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a password key since that key should really only be
 * useful in a browser.
 * @param {GeneratePasswordOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
exports.generatePasswordKey = async (options) => {
  const am = await getAccountManager(options);
  const {email, ip} = options;
  const emails = Array.isArray(email) ? email : [email];
  const ips = Array.isArray(ip) ? ip : [ip];
  return Promise.all(
    emails.map(async (eml, i) => {
      const {passKey} = await am.generatePasswordKey(eml, ips[i]);
      return passKey;
    })
  );
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

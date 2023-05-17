import {cliBasics} from 'command-line-basics';
import getLogger from '../app/server/modules/getLogger.js';
import {
  addAccounts, removeAccounts, readAccounts, updateAccounts, listIndexes
} from '../app/server/modules/db-basic.js';
import getDirname from '../app/server/modules/getDirname.js';

const __dirname = getDirname(import.meta.url);

/**
 * @typedef {"view"|"read"|"delete"|"remove"|"update"|"listIndexes"|
 *   "create"|"add"} ManageAccountVerb
 */

/**
 * @param {ManageAccountVerb} verb
 * @param {import('../app/server/modules/getLogger.js').LoggerOptions} cfg
 * @returns {Promise<void>}
 */
const manageAccounts = async (verb, {loggerLocale}) => {
  const [log, errorLogger] = await Promise.all([
    getLogger({loggerLocale}),
    getLogger({loggerLocale, errorLog: true})
  ]);
  let method;
  switch (verb) {
  case 'view':
  case 'read':
    verb = 'read';
    /**
     * @param {import('./manageAccounts-read-optionDefinitions.js').
     *   ReadOptionDefinitions} options
     * @returns {Promise<void>}
     */
    method = async (options) => {
      const accts = await readAccounts(options);
      accts.forEach((acct) => {
        log('Account', {
          acct: JSON.stringify(acct, null, 2)
        });
      });
    };
    break;
  case 'delete':
  case 'remove':
    verb = 'remove';
    /**
     * @param {import('./manageAccounts-remove-optionDefinitions.js').
     *   RemoveOptionDefinitions} options
     * @returns {Promise<void>}
     */
    method = async (options) => {
      const {deletedCount} = await removeAccounts(options);
      log('RemovedAccounts', {deletedCount});
    };
    break;
  case 'update':
    /**
     * @param {import('./manageAccounts-update-optionDefinitions.js').
     *   UpdateOptionDefinitions} options
     * @returns {Promise<void>}
     */
    method = async (options) => {
      const accts = await updateAccounts(options);
      log('UpdatedAccounts', {
        acctLength: accts.length,
        accts: accts.map((acct) => {
          return acct.user;
        }).join(log._('AccountJoiner'))
      });
    };
    break;
  case 'listIndexes':
    /**
     * @param {import('../app/server/modules/db-factory.js').
     *   DbConfig} options
     * @returns {Promise<void>}
     */
    method = async (options) => {
      await listIndexes(options);
    };
    break;
  case 'create':
  case 'add': {
    verb = 'add';
    /**
     * @param {import('./manageAccounts-add-optionDefinitions.js').
     *   AddOptionDefinitions} options
     * @returns {Promise<void>}
     */
    method = async (options) => {
      const accts = await addAccounts(options);
      log('AddedAccounts', {
        acctLength: accts.length,
        accts: accts.map((acct) => {
          return acct.user;
        }).join(log._('AccountJoiner'))
      });
    };
    break;
  }
  default:
    throw new TypeError(`Unknown verb ${verb}`);
  }

  const options = await cliBasics({
    optionsPath: `./manageAccounts-${verb}-optionDefinitions.js`,
    cwd: __dirname
  });
  if (!options) {
    return;
  }
  /**
   * @typedef {any} AnyOptions
   */
  try {
    await method(/** @type {AnyOptions} */ (options));
  } catch (err) {
    errorLogger('Erred', null, /** @type {Error} */ (err));
    // return;
  }
};

export default manageAccounts;

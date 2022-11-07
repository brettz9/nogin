import {cliBasics} from 'command-line-basics';
import getLogger from '../app/server/modules/getLogger.js';
import {
  addAccounts, removeAccounts, readAccounts, updateAccounts, listIndexes
} from '../app/server/modules/db-basic.js';
import getDirname from '../app/server/modules/getDirname.js';

const __dirname = getDirname(import.meta.url);

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
    method = async (options) => {
      const {deletedCount} = await removeAccounts(options);
      log('RemovedAccounts', {deletedCount});
    };
    break;
  case 'update':
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
    method = async (options) => {
      await listIndexes(options);
    };
    break;
  case 'create':
  case 'add': {
    verb = 'add';
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
  try {
    await method(options);
  } catch (err) {
    errorLogger('Erred', null, err);
    // return;
  }
};

export default manageAccounts;

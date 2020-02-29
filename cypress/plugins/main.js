// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import fs from 'fs';
import {dirname} from 'path';
import {spawn} from 'child_process';

import cookieSign from 'cookie-signature';

import browserify from '@cypress/browserify-preprocessor';
import codeCoverageTask from '@cypress/code-coverage/task.js';

import {
  addAccounts, removeAccounts, generateLoginKeys, generatePasswordKey,
  validUserPassword, readAccounts
} from '../../app/server/modules/db-basic.js';

import nodeLoginConfig from '../../node-login.js';

const exprt = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // We get `secret` from `node-login.js` to avoid redundancy with
  //  `cypress.json` (as node-login server needs the secret as well)
  // Should in theory make available to tests through `Cypress.env()`, but
  //  as per apparent bug referred to below, it seems we need our `hackEnv`
  //  task for now.
  // const {env: {secret}} = config;
  const {secret} = nodeLoginConfig;
  config.env = config.env || {};
  config.env.secret = secret;

  // We want `process.env` for login credentials
  // Default in the same way as `app.get('env')`
  // eslint-disable-next-line no-process-env
  config.env.env = process.env.NODE_ENV || 'development';

  // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
  on('task', codeCoverageTask);

  // Force documentation; see https://github.com/gajus/eslint-plugin-jsdoc/issues/493
  // Documentation is needed here to clarify that these tasks are not being used
  //   to replace the need for UI tests to bring coverage to a page where the
  //   functionality is tested (e.g., login on a login page), but rather to
  //   enhance performance for other pages which depend on state being set
  /* eslint 'jsdoc/require-jsdoc':
    ['error',
      {contexts:
    ['ExpressionStatement > CallExpression > ObjectExpression > Property']}] */
  on('task', { // Tasks are run in *Node* (unlike commands/custom commands)
    /**
     * Possibly related to now closed <https://github.com/cypress-io/cypress/issues/2605>.
     * @param {string} value
     * @returns {PlainObject}
     */
    hackEnv (value) {
      return value ? config.env[value] : config.env;
    },
    /**
     * Simulates calling login command (when POSTing to route `/`
     * (with "remember me") to set a cookie). Need to use return result
     * to set a cookie.
     *
     * Used in `root.js` test to ensure that user gets auto-logged in
     * after an initial log-in (and that the cookie is still set after
     * the user is redirected to `/home`).
     * @param {PlainObject} cfg
     * @param {string|string[]} cfg.user
     * @param {string|string[]} cfg.ip
     * @returns {Promise<string[]>} They key
     */
    async generateLoginKey ({user, ip}) {
      const [cookieValue] = await generateLoginKeys({
        user,
        ip
      });

      // Note that if switching to https://github.com/ebourmalo/cookie-encrypter ,
      //  the prefix is `e:`.
      // https://github.com/expressjs/cookie-parser/blob/677ed0825057d20a0e121757e5fd8a39973d2431/index.js#L134
      const cookieParserPrefix = 's:';
      // Todo: Change this if switching to https://github.com/ebourmalo/cookie-encrypter
      const key = cookieParserPrefix + cookieSign.sign(
        cookieValue, secret
      );
      return key;
    },

    /**
     * Simulates posting to `/lost-password` and getting a key associated
     * in the database with the user's current IP in an email that can be
     * checked upon a future visit to `/reset-password` (ensuring that the
     * change is only made if the user has access to their email).
     *
     * Used in `reset-password.js` test (preceding visit to
     * `/reset-password?key=` route).
     * @param {GeneratePasswordOptionDefinitions} cfg
     * @param {string} cfg.email
     * @param {string} cfg.ip
     * @returns {Promise<string>}
     */
    async generatePasswordKey ({email, ip}) {
      const [passwordKey] = await generatePasswordKey({email, ip});
      return passwordKey;
    },

    /**
     * Simulates `/reset`.
     * @returns {DeleteWriteOpResult}
     */
    deleteAllAccounts () {
      return removeAccounts({all: true});
    },
    /**
     * Simulates POST to `/signup` and subsequent visit to `/activation?c=`
     * for that account (with the `c` value obtained from the activation email).
     * @returns {Promise<AccountInfo>}
     */
    async addAccount () {
      return (await addAccounts({
        name: ['Brett'],
        email: ['brettz9@example.com'],
        user: ['bretto'],
        pass: ['abc123456'],
        country: ['US'],
        // eslint-disable-next-line max-len
        activationCode: ['0bb6ab8966ef06be4bea394871138169$f5eb3f8e56b03d24d5dd025c480daa51e55360cd674c0b31bb20993e153a6cb1'],
        activated: [true]
      }))[0];
    },

    /**
     * Simulates POST to `/signup`.
     * @returns {Promise<AccountInfo>}
     */
    async addNonActivatedAccount () {
      return (await addAccounts({
        name: ['Nicole'],
        email: ['me@example.com'],
        user: ['nicky'],
        pass: ['bbb123456'],
        country: ['JP'],
        activated: [false]
      }))[0];
    },

    /**
     * @param {PlainObject} cfg
     * @param {string} cfg.user
     * @param {string} cfg.pass
     * @returns {Promise<AccountInfo>}
     */
    validUserPassword ({user, pass}) {
      return validUserPassword({
        user, pass
      });
    },

    /**
     * @param {ReadOptionDefinitions} cfg
     * @returns {Promise<AccountInfo[]>}
     */
    getRecords (cfg) {
      return readAccounts(cfg);
    }
  });

  // // eslint-disable-next-line global-require
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));

  // https://docs.cypress.io/api/plugins/preprocessors-api.html#File-object
  // https://github.com/cypress-io/code-coverage#instrument-unit-tests
  // https://docs.cypress.io/guides/tooling/code-coverage.html#E2E-and-unit-code-coverage
  // If using Babel, use this instead:
  //   `@cypress/code-coverage/use-babelrc` per https://docs.cypress.io/guides/tooling/code-coverage.html#E2E-and-unit-code-coverage
  on('file:preprocessor', (file) => {
    const {filePath, shouldWatch} = file; // , outputPath

    console.log('file.outputPath', JSON.stringify(file.outputPath));

    console.log(
      'preprocess1', filePath, '::',
      config.integrationFolder.replace(/\/$/u, '') + '/'
    );
    console.log(
      'preprocess2', filePath, '::',
      dirname(config.supportFile).replace(/\/$/u, '') + '/'
    );

    if (shouldWatch) {
      const watcher = fs.watch(filePath, () => {
        file.emit('rerun'); // with watch
      });
      // Close event if the current running spec, the project, or the
      //   browser is closed
      file.on('close', () => {
        watcher.close();
      });
    }

    // We catch this or otherwise our test files themselves will be instrumented
    //  in place.
    // Todo: This apparently doesn't work because we need the imports *within*
    //   the test files (and they are not reported)?
    if ([
      config.integrationFolder,
      dirname(config.supportFile)
    ].some((folder) => {
      return filePath.startsWith(folder.replace(/\/$/u, '') + '/');
    })) {
      console.log('browserifying', file);
      return browserify(browserify.defaultOptions)(file);
    }

    console.log('spawning');

    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      const nyc = spawn('nyc', [
        'instrument', filePath, 'instrumented'
      ]);
      nyc.on('exit', () => {
        resolve(browserify(browserify.defaultOptions)(file));
      });
    });
  });
  // E.g.:
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc.js'));
  // From https://github.com/cypress-io/code-coverage
};

export default exprt;

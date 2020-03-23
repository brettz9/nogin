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

import Pop3Command from 'node-pop3'; // , {listify}
import Envelope from 'envelope';

import browserify from '@cypress/browserify-preprocessor';
import codeCoverageTask from '@cypress/code-coverage/task.js';

import {guid} from '../../app/server/modules/common.js';
import {
  addAccounts, removeAccounts,
  validUserPassword, readAccounts, updateAccounts
} from '../../app/server/modules/db-basic.js';

import {
  generateLoginKeys, generatePasswordKey
} from './db-basic-testing-extensions.js';

import nodeLoginConfig from '../../nogin.js';

/**
* @external CypressOn
* @see https://docs.cypress.io/api/plugins/writing-a-plugin.html#on
*/

/**
* @external CypressConfig
* @see https://docs.cypress.io/api/plugins/writing-a-plugin.html#config
*/

/**
 * @param {external:CypressOn} on See {@link https://docs.cypress.io/api/plugins/writing-a-plugin.html#on}
 * @param {Plainobject} config See {@link https://docs.cypress.io/guides/references/configuration.html#Command-Line}
 * @returns {void}
 */
const exprt = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // We get `secret` and email config from `nogin.js` to avoid
  //   redundancy with cypress.json` (as nogin server needs the
  //   secret and login details as well). Users should not set these
  //   as Cypress environmental variables, as they would not be used
  //   here.

  // const {env: {secret}} = config;
  const {
    secret,
    NL_EMAIL_HOST,
    NL_EMAIL_USER,
    NL_EMAIL_PASS
  } = nodeLoginConfig;

  /**
   * @param {PlainObject} cfg
   * @param {string} cfg.cookieValue
   * @param {string} [cfg.badSecret]
   * @returns {string}
   */
  function generateLoginKey ({
    cookieValue, badSecret
  }) {
    // Note that if switching to https://github.com/ebourmalo/cookie-encrypter ,
    //  the prefix is `e:`.
    // https://github.com/expressjs/cookie-parser/blob/677ed0825057d20a0e121757e5fd8a39973d2431/index.js#L134
    const cookieParserPrefix = 's:';
    // Todo: Change this if switching to https://github.com/ebourmalo/cookie-encrypter
    const key = cookieParserPrefix + cookieSign.sign(
      cookieValue, badSecret || secret
    );
    return key;
  }

  config.env = config.env || {};

  config.env.secret = secret;
  config.env.NL_EMAIL_USER = NL_EMAIL_USER;
  config.env.NL_EMAIL_PASS = NL_EMAIL_PASS;

  // We want `process.env` for login credentials
  // Default in the same way as `app.get('env')`
  // eslint-disable-next-line no-process-env
  config.env.env = process.env.NODE_ENV || 'development';

  // Ability to disable coverage as we don't want the good last coverage to
  //  be overwritten by testing of single files (e.g., with `open`) or to
  //  require re-running and re-merging, nor to spend extra time when not
  //  needed.
  if (config.env.coverage !== false) {
    // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
    on('task', codeCoverageTask);
  }

  const popActivatedAccount = new Pop3Command({
    host: NL_EMAIL_HOST,
    user: NL_EMAIL_USER,
    password: NL_EMAIL_PASS,

    // Todo: Make configurable
    port: 995, // 110 is insecure default for POP
    tls: true
  });

  /**
   * @returns {Promise<string[]>} Message numbers
  */
  async function connectAndGetMessages () {
    await popActivatedAccount._connect();
    // Does not get deleted messages, so safe to use results in
    //  queries like RETR which won't work against deleted
    const list = await popActivatedAccount.LIST();

    return [
      ...new Map(list).keys()
    ];
  }

  /**
   * @param {string|number} messageNum
   * @returns {Promise<EnvelopeMessage>}
   */
  async function getEmail (messageNum) {
    const retrStreamString = await popActivatedAccount.RETR(messageNum);
    console.log('retrStreamString', retrStreamString);
    // console.log('retrStreamStringListified', listify(retrStreamString));

    // This is good to do, but may sometimes be problematic for
    //  a slow connection
    await popActivatedAccount.DELE(messageNum);
    console.log('deleted from server');
    return new Envelope(retrStreamString);
  }

  /**
   * Probably only needed in testing, not from command line.
   * @param {PlainObject} [cfg]
   * @param {boolean} [cfg.lastItem=false]
   * @returns {Promise<EnvelopeMessage[]>}
   */
  async function getEmails ({lastItem} = {}) {
    let messageNums = await connectAndGetMessages();
    if (lastItem) {
      messageNums = messageNums.slice(-1);
    }

    const parsedMessages = await Promise.all(
      messageNums.map((msgNum) => getEmail(msgNum))
    );

    // Each has numbers as strings for each content-type ("0", "1"),
    //   and `header`)
    console.log('parsedMessages', parsedMessages);
    /*
    console.log(
      'parsedMessages[0].header.contentType',
      parsedMessages[0] && parsedMessages[0].header &&
        parsedMessages[0].header.contentType
    );
    */

    // We might not even want to wait here, but we do for now to get the error.
    try {
    /* const quitInfo = */ await popActivatedAccount.QUIT(); // No args
    } catch (err) {
      console.log(err);
    }
    // console.log(quitInfo);
    return parsedMessages;
  }

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
     * @param {string} [cfg.badSecret] For testing a forgery attempt
     * (without the actual secret)
     * @returns {Promise<string[]>} The key
     */
    async generateLoginKey ({user, ip, badSecret}) {
      const [cookieValue] = badSecret
        ? [guid()]
        : await generateLoginKeys({
          user,
          ip
        });
      return generateLoginKey({cookieValue, badSecret});
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
        email: [NL_EMAIL_USER],
        user: ['bretto'],
        pass: [NL_EMAIL_PASS],
        country: ['US'],
        activationCode: [
          // eslint-disable-next-line max-len
          '0bb6ab8966ef06be4bea394871138169$f5eb3f8e56b03d24d5dd025c480daa51e55360cd674c0b31bb20993e153a6cb1'
        ],
        activated: [true]
      }))[0];
    },

    /**
     * Simulates POST to `/signup` and subsequent visit to `/activation?c=`
     * for that account (with the `c` value obtained from the activation email).
     * Sets a different email from `addAccount` initially, however, so can
     * change to it and then check it.
     * @returns {Promise<AccountInfo>}
     */
    async addNondefaultAccount () {
      return (await addAccounts({
        name: ['Brett'],
        email: ['brettz95@example.name'],
        user: ['bretto'],
        pass: [NL_EMAIL_PASS],
        country: ['US'],
        activationCode: [
          // eslint-disable-next-line max-len
          '0bb6ab8966ef06be4bea394871138169$f5eb3f8e56b03d24d5dd025c480daa51e55360cd674c0b31bb20993e153a6cb1'
        ],
        activated: [true]
      }))[0];
    },

    /**
     * Used so we can get coverage of failed `dispatchResetPasswordLink` on call
     * to `/lost-password`.
     * @returns {Promise<AccountInfo>}
     */
    async addAccountWithBadEmail () {
      return (await addAccounts({
        name: ['Jeff'],
        email: ['badEmail'],
        user: ['jeff'],
        pass: ['ccc123456'],
        country: ['FR'],
        activated: [false]
      }))[0];
    },

    /**
     * Simulates POST to `/signup`.
     * @returns {Promise<AccountInfo>}
     */
    async addNonActivatedAccount () {
      return (await addAccounts({
        name: ['Nicole'],
        email: ['me@example.name'],
        user: ['nicky'],
        pass: ['bbb123456'],
        country: ['IR'],
        activated: [false]
      }))[0];
    },

    /**
     * Simulates POST to `/signup`.
     * @returns {Promise<AccountInfo>}
     */
    async addExtraNonActivatedAccount () {
      return (await addAccounts({
        name: ['Nicole'],
        email: ['nicky@example.name'],
        user: ['nicky'],
        pass: ['bbb123456'],
        country: ['IR'],
        activated: [false]
      }))[0];
    },

    /**
     * Simulates POST to `/signup`.
     * @returns {Promise<AccountInfo>}
     */
    async addExtraActivatedAccount () {
      return (await addAccounts({
        name: ['Nicole'],
        email: ['me@example.name'],
        user: ['nicky'],
        pass: ['bbb123456'],
        country: ['IR'],
        activated: [true]
      }))[0];
    },

    /**
     * Allows checking `passVer` validity.
     * @returns {Promise<AccountInfo>}
     */
    async addAccountWithBadPassVersion () {
      return (await addAccounts({
        name: ['Frank'],
        email: ['frank@example.name'],
        user: ['Frankee'],
        pass: ['ooo123456'],
        passVer: ['0'],
        country: ['CN'],
        activated: [true]
      }))[0];
    },

    /**
     * Like a POST to `/home`, but with the ability to unset
     *   the `activated` status. (Used for causing an
     *   `autoLogin` fail).
     * @returns {Promise<AccountInfo>}
     */
    async updateAccountToInactive () {
      return (await updateAccounts({
        user: ['bretto'],
        activated: [false]
      }))[0];
    },

    /**
     * Like a POST to `/home`, but with the ability to unset
     *   the `activated` status. (Used for causing an
     *   `autoLogin` fail).
     * @returns {Promise<AccountInfo>}
     */
    async simulateOldActivationRequestDate () {
      const fortyEightHoursAgo = new Date() - 48 * 60 * 60 * 1000;
      return (await updateAccounts({
        user: ['bretto'],
        activationRequestDate: [fortyEightHoursAgo]
      }))[0];
    },

    /**
     * Ensure we get coverage of empty string default for name
     * and country.
     * @returns {Promise<AccountInfo>}
     */
    async addAccountWithMissingNameAndCountry () {
      return (await addAccounts({
        name: [''],
        email: ['joe@example.name'],
        user: ['Joe'],
        pass: ['ccc123456'],
        country: [''],
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
     * @param {?ReadOptionDefinitions} cfg
     * @returns {Promise<AccountInfo[]>}
     */
    getRecords (cfg) {
      // Not as a default param, as `task` serializes to JSONable
      // `null`
      cfg = cfg || {};
      return readAccounts(cfg);
    },

    /**
    * @external EnvelopeMessage
    * @see https://github.com/jhermsmeier/node-envelope#user-content-parsing-an-email
    */

    // Todo: These email methods should be movable into a Cypress plugin.

    /**
     * Probably only needed in testing, not from command line.
     * @returns {Promise<EnvelopeMessage[]|null>}
     */
    getEmails () {
      if (config.env.disableEmailChecking) {
        return Promise.resolve(null);
      }
      return getEmails();
    },

    /**
     * @returns {Promise<null>} Cypress does not work with `undefined`-resolving
     * tasks; see {@link https://github.com/cypress-io/cypress/issues/6241}.
     */
    async deleteEmails () {
      if (config.env.disableEmailChecking) {
        return null;
      }
      const messageNums = await connectAndGetMessages();

      console.log('messageNums', messageNums);

      try {
        await Promise.all(
          messageNums.map((messageNum) => {
            return popActivatedAccount.DELE(messageNum);
          })
        );
        console.log('Finished delete commands...');

        // We should probably wait here as we do since the messages
        //  are only to be deleted after exiting.
        /* const quitInfo = */ await popActivatedAccount.QUIT(); // No args
        console.log('Successfully quit after deletion.');
      } catch (err) {
        console.log(err);
      }
      return null;
    },

    /**
     * Shouldn't be needed on command line.
     * @param {PlainObject} cfg
     * @param {string} cfg.subject
     * @param {string[]} cfg.html
     * @returns {Promise<boolean>}
     */
    async hasEmail (cfg) {
      if (config.env.disableEmailChecking) {
        // Easier to do this than require the client code to check an
        //  env. variable
        return true;
      }
      const subjectIsNotString = typeof cfg.subject !== 'string';
      const htmlIsNotArray = !Array.isArray(cfg.html);

      const parsedMessages = await getEmails();
      // console.log('parsedMessages', parsedMessages.length, parsedMessages);
      return parsedMessages.some((msg) => {
        const html = msg[0][0] && msg[0][0].body;
        /*
        console.log(
          'cfg.subject', cfg.subject, '::', msg.header && msg.header.subject,
          cfg.subject === msg.header.subject
        );
        console.log(
          'html',
          html,
          'cfg.html',
          cfg.html
        );
        */
        return (
          (subjectIsNotString ||
            cfg.subject === msg.header.get('subject')) &&
          (htmlIsNotArray || cfg.html.every((requiredHTMLString) => {
            // console.log(
            //   'html', html, 'requiredHTMLString', requiredHTMLString
            // );
            return html.includes(requiredHTMLString);
          }))
        );
      });
    },

    /**
    * @typedef {PlainObject} HTMLAndSubject
    * @property {string} html
    * @property {string} subject
    */

    /**
     * @returns {Promise<HTMLAndSubject>}
     */
    async getMostRecentEmail () {
      if (config.env.disableEmailChecking) {
        // Easier to do this than require the client code to check an
        //  env. variable
        return {
          emailDisabled: true
        };
      }

      // Could be risk of race condition
      const parsedMessages = await getEmails({lastItem: true});
      const mostRecentEmail = parsedMessages[0];
      const {header} = mostRecentEmail;
      const subject = header.get('subject');

      const msg = mostRecentEmail[0][0];
      // console.log('parsed msg', msg);
      const html = msg && msg.body;
      return {html, subject};
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

  return config;
};

export default exprt;

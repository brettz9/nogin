// Use to get complete coverage if any guarding code not actually
//   reachable via UI; have server-side do too?;

import {join, resolve as pathResolve} from 'path';
import {spawn} from 'child_process';

import {
  removeAccounts, addAccounts, readAccounts
} from '../app/server/modules/db-basic.js';

import AccountManager from '../app/server/modules/account-manager.js';
import DBAbstraction from '../app/server/modules/db-abstraction.js';
import DBFactory from '../app/server/modules/db-factory.js';
// import cryptoNL from '../app/server/modules/crypto.js';
import setI18n from '../app/server/modules/i18n.js';

import jmlEngine from '../app/server/modules/jmlEngine.js';

import nodeLogin from '../node-login.js';

const {secret} = nodeLogin;

const stripPromisesWarning = (s) => {
  return s.replace(/\(node.*ExperimentalWarning:.*\n/u, '');
};

const stripMongoMessages = (s) => {
  // Todo: Replace this with suppressing db output?
  return s.replace(/mongodb :: connected to database :: "node-login"\n/u, '')
    .replace(/Express server listening on port 1234\n/u, '');
};

/**
* @typedef {PlainObject} SpawnResults
* @property {string} stdout
* @property {string} stderr
*/

const cliPath = pathResolve(__dirname, '../bin/cli.js');
const testPort = 1234;

/**
 * @param {string} path
 * @param {PlainObject|string[]} opts
 * @param {string[]} args
 * @param {Integer} [killDelay=10000]
 * @returns {Promise<SpawnResults>}
 */
const spawnPromise = (path, opts, args, killDelay = 10000) => {
  if (Array.isArray(opts)) {
    killDelay = args || killDelay;
    args = opts;
    opts = undefined;
  }
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    let stderr = '', stdout = '';
    const cli = spawn(
      cliPath,
      args,
      opts
    );
    cli.stdout.on('data', (data) => {
      stdout += data;
    });

    cli.stderr.on('data', (data) => {
      stderr += data;
    });

    cli.on('error', (data) => {
      const err = new Error(data);
      reject(err);
    });

    cli.on('close', (code) => {
      resolve({
        stdout,
        stderr
      });
    });
    // Todo: We should really only signal this when we know the server
    //  is running
    setTimeout(() => {
      cli.kill();
    }, killDelay);
  });
};

describe('Unit tests', function () {
  describe('CLI', function () {
    it('--noLogging option and bad config', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--noLogging',
        '--config',
        'badFile',
        '--PORT', testPort
      ]);
      expect(stripMongoMessages(stdout)).to.equal('');
      expect(stripPromisesWarning(stderr)).to.equal('');
    });

    it('Default config', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort
      ]);
      expect(stripMongoMessages(stdout)).to.equal('');
      expect(stripPromisesWarning(stderr)).to.equal(
        'No config file detected at node-login.json; supply a ' +
          '`null` `config` to avoid this message.\n'
      );
    });

    it('Null config', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 20000);
      expect(stripMongoMessages(stdout)).to.equal(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n' +
        'Awaiting database account connection...\n' +
        'Beginning server...\n'
      );
      expect(stripPromisesWarning(stderr)).to.equal('');
    });

    it(
      'null config but with a bad `adapter` ' +
        '(passed on to `DBFactory.getURL`)',
      async function () {
        this.timeout(20000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          '--adapter', 'badAdapter',
          '--localScripts',
          '--secret', secret,
          '--PORT', testPort,
          '--config', ''
        ], 10000);
        expect(stripPromisesWarning(stderr)).to.contain(
          'Unrecognized database adapter "badAdapter"!'
        );
        expect(stripMongoMessages(stdout)).to.equal('');
      }
    );

    it('Missing environment components', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, {
        env: {
          // eslint-disable-next-line no-process-env
          ...process.env,
          NODE_ENV: 'production'
        }
      }, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ]);
      expect(stripMongoMessages(stdout)).to.equal('');
      expect(stripPromisesWarning(stderr)).to.equal(
        'A production environment requires setting `DB_USER` and `DB_PASS`.\n'
      );
    });
    it('With environment components', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, {
        env: {
          // eslint-disable-next-line no-process-env
          ...process.env,
          NODE_ENV: 'production'
        }
      }, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', '',
        '--DB_USER', 'brett',
        '--DB_PASS', '123456'
      ], 20000);
      expect(stripMongoMessages(stdout)).to.equal(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n' +
        'Awaiting database account connection...\n'
      );
      expect(stripPromisesWarning(stderr)).to.equal('');
    });

    it('help', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help'
      ]);
      expect(stripMongoMessages(stdout)).to.contain(
        'node-login [help|(add|create'
      );
      expect(stripPromisesWarning(stderr)).to.equal('');
    });

    it('help add', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help',
        'add'
      ]);
      expect(stripPromisesWarning(stderr)).to.equal('');
      expect(stripMongoMessages(stdout)).to.contain(
        '--userFile path'
      );
    });

    it('help create (with explicit locale)', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help',
        'create',
        '--loggerLocale'
      ]);
      expect(stripPromisesWarning(stderr)).to.equal('');
      expect(stripMongoMessages(stdout)).to.contain(
        '--userFile path'
      );
    });

    it('help (bad verb)', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help',
        'noSuchVerb'
      ]);
      expect(stripMongoMessages(stdout)).to.equal('');
      expect(stripPromisesWarning(stderr)).to.contain(
        'Erred TypeError: Unknown verb noSuchVerb'
      );
    });

    describe('adding', function () {
      beforeEach(async () => {
        await removeAccounts({all: true});
      });
      it('add', async function () {
        this.timeout(40000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'add',
          '--userFile',
          'test/fixtures/addUsers.json'
        ]);
        expect(stripPromisesWarning(stderr)).to.equal('');
        try {
          expect(stripMongoMessages(stdout)).to.equal(
            'Added 2 accounts: brett, coco!\n'
          );
        } catch (err) {
          expect(stripMongoMessages(stdout)).to.equal(
            'Added 2 accounts: coco, brett!\n'
          );
        }
      });

      it('add (flags)', async function () {
        this.timeout(40000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'add',
          '--user',
          'testUser',
          '--pass',
          '123456',
          '--email',
          'test@example.name',
          '--passVer',
          '1',
          '--date',
          '1234567890',
          '--activationCode',
          '1234555555555555',
          '--activated'
        ]);
        expect(stripPromisesWarning(stderr)).to.equal('');
        expect(stripMongoMessages(stdout)).to.equal(
          'Added 1 accounts: testUser!\n'
        );
      });

      it('add (erring --userFile)', async function () {
        this.timeout(40000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'add',
          '--userFile',
          'nonexistent-file.json'
        ]);
        expect(stripPromisesWarning(stderr)).to.contain(
          'no such file or directory'
        );
        expect(stripMongoMessages(stdout)).to.equal('');
      });

      it('add (erring due to missing pass)', async function () {
        this.timeout(40000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'add',
          '--user',
          'testUser'
        ]);
        expect(stripPromisesWarning(stderr)).to.contain(
          'A `pass` argument must be provided with `user`; ' +
              'for user "testUser" index 0'
        );
        expect(stripMongoMessages(stdout)).to.equal('');
      });

      it('add (erring due to missing email)', async function () {
        this.timeout(40000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'add',
          '--user',
          'testUser',
          '--pass',
          '123456'
        ]);
        expect(stripPromisesWarning(stderr)).to.contain(
          'An `email` argument must be provided with `user`; ' +
              'for user "testUser" index 0'
        );
        expect(stripMongoMessages(stdout)).to.equal('');
      });
    });

    describe('Read, update, delete existing', function () {
      beforeEach(async () => {
        await removeAccounts({all: true});
        // Todo: Note that this JSON file wouldn't work if we needed to
        //  test against a working (and private) email as we do for login tests
        await addAccounts({userFile: ['test/fixtures/addUsers.json']});
      });

      ['read', 'view'].forEach((prop) => {
        it(prop, async function () {
          this.timeout(40000);
          const {stdout, stderr} = await spawnPromise(cliPath, [
            prop,
            '--user',
            'brett'
          ]);
          expect(stripPromisesWarning(stderr)).to.equal('');

          const strippedStdout = stripMongoMessages(stdout);
          const expectedBeginning = 'Account ';
          const beginning = strippedStdout.slice(
            0, expectedBeginning.length
          );
          const end = JSON.parse(strippedStdout.slice(
            expectedBeginning.length
          ));
          expect(beginning).to.equal(expectedBeginning);
          expect(end.user).to.equal('brett');
          expect(end.email).to.equal('brettz9@example.name');
        });
      });

      ['delete', 'remove'].forEach((prop) => {
        it(prop, async function () {
          this.timeout(40000);
          const {stdout, stderr} = await spawnPromise(cliPath, [
            prop,
            '--user',
            'brett'
          ]);
          expect(stripPromisesWarning(stderr)).to.equal('');

          const strippedStdout = stripMongoMessages(stdout);
          const expected = 'Removed 1 accounts!\n';

          expect(strippedStdout).to.equal(expected);

          const accts = await readAccounts();
          expect(accts.length).to.equal(1);
          expect(accts[0].user).to.equal('coco');
        });
      });

      it('update', async function () {
        this.timeout(20000);
        const {stdout, stderr} = await spawnPromise(cliPath, [
          'update',
          '--user',
          'brett',
          '--email',
          'bretto@example.name'
        ]);
        expect(stripPromisesWarning(stderr)).to.equal('');

        const strippedStdout = stripMongoMessages(stdout);
        const expected = 'Updated 1 accounts: brett!\n';

        expect(strippedStdout).to.equal(expected);

        const accts = await readAccounts();
        expect(accts.length).to.equal(2);
        try {
          expect(accts[0].user).to.equal('brett');
          expect(accts[0].email).to.equal('bretto@example.name');
          expect(accts[1].user).to.equal('coco');
        } catch (err) {
          expect(accts[1].user).to.equal('brett');
          expect(accts[1].email).to.equal('bretto@example.name');
          expect(accts[0].user).to.equal('coco');
        }
      });
    });
  });

  describe('Programmatic', function () {
    describe('addAccounts', function () {
      it('add (erring due to missing pass)', async function () {
        this.timeout(40000);
        try {
          await addAccounts({user: ['testUser']});
          throw new Error("Didn't err");
        } catch (err) {
          expect(err.message).to.equal(
            'A `pass` argument must be provided with `user`; ' +
                'for user "testUser" index 0'
          );
        }
      });

      it('add (erring due to missing email)', async function () {
        this.timeout(40000);
        try {
          await addAccounts({
            user: ['testUser'],
            pass: ['123456'],
            email: []
          });
          throw new Error("Didn't err");
        } catch (err) {
          expect(err.message).to.equal(
            'An `email` argument must be provided with `user`; ' +
                'for user "testUser" index 0'
          );
        }
      });
    });
    describe('AccountManager', function () {
      it(
        'AccountManager with bad `adapter` (passed to ' +
          '`DBFactory.createInstance`)',
        function () {
          try {
            // eslint-disable-next-line no-new
            new AccountManager('badAdapter');
            throw new Error("Didn't err");
          } catch (err) {
            expect(err.message).to.equal(
              'Unrecognized database adapter "badAdapter"!'
            );
          }
        }
      );
      it('AccountManager with no log', async function () {
        this.timeout(30000);
        const _ = await setI18n({
          acceptsLanguages: () => 'en-US'
        });
        let erred = false;
        // Todo: Fix this per https://stackoverflow.com/questions/37372684/mongodb-3-2-authentication-failed
        try {
          const am = new AccountManager('mongodb', {
            DB_URL: DBFactory.getURL(
              'mongodb',
              false,
              {
                DB_HOST: 'localhost',
                DB_PORT: 27017,
                DB_NAME: 'node-login'
              }
            ),
            DB_NAME: 'node_login',
            _
          });
          await am.connect();
        } catch (err) {
          erred = true;
        }
        expect(erred).to.be.false;
      });

      /*
      it('AccountManager with authenticated user', async function () {
        this.timeout(30000);
        const _ = await setI18n({
          acceptsLanguages: () => 'en-US'
        });
        let erred = false;
        // Todo: Fix this per https://stackoverflow.com/questions/37372684/mongodb-3-2-authentication-failed
        try {
          await (new AccountManager('mongodb', {
            DB_URL: DBFactory.getURL(
              'mongodb',
              true,
              {
                DB_USER: 'bretttest',
                DB_PASS: '123456',
                DB_HOST: 'localhost',
                DB_PORT: 27018,
                DB_NAME: 'node-login'
              }
            ),
            DB_NAME: 'node_login',
            _
          }).connect());
        } catch (err) {
          erred = true;
        }
        expect(erred).to.be.false;
      });
      */
    });

    it('jmlEngine (erring)', function () {
      // eslint-disable-next-line promise/avoid-new
      return new Promise(function (resolve, reject) {
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        jmlEngine(join(__dirname, 'fixtures/bad-template.js'), null, (err) => {
          expect(err).to.be.an('Error');
          resolve();
        });
      });
    });

    it('DBAbstraction', function () {
      expect(() => {
        DBAbstraction.getURL();
      }).to.throw(Error, 'Abstract method');

      expect(() => {
        DBAbstraction.getObjectId();
      }).to.throw(Error, 'Abstract method');

      const dbAbstract = new DBAbstraction({});

      expect(() => {
        dbAbstract.connect();
      }).to.throw(Error, 'Abstract method');

      expect(() => {
        dbAbstract.getAccounts();
      }).to.throw(Error, 'Abstract method');
    });
  });
});

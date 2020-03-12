// Use to get complete coverage if any guarding code not actually
//   reachable via UI; have server-side do too?;

import {resolve as pathResolve} from 'path';

import {JSDOM} from 'jsdom';
// eslint-disable-next-line no-shadow
import fetch from 'node-fetch';

import {
  removeAccounts, addAccounts, readAccounts
} from '../app/server/modules/db-basic.js';

import nodeLogin from '../nogin.js';

import spawnPromise from './utilities/spawnPromise.js';

const {secret} = nodeLogin;

const stripPromisesWarning = (s) => {
  return s.replace(/\(node.*ExperimentalWarning:.*\n/u, '');
};

const stripMongoMessages = (s) => {
  // Todo: Replace this with suppressing db output?
  return s.replace(/mongodb :: connected to database :: "nogin"\n/u, '')
    .replace(/Express server listening on port 1234\n/u, '');
};

/**
* @typedef {PlainObject} SpawnResults
* @property {string} stdout
* @property {string} stderr
*/

const cliPath = pathResolve(__dirname, '../bin/cli.js');
const testPort = 1234;

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
      'No config file detected at nogin.json; supply a ' +
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

  it(
    'Null config with non-local scripts and misc. config',
    async function () {
      this.timeout(30000);
      let body;
      const cliProm = spawnPromise(cliPath, [
        '--staticDir', pathResolve(__dirname, './fixtures/'),
        '--userJS', 'userJS.js',
        '--userJSModule', 'userJSModule.js',
        '--stylesheet', 'stylesheet.css',
        '--favicon', 'favicon.ico',
        '--router', pathResolve(__dirname, './fixtures/router.js'),
        '--middleware', pathResolve(__dirname, './fixtures/middleware.js'),
        '--injectHTML', pathResolve(__dirname, './fixtures/injectHTML.js'),
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 20000, async (data) => {
        if (data.includes('Beginning server')) {
          body = await (await fetch(`http://localhost:${testPort}`)).text();
        }
      });
      const {stdout, stderr} = await cliProm;
      const doc = (new JSDOM(body)).window.document;
      const headLinks = [...doc.querySelectorAll('head link')].map((link) => {
        return link.outerHTML;
      }).join('');
      expect(headLinks).to.equal(
        '<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">' +
        '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" crossorigin="anonymous">' +
        '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" crossorigin="anonymous">' +
        '<link rel="stylesheet" href="/css/style.css">' +
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css" crossorigin="anonymous">' +
        '<link rel="stylesheet" href="stylesheet.css">'
      );

      const headScripts = [...doc.querySelectorAll('head script')].map(
        (link) => {
          return link.outerHTML;
        }
      );

      const headPreScripts = headScripts.slice(0, 4).join('');
      expect(headPreScripts).to.equal(
        '<script src="https://code.jquery.com/jquery-3.4.1.min.js" crossorigin="anonymous" defer=""></script>' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js" crossorigin="anonymous" defer=""></script>' +
        '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" crossorigin="anonymous" defer=""></script>' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js" crossorigin="anonymous" defer=""></script>'
      );
      const headPostScripts = headScripts.slice(-2).join('');
      expect(headPostScripts).to.equal(
        '<script src="userJS.js"></script>' +
        '<script type="module" src="userJSModule.js"></script>'
      );
      // Todo:
      // 1. Check content for `injectHTML`
      // 2. Confirm `staticDir` can be visited
      // 3. Confirm `router` can be run by visiting `/dynamic-route`
      // 4. Test again but with `noBuiltinStylesheets`
      expect(stripMongoMessages(stdout)).to.equal(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n' +
        'Awaiting database account connection...\n' +
        'Beginning server...\n' +
        // Middleware output
        'gets options, e.g., favicon.ico\n' +
        'req.url /\n'
      );
      expect(stripPromisesWarning(stderr)).to.equal('');
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
      'nogin [help|(add|create'
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

// Use to get complete coverage if any guarding code not actually
//   reachable via UI; have server-side do too?;

import {readFile} from 'fs/promises';

import {dirname, resolve as pathResolve} from 'path';

import {fileURLToPath} from 'url';

import {JSDOM} from 'jsdom';
import fetch from 'node-fetch';
import delay from 'delay';
import escStringRegex from 'escape-string-regexp';

import {
  removeAccounts, addAccounts, readAccounts, updateAccounts
} from '../app/server/modules/db-basic.js';

import noginConfig from '../nogin.js';

import {
  setEmailConfig, deleteEmails, hasEmail
} from './utilities/EmailChecker.mjs';
import spawnPromise from './utilities/spawnPromise.mjs';

const addUsersJSON = JSON.parse(await readFile(
  new URL('./fixtures/addUsers.json', import.meta.url)
));

const __dirname = dirname(fileURLToPath(import.meta.url));

/* eslint-disable max-len -- Long */
// Would add this to config file but would interfere with other tests
// 1. `mongod`
// 2. `mongo`
// 3. `use nogin`
// 4. Add `db.createUser({user: "brett", pwd: "123456", roles: [{ role: "readWrite", db: "nogin" }]});`
/* eslint-enable max-len -- Long */
const DB_USER = 'brett';
const DB_PASS = '123456';

const {
  secret,
  NL_EMAIL_HOST, NL_EMAIL_USER, NL_EMAIL_PASS,
  NL_EMAIL_FROM, NS_EMAIL_TIMEOUT
} = noginConfig;

setEmailConfig({
  NL_EMAIL_HOST,
  NL_EMAIL_USER,
  NL_EMAIL_PASS
});

const stripPromisesWarning = (s) => {
  return s.replace(/\(node.*ExperimentalWarning:.*\n/u, '');
};

/**
 * @see https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411
 * @param {string} s
 * @returns {string}
 */
const stripMongoWarning = (s) => {
  return s.replace(/\(node.*?\) Warning: Accessing non-existent property 'MongoError' of module exports inside circular dependency\n\(Use `node --trace-warnings \.\.\.` to show where the warning was created\)\n/u, '');
};

const stripWarnings = (s) => {
  return stripMongoWarning(stripPromisesWarning(s));
};

/**
* @typedef {PlainObject} SpawnResults
* @property {string} stdout
* @property {string} stderr
*/

const cliPath = pathResolve(__dirname, '../bin/cli.js');
const testPort = 1234;
const testPort2 = 1234;

const stripMongoAndServerListeningMessages = (s, port = testPort) => {
  // Todo: Replace this with suppressing db output?
  return s.replace(/mongodb :: connected to database :: "nogin"\n/u, '')
    .replace(
      new RegExp(`Express server listening on port ${port}\n`, 'u'),
      ''
    );
};

describe('CLI', function () {
  // Was causing errors next to the other `fetch` testing script
  it(
    'Null config with non-local scripts and `noBuiltinStylesheets`',
    async function () {
      this.timeout(110000);
      let cliProm;
      // eslint-disable-next-line promise/avoid-new
      const {text} = await new Promise((resolve, reject) => {
        cliProm = spawnPromise(cliPath, [
          '--noBuiltinStylesheets',
          '--secret', secret,
          '--PORT', testPort2,
          '--config', ''
        ], 80000, async (stdout) => {
          // if (stdout.includes(
          //   `Express server listening on port ${testPort2}`)
          // ) {
          if (stdout.includes('Beginning server...')) {
            try {
              const res = await fetch(`http://localhost:${testPort2}`);
              resolve(
                {text: await res.text()}
              );
            } catch (err) {
              reject(err);
            }
          }
        });
      });
      const {stdout, stderr} = await cliProm;
      const doc = (new JSDOM(text)).window.document;
      const headLinks = [...doc.querySelectorAll('head link')].map((link) => {
        return link.outerHTML;
      }).join('');
      expect(headLinks).to.equal(
        '<link rel="shortcut icon" type="image/x-icon" ' +
          'href="data:image/x-icon;,">'
      );
      expect(stripMongoAndServerListeningMessages(
        stdout, testPort
      )).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n' +
        'Awaiting database account connection...\n' +
        'Beginning server...\n'
      );
      expect(stripWarnings(stderr)).to.equal('');
    }
  );

  it('--noLogging option and bad config', async function () {
    this.timeout(30000);
    const {stdout, stderr} = await spawnPromise(cliPath, [
      '--localScripts',
      '--secret', secret,
      '--noLogging',
      '--config',
      'badFile',
      '--PORT', testPort
    ], 20000);
    expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    expect(stripWarnings(stderr)).to.equal('');
  });

  // Above with bad config didn't seem to give coverage for some reason
  it('--noLogging option and null config', async function () {
    this.timeout(30000);
    const {stdout, stderr} = await spawnPromise(cliPath, [
      '--localScripts',
      '--secret', secret,
      '--noLogging',
      '--config', '',
      '--PORT', testPort
    ], 20000);
    expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    expect(stripWarnings(stderr)).to.equal('');
  });

  it('Default config', async function () {
    this.timeout(30000);
    const {stdout, stderr} = await spawnPromise(cliPath, [
      '--localScripts',
      '--secret', secret,
      '--PORT', testPort
    ], 20000);
    expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    expect(stripWarnings(stderr)).to.equal(
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
    expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
      'Beginning routes...\n' +
      'Awaiting internationalization and logging...\n' +
      'Awaiting database account connection...\n' +
      'Beginning server...\n'
    );
    expect(stripWarnings(stderr)).to.equal('');
  });

  it(
    'null config but with a bad `adapter` ' +
      '(passed on to `DBFactory.getURL`)',
    async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--adapter', 'badAdapter',
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 20000);
      expect(stripWarnings(stderr)).to.contain(
        'Unrecognized database adapter "badAdapter"!'
      );
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    }
  );

  describe('Erring with bad locale routes', function () {
    it('Throw with non-distinct route paths', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--localesBasePath', 'test/fixtures/locales/non-distinct',
        '--config', ''
      ], 20000);
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n'
      );
      expect(stripWarnings(stderr)).to.contain(
        'Localized route paths must be distinct within a locale'
      );
    });
    it('Throw with reserved routes', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--localesBasePath', 'test/fixtures/locales/reserved-routes',
        '--config', ''
      ], 20000);
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n'
      );
      expect(stripWarnings(stderr)).to.contain(
        'Localized routes must not use reserved routes (/_lang)'
      );
    });
    it('Throw with paths possessing dots', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--localesBasePath', 'test/fixtures/locales/path-dots',
        '--config', ''
      ], 20000);
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n'
      );
      expect(stripWarnings(stderr)).to.contain(
        'Localized routes must have an initial slash but no ' +
          'dots or slashes afterward.'
      );
    });
    it('Throw with paths possessing extra slashes', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--localesBasePath', 'test/fixtures/locales/path-slashes',
        '--config', ''
      ], 20000);
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n'
      );
      expect(stripWarnings(stderr)).to.contain(
        'Localized routes must have an initial slash but no ' +
          'dots or slashes afterward.'
      );
    });
  });

  // Todo: If setting up additional cypress processes, we
  //   would ideally test this in UI that it redirects
  it('crossDomainJSRedirects', async function () {
    this.timeout(70000);
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const [langFF2, langFF25] = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--crossDomainJSRedirects',
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(Promise.all([
          fetch(`http://localhost:${testPort}/_lang`, {
            headers: {
              'User-Agent': 'Firefox/2.0'
            }
          }),
          fetch(`http://localhost:${testPort}/_lang`, {
            headers: {
              'User-Agent': 'Firefox/25.0'
            }
          })
        ]));
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const langFirefox2 = await langFF2.text();
    const langFirefox25 = await langFF25.text();

    expect(langFirefox2).to.contain(
      'permittingXDomainRedirects = false'
    );
    expect(langFirefox25).to.contain(
      'permittingXDomainRedirects = true'
    );
  });

  it('helmet (defaults)', async function () {
    this.timeout(70000);
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const helmetResp = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(
          fetch(`http://localhost:${testPort}/_lang`)
        );
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const {headers} = helmetResp;

    expect(headers.get('X-Frame-Options')).to.equal(
      'SAMEORIGIN'
    );
    expect(headers.get('X-Content-Type-Options')).to.equal(
      'nosniff'
    );
  });

  it('helmet (custom)', async function () {
    this.timeout(70000);
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const helmetResp = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--helmetOptions', JSON.stringify('{noSniff: false}'),
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(
          fetch(`http://localhost:${testPort}/_lang`)
        );
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const {headers} = helmetResp;

    expect(headers.get('X-Frame-Options')).to.equal(
      'SAMEORIGIN'
    );
    expect(headers.get('X-Content-Type-Options')).to.equal(
      'nosniff'
    );
  });

  it('noHelmet', async function () {
    this.timeout(70000);
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const helmetResp = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--noHelmet',
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(
          fetch(`http://localhost:${testPort}/_lang`)
        );
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const {headers} = helmetResp;

    expect(headers.has('X-Frame-Options')).to.be.false;
    expect(headers.has('X-Content-Type-Options')).to.be.false;
  });

  it('sessionOptions', async function () {
    this.timeout(70000);
    const name = 'my.sessionid';
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const resp = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--sessionOptions', JSON.stringify({
          name
        }),
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(
          fetch(`http://localhost:${testPort}/_lang`)
        );
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const {headers} = resp;

    expect(headers.get('Set-Cookie')).to.contain(name);
    expect(headers.get('Set-Cookie')).to.contain('HttpOnly');
  });

  it('sessionCookieOptions', async function () {
    this.timeout(70000);
    let fetching;
    let cliProm;
    // eslint-disable-next-line promise/avoid-new
    const resp = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--sessionCookieOptions', JSON.stringify({
          httpOnly: false
        }),
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--config', ''
      ], 40000, (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          return;
        }
        fetching = true;
        resolve(
          fetch(`http://localhost:${testPort}/_lang`)
        );
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const {headers} = resp;

    expect(headers.get('Set-Cookie')).to.not.contain('HttpOnly');
  });

  it('Check special POST requests (disabling XSRF)', async function () {
    this.timeout(310000);

    // SETUP
    // Adding to ensure there is a fresh `signup` below
    await removeAccounts({all: true});
    await deleteEmails();

    let fetching;
    let cliProm;
    const [
      {badURLPostStatus, badURLPostText},
      {signupPostStatus}
    // eslint-disable-next-line promise/avoid-new
    ] = await new Promise((resolve, reject) => {
      cliProm = spawnPromise(cliPath, [
        '--localScripts',
        '--secret', secret,
        '--PORT', testPort,
        '--disableXSRF',
        '--composeResetPasswordEmailView',
        './test/fixtures/views/composeResetPasswordEmailView.js',
        '--composeActivationEmailView',
        './test/fixtures/views/composeActivationEmailView.js',
        // These seven are needed for the previous two
        '--fromText',
        'brettz9',
        '--fromURL',
        'https://github.com/brettz9/nogin',
        '--NL_EMAIL_FROM',
        NL_EMAIL_FROM,
        '--NS_EMAIL_TIMEOUT',
        NS_EMAIL_TIMEOUT,
        '--NL_EMAIL_HOST',
        NL_EMAIL_HOST,
        '--NL_EMAIL_USER',
        NL_EMAIL_USER,
        '--NL_EMAIL_PASS',
        NL_EMAIL_PASS,
        '--config', ''
      ], 200000, async (stdout) => {
        // if (stdout.includes(
        //  `Express server listening on port ${testPort}`)
        // ) {
        if (fetching || !stdout.includes('Beginning server...')) {
          console.log('ssss', stdout);
          return;
        }
        fetching = true;

        const [
          postRes,
          signupPostRes
        ] = await Promise.all([
          // Check bad POST coverage
          fetch(`http://localhost:${testPort}/bad-url`, {
            method: 'POST'
          }),
          // Check for custom `composeResetPasswordEmailView`
          fetch(`http://localhost:${testPort}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'Brett',
              email: NL_EMAIL_USER,
              user: 'bretto',
              pass: NL_EMAIL_PASS,
              country: 'US'
            })
          })
        ]);
        console.log('FETCHED 2...');

        // Retrieving emails separately
        const emailsWillHaveProbablyArrived = 15000;
        await delay(emailsWillHaveProbablyArrived);
        const hasAccountActivation = await hasEmail({
          subject: 'Account Activation',
          html: [
            'See you later alligator',
            'Please click here to activate your account',
            '<a href=',
            'activation?c='
          ]
        });
        console.log('HAS-EMAIL-RESULT 1', hasAccountActivation);
        expect(hasAccountActivation).to.be.true;
        await deleteEmails();
        console.log('EMAILS DELETED');

        console.log('signupPostRes.status', signupPostRes.status);
        console.log('signupPostRes', await signupPostRes.text());

        // So lost password can be requested
        await updateAccounts({
          user: ['bretto'],
          email: [NL_EMAIL_USER],
          activated: [true]
        })[0];

        // Check for custom `composeActivationEmailView`
        const lostPasswordPostRes = await fetch(
          `http://localhost:${testPort}/lost-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: NL_EMAIL_USER
            })
          }
        );
        const lostPasswordPostStatus = lostPasswordPostRes.status;

        expect(lostPasswordPostStatus).to.equal(200);
        console.log('STATUS RESULT');

        await delay(emailsWillHaveProbablyArrived);
        const hasPasswordReset = await hasEmail({
          subject: 'Password Reset',
          html: [
            'See you later alligator',
            'Click here to reset your password',
            '<a href=',
            'reset-password?key='
          ]
        });
        console.log('HAS-EMAIL-RESULT 2', hasPasswordReset);
        expect(hasPasswordReset).to.be.true;

        resolve([
          {
            badURLPostStatus: postRes.status,
            badURLPostText: await postRes.text()
          },
          {
            signupPostStatus: signupPostRes.status
          }
        ]);
      });
    });
    /* const {stdout, stderr} = */ await cliProm;

    const postDoc = (new JSDOM(badURLPostText)).window.document;
    const postMsg = postDoc.querySelector('[data-name=four04]').textContent;
    expect(badURLPostStatus).to.equal(404);
    expect(postMsg).contains(
      'the page or resource you are searching for is currently unavailable'
    );

    expect(signupPostStatus).to.equal(200);
  });

  // While we could make a full-blown UI test out of this, it would
  //  require setting up another server either before Cypress runs,
  //  or before another instance of Cypress runs, both of which seem
  //  like unnecessary overhead since we are not testing post-load
  //  behavior/JavaScript.
  it(
    'Null config with non-local scripts and misc. config',
    async function () {
      this.timeout(310000);

      // SETUP
      // Adding to ensure there is a fresh `signup` below
      await removeAccounts({all: true});
      await deleteEmails();

      let cliProm, fetching;
      const [
        {text, headers}, {textRTL}, {json}, {dynamicText},
        {signupText}, {usersText},
        {coverageStatus, coverageText},
        {updateAccountText},
        {homeStatus, homeText}
        // eslint-disable-next-line promise/avoid-new
      ] = await new Promise((resolve, reject) => {
        cliProm = spawnPromise(cliPath, [
          '--staticDir', pathResolve(__dirname, './fixtures/'),
          '--userJS', 'userJS.js',
          '--userJSModule', 'userJSModule.js',
          '--stylesheet', 'stylesheet.css',
          '--favicon', 'favicon.ico',
          '--countryCodes', '["CA", "MX", "US"]',
          '--router', pathResolve(__dirname, './fixtures/router.js'),
          '--middleware', pathResolve(__dirname, './fixtures/middleware.js'),
          '--injectHTML', pathResolve(__dirname, './fixtures/injectHTML.js'),
          '--customRoute', 'en-US=home=/updateAccount',
          '--customRoute', 'en-US=logout=/log-me-out',

          // Not sure why not getting coverage error when this was missing
          '--RATE_LIMIT',
          1000,

          '--secret', secret,
          '--PORT', testPort,
          '--config', ''
        ], 200000, async (stdout) => {
          // if (stdout.includes(
          //  `Express server listening on port ${testPort}`)
          // ) {
          if (fetching || !stdout.includes('Beginning server...')) {
            return;
          }
          fetching = true;
          try {
            const [
              res, resRTL, staticRes, dynamicRes, signupRes, usersRes,
              covRes, updateAccountRes, homeRes
            ] = await Promise.all([
              fetch(`http://localhost:${testPort}`),
              fetch(`http://localhost:${testPort}`, {
                headers: {
                  'Accept-Language': 'fa'
                }
              }),
              // Within `/test/fixtures`
              fetch(`http://localhost:${testPort}/addUsers.json`),
              // Based on `router`
              fetch(`http://localhost:${testPort}/dynamic-route`),
              // Check countryCodes (and lack of `requireName`)
              fetch(`http://localhost:${testPort}/signup`),
              // Check missing `--showUsers` flag
              //   (in main Cypress tests, we are enabling `showUsers`
              //   and `requireName` so as to fully test them; while
              //   we would ideally test these in the UI as well,
              //   a unit test should be adequate given the burden of
              //   setting up another Cypress instance)
              fetch(`http://localhost:${testPort}/users`),
              // Check static coverage
              fetch(`http://localhost:${testPort}/coverage`),
              // Check that `/updateAccount` works as `/home` (redirects)
              fetch(`http://localhost:${testPort}/updateAccount`),
              // Check that `/home` is no longer available
              fetch(`http://localhost:${testPort}/home`)
            ]);

            resolve([
              {headers: res.headers, text: await res.text()},
              {textRTL: await resRTL.text()},
              {json: await staticRes.json()},
              {dynamicText: await dynamicRes.text()},
              {signupText: await signupRes.text()},
              {usersText: await usersRes.text()},
              {
                coverageStatus: covRes.status,
                coverageText: await covRes.text()
              },
              {updateAccountText: await updateAccountRes.text()},
              {homeStatus: homeRes.status, homeText: await homeRes.text()}
            ]);
          } catch (err) {
            reject(err);
          }
        });
      });
      const {stdout, stderr} = await cliProm;
      const coverageDoc = (new JSDOM(coverageText)).window.document;
      const covMsg = coverageDoc.querySelector(
        '[data-name=four04]'
      ).textContent;
      expect(coverageStatus).to.equal(404);
      expect(covMsg).contains(
        'the page or resource you are searching for is currently unavailable'
      );

      expect(updateAccountText).to.contain('Please Login To Your Account');

      const homeDoc = (new JSDOM(homeText)).window.document;
      const homeMsg = homeDoc.querySelector('[data-name=four04]').textContent;
      expect(homeStatus).to.equal(404);
      expect(homeMsg).contains(
        'the page or resource you are searching for is currently unavailable'
      );

      expect(headers.get('x-middleware-gets-options')).to.equal('favicon.ico');
      expect(headers.get('x-middleware-gets-req')).to.equal('/');
      const doc = (new JSDOM(text)).window.document;
      const headLinks = [...doc.querySelectorAll('head link')].map((link) => {
        return link.outerHTML;
      }).join('');
      const semverNumPattern = '\\d+\\.\\d+\\.\\d+(?:-(?:alpha|beta)\\d+)?';

      const regex = new RegExp(
        escStringRegex(
          '<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">'
        ) +
        escStringRegex(
          '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v'
        ) + semverNumPattern + escStringRegex(
          '/css/fontawesome.css" crossorigin="anonymous">'
        ) +
        escStringRegex(
          '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@'
        ) + semverNumPattern + escStringRegex(
          '/dist/css/bootstrap.min.css" crossorigin="anonymous">'
        ) +
        escStringRegex('<link rel="stylesheet" href="/css/style.css">') +
        escStringRegex(
          '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/'
        ) + semverNumPattern + escStringRegex(
          '/gh-fork-ribbon.min.css" crossorigin="anonymous">'
        ) +
        escStringRegex(
          '<link rel="stylesheet" href="stylesheet.css">' +
          '<link rel="stylesheet" href="headPostContent.css">'
        ),
        'u'
      );
      expect(headLinks).to.match(regex);

      const docRTL = (new JSDOM(textRTL)).window.document;
      const headLinksRTL = [
        ...docRTL.querySelectorAll('head link')
      ].map((link) => {
        return link.outerHTML;
      }).join('');
      expect(headLinksRTL).to.match(
        new RegExp(
          regex.source.replace('bootstrap.min.css', 'bootstrap.rtl.min.css'),
          'u'
        )
      );

      const headScriptsDOM = [...doc.querySelectorAll('head script')];
      const headScripts = headScriptsDOM.map(
        (script) => {
          return script.outerHTML;
        }
      );

      const headPreScripts = headScripts.slice(0, 5).join('');
      expect(headPreScripts).to.match(new RegExp(
        escStringRegex(
          '<script src="headPreContent.js"></script>' +
          '<script src="https://code.jquery.com/jquery-'
        ) + semverNumPattern + escStringRegex(
          '.min.js" crossorigin="anonymous" defer=""></script>'
        ) +
        escStringRegex(
          '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@'
        ) + semverNumPattern + escStringRegex(
          '/dist/umd/popper.min.js" crossorigin="anonymous" defer=""></script>'
        ) +
        escStringRegex(
          '<script src="https://cdn.jsdelivr.net/npm/bootstrap@'
        ) + semverNumPattern + escStringRegex(
          '/dist/js/bootstrap.min.js" crossorigin="anonymous" ' +
            'defer=""></script>'
        ) +
        escStringRegex(
          '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/'
        ) + semverNumPattern + escStringRegex(
          '/jquery.form.min.js" crossorigin="anonymous" defer=""></script>'
        ),
        'u'
      ));
      const headPostScripts = headScripts.slice(-2).join('');
      expect(headPostScripts).to.equal(
        '<script src="userJS.js"></script>' +
        '<script type="module" src="userJSModule.js"></script>'
      );

      expect(headScriptsDOM.some((headScript) => {
        return headScript.src === '/js/polyfills/polyfills.iife.min.js';
      })).to.be.true;

      expect(headScriptsDOM.some((headScript) => {
        return headScript.type === 'module' &&
          headScript.src === '/js/controllers/loginController.js';
      })).to.be.false;

      expect(doc.body.firstElementChild.outerHTML).to.equal(
        '<link rel="stylesheet" href="bodyPreContent.css">'
      );
      expect(doc.body.lastElementChild.outerHTML).to.equal(
        '<script src="bodyPostContent.js"></script>'
      );

      expect(json).to.deep.equal(addUsersJSON);

      expect(dynamicText).to.equal(
        'got a dynamic route with options, e.g., userJS.js'
      );

      const signupDoc = (new JSDOM(signupText)).window.document;
      const countries = [
        ...signupDoc.querySelectorAll('[data-name="country"] option')
      ].map((country) => {
        return country.outerHTML;
      }).join('');
      expect(countries).to.equal(
        '<option value="">Please select a country</option>' +
        '<option value="CA">Canada</option>' +
        '<option value="MX">Mexico</option>' +
        '<option value="US">United States</option>'
      );
      const name = signupDoc.querySelector('[data-name="name"]').outerHTML;
      expect(name).to.not.contain('minlength');

      const usersDoc = (new JSDOM(usersText)).window.document;
      expect(
        usersDoc.querySelector('[data-name=four04]').textContent
      ).to.contain(
        'the page or resource you are searching for is currently unavailable'
      );

      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'Beginning routes...\n' +
        'Awaiting internationalization and logging...\n' +
        'Awaiting database account connection...\n' +
        'Beginning server...\n'
      );
      console.log('STDOUT:::', stdout);
      expect(stripWarnings(stderr)).to.equal('');
    }
  );

  it('Missing environment components', async function () {
    this.timeout(40000);
    const {stdout, stderr} = await spawnPromise(cliPath, {
      env: {
        // eslint-disable-next-line node/no-process-env -- Testing env.
        ...process.env,
        NODE_ENV: 'production'
      }
    }, [
      '--localScripts',
      '--secret', secret,
      '--PORT', testPort,
      '--config', ''
    ], 20000);
    expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    expect(stripWarnings(stderr)).to.equal(
      'A production environment requires setting `DB_USER` and `DB_PASS`.\n'
    );
  });
  it('With environment components', async function () {
    this.timeout(40000);
    const {stdout, stderr} = await spawnPromise(cliPath, {
      env: {
        // eslint-disable-next-line node/no-process-env -- Testing env.
        ...process.env,
        NODE_ENV: 'production'
      }
    }, [
      '--localScripts',
      '--secret', secret,
      '--PORT', testPort,
      '--config', '',
      '--DB_USER', DB_USER,
      '--DB_PASS', DB_PASS
    ], 20000);
    expect(stripMongoAndServerListeningMessages(stdout)).to.equal(
      'Beginning routes...\n' +
      'Awaiting internationalization and logging...\n' +
      'Awaiting database account connection...\n'
    );
    expect(stripWarnings(stderr)).to.equal('');
  });

  describe('Help', function () {
    it('help', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help'
      ]);
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        'nogin [help|(add|create'
      );
      expect(stripWarnings(stderr)).to.equal('');
    });

    it('help add', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help',
        'add'
      ]);
      expect(stripWarnings(stderr)).to.equal('');
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
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
      expect(stripWarnings(stderr)).to.equal('');
      expect(stripMongoAndServerListeningMessages(stdout)).to.contain(
        '--userFile path'
      );
    });

    it('help (bad verb)', async function () {
      this.timeout(20000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'help',
        'noSuchVerb'
      ]);
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
      expect(stripWarnings(stderr)).to.contain(
        'Erred TypeError: Unknown verb noSuchVerb'
      );
    });
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
      ], 30000);
      expect(stripWarnings(stderr)).to.equal('');
      try {
        expect(stripMongoAndServerListeningMessages(stdout)).to.equal(
          'Added 2 accounts: brett, coco!\n'
        );
      } catch (err) {
        expect(stripMongoAndServerListeningMessages(stdout)).to.equal(
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
        '--country',
        'US',
        '--name',
        'Joe Bob',
        '--passVer',
        '1',
        '--date',
        '1234567890',
        '--activationCode',
        '1234555555555555',
        '--unactivatedEmail',
        'new@example.name',
        '--activationRequestDate',
        '1584614124120',
        '--activated'
      ], 30000);
      expect(stripWarnings(stderr)).to.equal('');
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal(
        'Added 1 accounts: testUser!\n'
      );
      const accts = await readAccounts();
      expect(accts).to.have.lengthOf(1);
      expect(accts[0].user).to.equal('testUser');
    });

    it('add (flags) and deletes other unactivated accounts', async function () {
      this.timeout(50000);
      await addAccounts({
        user: ['testUser'],
        email: ['test@example.name'],
        pass: ['myPass12345'],
        activated: [false]
      });
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'add',
        '--user',
        'testUser',
        '--pass',
        '123456',
        '--email',
        'test@example.name',
        '--country',
        'US',
        '--name',
        'Joe Bob',
        '--passVer',
        '1',
        '--date',
        '1234567890',
        '--activationCode',
        '1234555555555555',
        '--unactivatedEmail',
        'new@example.name',
        '--activationRequestDate',
        '1584614124120',
        '--activated'
      ], 30000);
      expect(stripWarnings(stderr)).to.equal('');
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal(
        'Added 1 accounts: testUser!\n'
      );
      const accts = await readAccounts();
      expect(accts).to.have.lengthOf(1);
      expect(accts[0].user).to.equal('testUser');
    });

    it('add (erring --userFile)', async function () {
      this.timeout(40000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'add',
        '--userFile',
        'nonexistent-file.json'
      ], 30000);
      expect(stripWarnings(stderr)).to.contain(
        'no such file or directory'
      );
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    });

    it('add (erring due to missing pass)', async function () {
      this.timeout(40000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'add',
        '--user',
        'testUser'
      ], 30000);
      expect(stripWarnings(stderr)).to.contain(
        'A `pass` argument must be provided with `user`; ' +
            'for user "testUser" index 0'
      );
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    });

    it('add (erring due to missing email)', async function () {
      this.timeout(40000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'add',
        '--user',
        'testUser',
        '--pass',
        '123456'
      ], 30000);
      expect(stripWarnings(stderr)).to.contain(
        'An `email` argument must be provided with `user`; ' +
            'for user "testUser" index 0'
      );
      expect(stripMongoAndServerListeningMessages(stdout)).to.equal('');
    });
  });

  describe('Read, listIndexes, update, delete existing', function () {
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
        ], 30000);
        expect(stripWarnings(stderr)).to.equal('');

        const strippedStdout = stripMongoAndServerListeningMessages(stdout);
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
        ], 30000);
        expect(stripWarnings(stderr)).to.equal('');

        const strippedStdout = stripMongoAndServerListeningMessages(stdout);
        const expected = 'Removed 1 accounts!\n';

        expect(strippedStdout).to.equal(expected);

        const accts = await readAccounts();
        expect(accts).to.have.lengthOf(1);
        expect(accts[0].user).to.equal('coco');
      });
    });

    it('listIndexes', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'listIndexes'
      ], 20000);

      expect(stripWarnings(stderr)).to.equal('');

      const strippedStdout = stripMongoAndServerListeningMessages(stdout);

      expect(strippedStdout).to.contain(
        'index: 0 {'
      );
    });

    it('update', async function () {
      this.timeout(30000);
      const {stdout, stderr} = await spawnPromise(cliPath, [
        'update',
        '--user',
        'brett',
        '--email',
        'bretto@example.name'
      ], 20000);
      expect(stripWarnings(stderr)).to.equal('');

      const strippedStdout = stripMongoAndServerListeningMessages(stdout);
      const expected = 'Updated 1 accounts: brett!\n';

      expect(strippedStdout).to.equal(expected);

      const accts = await readAccounts();
      expect(accts).to.have.lengthOf(2);
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

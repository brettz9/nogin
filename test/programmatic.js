import {join} from 'path';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  removeAccounts, addAccounts, validUserPassword
} from '../app/server/modules/db-basic.js';

import AccountManager from '../app/server/modules/account-manager.js';
import DBAbstraction from '../app/server/modules/db-abstraction.js';
import DBFactory from '../app/server/modules/db-factory.js';
import cryptoNL from '../app/server/modules/crypto.js';
import setI18n from '../app/server/modules/i18n.js';

import jmlEngine from '../app/server/modules/jmlEngine.js';

// Add `rejectedWith`, etc.
chai.use(chaiAsPromised);

describe('Programmatic', function () {
  describe('addAccounts', function () {
    it('add (erring due to missing pass)', function () {
      return expect(
        addAccounts({user: ['testUser']})
      ).to.be.rejectedWith(
        TypeError,
        'A `pass` argument must be provided with `user`; ' +
            'for user "testUser" index 0'
      );
    });

    it('add (erring due to missing email)', function () {
      return expect(
        addAccounts({
          user: ['testUser'],
          pass: ['123456'],
          email: []
        })
      ).to.be.rejectedWith(
        TypeError,
        'An `email` argument must be provided with `user`; ' +
            'for user "testUser" index 0'
      );
    });
  });
  describe('validUserPassword', function () {
    beforeEach(async () => {
      await removeAccounts({all: true});
      // Todo: Note that this JSON file wouldn't work if we needed to
      //  test against a working (and private) email as we do for login tests
      await addAccounts({
        user: ['brett'],
        email: ['brettz9@example.name'],
        pass: ['123456'],
        activated: [true]
      });
      console.log('done before');
    });
    it('throws with bad password', function () {
      return expect(
        validUserPassword({
          user: 'brett',
          pass: null
        })
      ).to.be.rejectedWith(
        Error,
        // From Node
        'The "password" argument must be one of type string, ' +
          'Buffer, TypedArray, or DataView. Received type object'
      );
    });
  });
  describe('AccountManager', function () {
    it(
      'AccountManager with bad `adapter` (passed to ' +
        '`DBFactory.createInstance`)',
      function () {
        expect(() => {
          // eslint-disable-next-line no-new
          new AccountManager('badAdapter');
        }).to.throw(
          Error,
          'Unrecognized database adapter "badAdapter"!'
        );
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

  it('crypto (node-login)', function () {
    return expect(
      cryptoNL.saltAndHash(null)
    ).to.be.rejectedWith(Error);
  });
});

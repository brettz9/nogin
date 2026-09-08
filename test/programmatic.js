import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  removeAccounts, addAccounts, validUserPassword
} from '../app/server/modules/db-basic.js';

import AccountManager from '../app/server/modules/account-manager.js';
import DBAbstraction from '../app/server/modules/db-abstraction.js';
import DBFactory from '../app/server/modules/db-factory.js';
import * as cryptoNL from '../app/server/modules/crypto.js';
import {i18n as setI18n} from '../app/server/modules/i18n.js';

import jmlEngine from '../app/server/modules/jmlEngine.js';
import {createServer} from '../app/server/app.js';
import {getPrivilegeValues} from '../app/server/routeList.js';
import privilegesView from '../app/server/views/privileges.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Add `rejectedWith`, etc.
chai.use(chaiAsPromised);

describe('Programmatic', function () {
  it('serializes boolean, string, and numeric privileges', function () {
    const privileges = getPrivilegeValues([
      {
        privilegeName: 'canPublish',
        description: 'Can publish',
        builtin: false,
        date: Date.now()
      },
      {
        privilegeName: 'userDatabase',
        description: 'User database',
        type: 'string',
        value: 'myDatabase',
        builtin: false,
        date: Date.now()
      },
      {
        privilegeName: 'uploadLimit',
        description: 'Upload limit',
        type: 'number',
        value: 25,
        builtin: false,
        date: Date.now()
      }
    ]);

    expect(Object.fromEntries(privileges)).to.deep.equal({
      canPublish: true,
      userDatabase: 'myDatabase',
      uploadLimit: 25
    });
  });

  it('shows privilege types but not values in the management UI',
    async function () {
      const rendered = JSON.stringify(await privilegesView({
      // @ts-expect-error Minimal i18n test double
        _ (key) {
          return Array.isArray(key) ? key[0] : key;
        },
        // @ts-expect-error Minimal layout test double
        layout: (content) => Promise.resolve([content]),
        hasEditPrivilegeAccess: true,
        hasAddPrivilegeToGroupAccess: true,
        hasRemovePrivilegeFromGroupAccess: true,
        hasReadGroupAccess: true,
        hasReadUsersAccess: true,
        privilegesInfo: [{
          privilegeName: 'userDatabase',
          description: 'User database',
          type: 'string',
          userVarying: true,
          // @ts-expect-error Ensure assignment values are not rendered
          value: 'privateDatabase',
          builtin: false,
          groupsInfo: [],
          usersInfo: [{user: 'typedUser'}]
        }],
        groups: [],
        users: ['typedUser']
      }));

      expect(rendered).to.include('createPrivilege-type-input');
      expect(rendered).to.include('createPrivilege-user-varying-input');
      expect(rendered).to.include('StringPrivilege');
      expect(rendered).to.include('NotApplicable');
      expect(rendered).to.include('typedUser');
      expect(rendered).to.include('addPrivilegeToUser btn btn-primary');
      expect(rendered).not.to.include(
        'addPrivilegeToGroup btn btn-primary","data-privilege":' +
        '"userDatabase'
      );
      expect(rendered).not.to.include('privateDatabase');
    });

  describe('createServer', function () {
    it('Allows JSON options as objects', async function () {
      let i = 0;
      // Todo: Should really test behavior including that our `genid` function
      //  works (as we're not limited to JSON here), but we do check behaviors
      //  on the JSON-as-strings already
      await createServer({
        PORT: 3001,
        config: null,
        noHostValidation: true,
        sessionOptions: {
          name: 'my.sessionid',
          secret: 'boo'
        },
        helmetOptions: {
          noSniff: false
        },
        sessionCookieOptions: {
          genid () {
            return i++;
          }
        }
      });
    });
  });

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
          // @ts-expect-error Testing bad argument
          pass: null
        })
      ).to.be.rejectedWith(
        Error,
        // From Node
        /The "password" argument must be /v
      );
    });
  });

  describe('AccountManager', function () {
    it('stores typed privilege values by group and user', async function () {
      this.timeout(30000);
      const DB_NAME = 'nogin-typed-privileges-test';
      const _ = await setI18n()({
        // @ts-expect-error Why isn't the first overload accepted?
        acceptsLanguages: () => ['en-US']
      });
      const am = await new AccountManager('mongodb', {
        DB_URL: DBFactory.getURL('mongodb', false, {
          DB_HOST: '127.0.0.1', DB_PORT: 27017, DB_NAME
        }),
        DB_NAME,
        _
      }).connect();

      try {
        await am.addNewGroup({groupName: 'typed'});
        await am.addNewAccount({
          user: 'typedUser', email: 'typed@example.name', pass: '123456',
          name: '', country: 'US', activated: true
        });
        await Promise.all([
          am.addNewPrivilege({
            privilegeName: 'canPublish',
            description: 'Can publish'
          }),
          am.addNewPrivilege({
            privilegeName: 'uploadLimit',
            description: 'Upload limit',
            type: 'number'
          }),
          am.addNewPrivilege({
            privilegeName: 'userDatabase',
            description: 'User database',
            type: 'string',
            userVarying: true
          }),
          am.addNewPrivilege({
            privilegeName: 'betaUser',
            description: 'Beta user',
            userVarying: true
          }),
          am.addNewPrivilege({
            privilegeName: 'userScore',
            description: 'User score',
            type: 'number',
            userVarying: true
          })
        ]);
        await Promise.all([
          am.addPrivilegeToGroup({
            groupName: 'typed', privilegeName: 'canPublish'
          }),
          am.addPrivilegeToGroup({
            groupName: 'typed', privilegeName: 'uploadLimit', value: 25
          }),
          am.addPrivilegeToUser({
            userID: 'typedUser', privilegeName: 'userDatabase',
            value: 'myDatabase'
          }),
          am.addPrivilegeToUser({
            userID: 'typedUser', privilegeName: 'betaUser'
          }),
          am.addPrivilegeToUser({
            userID: 'typedUser', privilegeName: 'userScore', value: 42
          })
        ]);

        const privileges = await am.getPrivilegesForGroup('typed');
        expect(
          Object.fromEntries(getPrivilegeValues(privileges))
        ).to.deep.equal({
          canPublish: true, uploadLimit: 25
        });
        const userPrivileges = await am.getPrivilegesForUser('typedUser');
        expect(
          Object.fromEntries(getPrivilegeValues(userPrivileges))
        ).to.deep.equal({
          userDatabase: 'myDatabase', betaUser: true, userScore: 42
        });
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'userDatabase',
          value: 'myDatabase'
        })).to.be.rejectedWith(Error, 'bad-privilege-scope');
        await expect(am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: 'uploadLimit', value: 25
        })).to.be.rejectedWith(Error, 'bad-privilege-scope');
        await am.editPrivilege({
          privilegeName: 'userDatabase',
          newPrivilegeName: 'primaryDatabase',
          description: 'Primary database'
        });
        const renamedPrivileges = await am.getPrivilegesForUser('typedUser');
        expect(
          Object.fromEntries(getPrivilegeValues(renamedPrivileges))
        ).to.deep.equal({
          primaryDatabase: 'myDatabase', betaUser: true, userScore: 42
        });
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'uploadLimit', value: '25'
        })).to.be.rejectedWith(TypeError, 'bad-privilege-value');
      } finally {
        await Promise.all([
          am.accounts?.deleteMany({}),
          am.groups?.deleteMany({}),
          am.privileges?.deleteMany({})
        ]);
      }
    });

    it(
      'AccountManager with bad `adapter` (passed to ' +
        '`DBFactory.createInstance`)',
      function () {
        expect(() => {
          /* eslint-disable no-new -- Testing */
          // @ts-expect-error Testing bad argument
          new AccountManager('badAdapter', {});
          /* eslint-enable no-new -- Testing */
        }).to.throw(
          Error,
          'Unrecognized database adapter "badAdapter"!'
        );
      }
    );

    it('AccountManager with no log', async function () {
      this.timeout(30000);
      const _ = await setI18n()({
        // @ts-expect-error Why isn't the first overload accepted?
        acceptsLanguages: () => ['en-US']
      });
      let erred = false;
      // Todo: Fix this per https://stackoverflow.com/questions/37372684/mongodb-3-2-authentication-failed
      try {
        const am = new AccountManager('mongodb', {
          DB_URL: DBFactory.getURL(
            'mongodb',
            false,
            {
              DB_HOST: '127.0.0.1',
              DB_PORT: 27017,
              DB_NAME: 'nogin'
            }
          ),
          DB_NAME: 'node_login',
          _
        });
        await am.connect();
      } catch {
        erred = true;
      }
      expect(erred).to.be.false;
    });

    /*
    it('AccountManager with authenticated user', async function () {
      this.timeout(30000);
      const _ = await setI18n({
        acceptsLanguages: () => ['en-US']
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
              DB_HOST: '127.0.0.1',
              DB_PORT: 27018,
              DB_NAME: 'nogin'
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
    // eslint-disable-next-line promise/avoid-new -- Testing
    return new Promise(
      (
        /** @type {(val?: void) => void} */
        resolve
      ) => {
        // eslint-disable-next-line promise/prefer-await-to-callbacks -- Testing
        jmlEngine(join(__dirname, 'fixtures/bad-template.js'), {}, (err) => {
          expect(err).to.be.an('Error');
          resolve();
        });
      }
    );
  });

  it('DBAbstraction', function () {
    expect(() => {
      DBAbstraction.getURL(true, {
        DB_USER: 'xyz',
        DB_PASS: 'abc',
        DB_HOST: '127.0.0.1',
        DB_PORT: 1234,
        DB_NAME: 'sth'
      });
    }).to.throw(Error, 'Abstract method');

    expect(() => {
      DBAbstraction.getObjectId(52);
    }).to.throw(Error, 'Abstract method');

    const dbAbstract = new DBAbstraction(
      // @ts-expect-error Just for testing
      {}
    );

    expect(() => {
      dbAbstract.connect();
    }).to.throw(Error, 'Abstract method');

    expect(() => {
      dbAbstract.getAccounts();
    }).to.throw(Error, 'Abstract method');
  });

  it('crypto (nogin)', function () {
    return expect(
      // @ts-expect-error Testing bad argument
      cryptoNL.saltAndHash(null)
    ).to.be.rejectedWith(Error);
  });
});

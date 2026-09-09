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
import layoutView from '../app/server/views/layout.js';
import doubleInputForm from '../app/server/views/modals/double-input-form.js';
import privilegesView from '../app/server/views/privileges.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Add `rejectedWith`, etc.
chai.use(chaiAsPromised);

describe('Programmatic', function () {
  it(
    'serializes boolean, string, numeric, array, and object privileges',
    function () {
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
        },
        {
          privilegeName: 'allowedTags',
          description: 'Allowed tags',
          type: 'array',
          value: ['news', 'sports'],
          builtin: false,
          date: Date.now()
        },
        {
          privilegeName: 'quota',
          description: 'Quota',
          type: 'object',
          value: {daily: 100},
          builtin: false,
          date: Date.now()
        }
      ]);

      expect(Object.fromEntries(privileges)).to.deep.equal({
        canPublish: true,
        userDatabase: 'myDatabase',
        uploadLimit: 25,
        allowedTags: ['news', 'sports'],
        quota: {daily: 100}
      });
    }
  );

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
      expect(rendered).to.include('ArrayPrivilege');
      expect(rendered).to.include('ObjectPrivilege');
      expect(rendered).to.include('StringPrivilege');
      expect(rendered).to.include('NotApplicable');
      expect(rendered).to.include('typedUser');
      expect(rendered).to.include('addPrivilegeToUser btn btn-primary');
      expect(rendered).to.include('addPrivilegeToUser-value-textarea');
      expect(rendered).to.include('addPrivilegeToGroup-value-textarea');
      expect(rendered).not.to.include(
        'addPrivilegeToGroup btn btn-primary","data-privilege":' +
        '"userDatabase'
      );
      expect(rendered).not.to.include('privateDatabase');
    });

  it('renders alternate view configurations', async function () {
    const _ = /** @type {import('intl-dom').I18NCallback<string>} */ (
      /** @type {unknown} */ ((/** @type {string|string[]} */ key) => (
        Array.isArray(key) ? key[0] : key
      ))
    );
    const modal = JSON.stringify(doubleInputForm({
      _,
      type: 'createGroup',
      inputDirections: 'GroupName',
      descriptionDirections: 'GroupDescription'
    }));
    expect(modal).not.to.include('PrivilegeType');
    expect(modal).not.to.include('VariesByUser');

    const layout = JSON.stringify(layoutView({
      _,
      template: 'test',
      langDir: {lang: 'ar', dir: 'rtl'},
      isRtl: true,
      content: [],
      scripts: [],
      title: 'RTL',
      favicon: '',
      stylesheet: '',
      noBuiltinStylesheets: false,
      localScripts: false,
      userJS: '',
      userJSModule: '',
      noPolyfill: false,
      useESM: false,
      csrfToken: '',
      error: '',
      triggerCoverage: false,
      securitySourceAttributes (_tag, source) {
        return {crossorigin: source};
      }
    }, {headPre: [], headPost: [], bodyPre: [], bodyPost: []}));
    expect(layout).to.include('bootstrap-rtl');

    const privileges = JSON.stringify(await privilegesView({
      _,
      layout: (content) => Promise.resolve(
        /** @type {[import('jamilih').JamilihDoc]} */ (
          /** @type {unknown} */ ([content])
        )
      ),
      hasEditPrivilegeAccess: false,
      hasAddPrivilegeToGroupAccess: false,
      hasRemovePrivilegeFromGroupAccess: true,
      hasReadGroupAccess: true,
      hasReadUsersAccess: false,
      privilegesInfo: [{
        privilegeName: 'readReports',
        description: 'Read reports',
        type: 'boolean',
        userVarying: false,
        builtin: false,
        usersInfo: [],
        groupsInfo: [{
          groupName: 'reporters',
          builtin: false,
          usersInfo: [{user: 'reader', _id: 'reader'}]
        }]
      }],
      groups: [],
      users: []
    }));
    expect(privileges).to.include('reporters');
    expect(privileges).not.to.include('reader');
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

      await expect(createServer({
        PORT: 3001,
        config: null,
        noHostValidation: true
      })).to.be.rejectedWith('EADDRINUSE');
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
    const DB_NAME = 'nogin-password-validation-test';

    beforeEach(async () => {
      await removeAccounts({all: true, DB_NAME});
      // Todo: Note that this JSON file wouldn't work if we needed to
      //  test against a working (and private) email as we do for login tests
      await addAccounts({
        user: ['brett'],
        email: ['brettz9@example.name'],
        pass: ['123456'],
        activated: [true],
        DB_NAME
      });
      console.log('done before');
    });

    afterEach(async () => {
      await removeAccounts({all: true, DB_NAME});
    });

    it('throws with bad password', function () {
      return expect(
        validUserPassword({
          user: 'brett',
          // @ts-expect-error Testing bad argument
          pass: null,
          DB_NAME
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
        await am.listIndexes();
        await am.addNewGroup({groupName: 'typed'});
        await am.addNewAccount({
          user: 'typedUser', email: 'typed@example.name', pass: '123456',
          name: '', country: 'US', activated: true
        });
        const typedAccount = await am.accounts?.findOne({user: 'typedUser'});
        /** @type {{account: {unactivatedEmail?: string}, user: string}[]} */
        const changedEmails = [];
        await am.updateAccount({
          user: 'typedUser', id: typedAccount?._id.toString(),
          email: 'typed-new@example.name', pass: '123456',
          name: 'Typed User', country: 'US'
        }, {
          changedEmailHandler (account, user) {
            changedEmails.push({account, user});
          }
        });
        expect(changedEmails).to.have.length(1);
        expect(changedEmails[0]?.user).to.equal('typedUser');
        expect(changedEmails[0]?.account).to.include({
          unactivatedEmail: 'typed-new@example.name'
        });
        const updatedAccount = await am.updateAccount({
          user: 'typedUser', email: 'typed@example.name',
          name: 'Updated Typed User', country: 'US', activated: true
        }, {forceUpdate: true});
        expect(updatedAccount).to.include({name: 'Updated Typed User'});
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
          }),
          am.addNewPrivilege({
            privilegeName: 'allowedTags',
            description: 'Allowed tags',
            type: 'array'
          }),
          am.addNewPrivilege({
            privilegeName: 'quota',
            description: 'Quota',
            type: 'object',
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
          am.addPrivilegeToGroup({
            groupName: 'typed', privilegeName: 'allowedTags',
            value: ['news', 'sports']
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
          }),
          am.addPrivilegeToUser({
            userID: 'typedUser', privilegeName: 'quota', value: {daily: 100}
          })
        ]);

        const privileges = await am.getPrivilegesForGroup('typed');
        expect(
          Object.fromEntries(getPrivilegeValues(privileges))
        ).to.deep.equal({
          canPublish: true, uploadLimit: 25, allowedTags: ['news', 'sports']
        });
        const userPrivileges = await am.getPrivilegesForUser('typedUser');
        expect(
          Object.fromEntries(getPrivilegeValues(userPrivileges))
        ).to.deep.equal({
          userDatabase: 'myDatabase', betaUser: true, userScore: 42,
          quota: {daily: 100}
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
          primaryDatabase: 'myDatabase', betaUser: true, userScore: 42,
          quota: {daily: 100}
        });
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'uploadLimit', value: '25'
        })).to.be.rejectedWith(TypeError, 'bad-privilege-value');
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'allowedTags', value: {}
        })).to.be.rejectedWith(TypeError, 'bad-privilege-value');
        await expect(am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: 'quota', value: [1, 2]
        })).to.be.rejectedWith(TypeError, 'bad-privilege-value');
        await expect(am.renameGroup({
          groupName: 'typed', newGroupName: ''
        })).to.be.rejectedWith(Error, 'bad-groupname');
        await expect(am.renameGroup({
          groupName: '', newGroupName: 'renamed'
        })).to.be.rejectedWith(Error, 'bad-old-groupname');
        await am.addNewGroup({groupName: 'duplicateGroup'});
        await expect(
          am.addNewGroup({groupName: 'duplicateGroup'})
        ).to.be.rejectedWith(Error, 'groupname-taken');
        await expect(am.renameGroup({
          groupName: 'typed', newGroupName: 'duplicateGroup'
        })).to.be.rejectedWith(Error, 'groupname-taken');
        await expect(am.addUserToGroup({
          groupName: '', userID: 'typedUser'
        })).to.be.rejectedWith(Error, 'bad-groupname');
        await expect(am.addUserToGroup({
          groupName: 'typed', userID: 'missingUser'
        })).to.be.rejectedWith(Error, 'user-missing');
        await expect(am.removeUserFromGroup({
          groupName: '', userID: 'typedUser'
        })).to.be.rejectedWith(Error, 'bad-groupname');
        await expect(am.removeUserFromGroup({
          groupName: 'typed', userID: 'missingUser'
        })).to.be.rejectedWith(Error, 'user-missing');
        await expect(am.addNewPrivilege({
          privilegeName: '', description: 'Missing name'
        })).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.addNewPrivilege({
          privilegeName: 'badDescription',
          // @ts-expect-error Testing bad argument
          description: null
        })).to.be.rejectedWith(TypeError, 'bad-privilege-description');
        await expect(am.addNewPrivilege({
          privilegeName: 'badType', description: 'Bad type',
          // @ts-expect-error Testing bad argument
          type: 'unknown'
        })).to.be.rejectedWith(TypeError, 'bad-privilege-type');
        await am.addNewPrivilege({
          privilegeName: 'duplicatePrivilege', description: 'First'
        });
        await expect(am.addNewPrivilege({
          privilegeName: 'duplicatePrivilege', description: 'Second'
        })).to.be.rejectedWith(Error, 'privilegename-taken');
        await expect(am.editPrivilege({
          privilegeName: 'canPublish',
          newPrivilegeName: 'duplicatePrivilege',
          description: 'Duplicate'
        })).to.be.rejectedWith(Error, 'privilegename-taken');
        await expect(
          am.deletePrivilegeByPrivilegeName('')
        ).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.editPrivilege({
          privilegeName: 'canPublish', newPrivilegeName: '', description: 'd'
        })).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.editPrivilege({
          privilegeName: '', newPrivilegeName: 'renamed', description: 'd'
        })).to.be.rejectedWith(Error, 'bad-old-privilegename');
        await expect(am.editPrivilege({
          privilegeName: 'missingPrivilege', newPrivilegeName: 'renamed',
          description: 'd'
        })).to.be.rejectedWith(Error, 'bad-old-privilegename');
        await expect(am.editPrivilege({
          privilegeName: 'canPublish', newPrivilegeName: 'canPublish',
          // @ts-expect-error Testing bad argument
          description: null
        })).to.be.rejectedWith(TypeError, 'bad-privilege-description');
        await am.groups?.insertOne({
          groupName: 'emptyAssignments', builtin: false, date: Date.now(),
          privilegeIDs: [], userIDs: []
        });
        await am.groups?.updateOne(
          {groupName: 'emptyAssignments'}, {$unset: {privilegeIDs: ''}}
        );
        expect(
          await am.getPrivilegesForGroup('emptyAssignments')
        ).to.deep.equal([]);
        await am.privileges?.insertOne({
          privilegeName: 'legacyGroupPrivilege', description: 'Legacy group',
          builtin: false, userVarying: false, date: Date.now()
        });
        await am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'legacyGroupPrivilege'
        });
        await am.privileges?.insertOne({
          privilegeName: 'legacyUserPrivilege', description: 'Legacy user',
          builtin: false, userVarying: true, date: Date.now()
        });
        await am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: 'legacyUserPrivilege'
        });
        await am.editPrivilege({
          privilegeName: 'legacyGroupPrivilege',
          newPrivilegeName: 'legacyGroupPrivilege',
          description: 'Updated legacy group'
        });

        const originalAccountFindOne = am.accounts?.findOne;
        const originalGroupFindOne = am.groups?.findOne;
        const originalPrivilegeFindOne = am.privileges?.findOne;
        const canPublishPrivilege = await am.privileges?.findOne({
          privilegeName: 'canPublish'
        });
        try {
          let accountLookup = 0;
          // @ts-expect-error Testing defensive database failures
          am.accounts.findOne = () => {
            accountLookup++;
            if (accountLookup === 1) {
              return Promise.reject(new Error('database-read-failed'));
            }
            return Promise.resolve(null);
          };
          await am.addNewAccount({
            user: 'lookupFailureOne', email: 'lookup1@example.name',
            pass: '123456', name: '', country: 'US', activated: false
          });

          accountLookup = 0;
          // @ts-expect-error Testing defensive database failures
          am.accounts.findOne = () => {
            accountLookup++;
            if (accountLookup === 2) {
              return Promise.reject(new Error('database-read-failed'));
            }
            return Promise.resolve(null);
          };
          await am.addNewAccount({
            user: 'lookupFailureTwo', email: 'lookup2@example.name',
            pass: '123456', name: '', country: 'US', activated: false
          });

          // @ts-expect-error Testing defensive database failures
          am.groups.findOne = () => {
            return Promise.reject(new Error('database-read-failed'));
          };
          await am.addNewGroup({groupName: 'lookupFailureGroup'});
          await expect(
            am.getPrivilegesForGroup('lookupFailureGroup')
          ).to.be.rejectedWith(Error, 'group-not-found');

          // @ts-expect-error Testing defensive database failures
          am.privileges.findOne = () => {
            return Promise.reject(new Error('database-read-failed'));
          };
          await am.addNewPrivilege({
            privilegeName: 'lookupFailurePrivilege', description: 'Lookup'
          });
          await expect(am.addPrivilegeToGroup({
            groupName: 'typed', privilegeName: 'lookupFailurePrivilege'
          })).to.be.rejectedWith(Error, 'privilege-missing');
          let privilegeLookup = 0;
          // @ts-expect-error Testing defensive database failures
          am.privileges.findOne = () => {
            privilegeLookup++;
            return privilegeLookup === 1
              ? Promise.resolve(canPublishPrivilege)
              : Promise.reject(new Error('database-read-failed'));
          };
          await am.editPrivilege({
            privilegeName: 'canPublish',
            newPrivilegeName: 'lookupFailureRename',
            description: 'Lookup rename'
          });
        } finally {
          if (originalAccountFindOne && am.accounts) {
            am.accounts.findOne = originalAccountFindOne;
          }
          if (originalGroupFindOne && am.groups) {
            am.groups.findOne = originalGroupFindOne;
          }
          if (originalPrivilegeFindOne && am.privileges) {
            am.privileges.findOne = originalPrivilegeFindOne;
          }
        }
        await expect(am.addPrivilegeToGroup({
          groupName: '', privilegeName: 'canPublish'
        })).to.be.rejectedWith(Error, 'bad-groupname');
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: ''
        })).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.addPrivilegeToGroup({
          groupName: 'typed', privilegeName: 'missingPrivilege'
        })).to.be.rejectedWith(Error, 'privilege-missing');
        await expect(am.removePrivilegeFromGroup({
          groupName: '', privilegeName: 'canPublish'
        })).to.be.rejectedWith(Error, 'bad-groupname');
        await expect(am.removePrivilegeFromGroup({
          groupName: 'typed', privilegeName: ''
        })).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.removePrivilegeFromGroup({
          groupName: 'typed', privilegeName: 'missingPrivilege'
        })).to.be.rejectedWith(Error, 'privilege-missing');
        await expect(
          am.getPrivilegesForGroup('missingGroup')
        ).to.be.rejectedWith(Error, 'group-not-found');
        await expect(am.addPrivilegeToUser({
          userID: '', privilegeName: 'betaUser'
        })).to.be.rejectedWith(Error, 'bad-user');
        await expect(am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: ''
        })).to.be.rejectedWith(Error, 'bad-privilegename');
        await expect(am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: 'missingPrivilege'
        })).to.be.rejectedWith(Error, 'privilege-missing');
        await expect(am.addPrivilegeToUser({
          userID: 'typedUser', privilegeName: 'userScore', value: Infinity
        })).to.be.rejectedWith(TypeError, 'bad-privilege-value');
        await expect(am.addPrivilegeToUser({
          userID: 'missingUser', privilegeName: 'betaUser'
        })).to.be.rejectedWith(Error, 'user-missing');
        await expect(
          am.getPrivilegesForUser('missingUser')
        ).to.be.rejectedWith(Error, 'user-missing');
        await am.deleteAllGroups();
        expect(await am.getAllGroups()).to.deep.equal([]);
      } finally {
        await Promise.all([
          am.accounts?.deleteMany({}),
          am.groups?.deleteMany({}),
          am.privileges?.deleteMany({})
        ]);
      }
    });

    it(
      '`activatedAccountExists` requires a present, activated account',
      async function () {
        this.timeout(30000);
        const DB_NAME = 'nogin-activated-account-test';
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
          expect(await am.activatedAccountExists('ghost')).to.be.false;

          await am.addNewAccount({
            user: 'pending', email: 'pending@example.name', pass: '123456',
            name: '', country: 'US', activated: false
          });
          expect(await am.activatedAccountExists('pending')).to.be.false;

          await am.addNewAccount({
            user: 'live', email: 'live@example.name', pass: '123456',
            name: '', country: 'US', activated: true
          });
          expect(await am.activatedAccountExists('live')).to.be.true;
        } finally {
          await am.accounts?.deleteMany({});
        }
      }
    );

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

    expect(() => {
      dbAbstract.getGroups();
    }).to.throw(Error, 'Abstract method');
  });

  it('crypto (nogin)', async function () {
    const hashedPassword = await cryptoNL.saltAndHash('secret');
    expect(
      await cryptoNL.validatePasswordV1('secret', hashedPassword)
    ).to.be.true;
    expect(
      await cryptoNL.validatePasswordV1('wrong', hashedPassword)
    ).to.be.false;
    await expect(
      // @ts-expect-error Testing bad argument
      cryptoNL.saltAndHash(null)
    ).to.be.rejectedWith(Error);
  });
});

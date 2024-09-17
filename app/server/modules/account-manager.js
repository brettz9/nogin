/**
 * @file Low-level operations on user accounts and groups.
 */

import safeCompare from 'safe-compare';

import {isNullish, uuid} from './common.js';

import DBFactory from './db-factory.js';

import {
  saltAndHash, validatePasswordV1
} from './crypto.js';

const builtInGroups = new Set([
  'nogin.loggedInUsers',
  'nogin.guests'
]);
const builtInPrivileges = new Set([
  'nogin.editPrivilege',
  'nogin.addPrivilegeToGroup',
  'nogin.removePrivilegeFromGroup',
  'nogin.readPrivilege',
  'nogin.readUsers',
  'nogin.deleteUsers',
  'nogin.editGroup',
  'nogin.addUserToGroup',
  'nogin.removeUserFromGroup',
  'nogin.readGroup'
]);

/**
  * @typedef {object} AccountInfo
  * @property {string} [_id] Auto-set
  * @property {string} [id]
  * @property {string} user
  * @property {string} name
  * @property {string} email
  * @property {string} country
  * @property {string} pass Will be overwritten with hash
  * @property {number} [passVer] Auto-generated version.
  * @property {number} [date] Auto-generated timestamp.
  * @property {boolean} [activated] Auto-set
  * @property {string} [activationCode] Auto-set
  * @property {string} [unactivatedEmail]
  * @property {number} [activationRequestDate] Timestamp
  * @property {string} [cookie] Auto-set
  * @property {string} [ip] Auto-set
  * @property {string} [passKey] Auto-set and unset
  */

/**
  * @typedef {object} AccountInfoFilter
  * @property {Object<"$in",string[]>} [user]
  * @property {Object<"$in",string[]>} [_id]
  * @property {Object<"$in",string[]>} [name]
  * @property {Object<"$in",string[]>} [email]
  * @property {Object<"$in",string[]>} [country]
  * @property {Object<"$in",string[]>} [pass]
  * @property {Object<"$in",number[]>} [passVer]
  * @property {Object<"$in",number[]>} [date] Timestamp
  * @property {Object<"$in",boolean[]>} [activated]
  * @property {Object<"$in",string[]>} [activationCode]
  * @property {Object<"$in",string[]>} [unactivatedEmail]
  * @property {Object<"$in",number[]>} [activationRequestDate] Timestamp
  */

/**
 * @typedef {object} GroupInfo
 * @property {string} [_id] Auto-set
 * @property {string} groupName
 * @property {string[]} privilegeIDs
 * @property {string[]} userIDs
 * @property {boolean} builtin
 * @property {number} date Auto-generated timestamp
 */

/**
 * @typedef {object} GroupInfoFilter
 * @property {{$in: string[]}} group
 */

/**
 * @typedef {object} PrivilegeInfo
 * @property {string} [_id] Auto-set
 * @property {string} privilegeName
 * @property {string} description
 * @property {boolean} builtin
 * @property {number} date Auto-generated timestamp
 */

const passVer = 1;

/**
 * Manages accounts.
 */
class AccountManager {
  /**
   * @param {AccountInfo} newData
   * @returns {Promise<string>}
   */
  static getAccountHash (newData) {
    // Add password into mix so can't be auto-enabled for other users
    return saltAndHash(newData.user + newData.pass);
  }

  /**
   * @param {"mongodb"} adapter
   * @param {import('./db-abstraction.js').DBConfigObject} config
   */
  constructor (adapter, config) {
    this.adapter = DBFactory.createInstance(adapter, config);
  }

  /**
   * @returns {Promise<AccountManager>}
   */
  async connect () {
    try {
      await this.adapter.connect();
      this.accounts = /** @type {import('mongodb').Collection} */ (
        await this.adapter.getAccounts()
      );
      // index fields 'user' & 'email' for faster new account validation
      await this.accounts.createIndex({
        user: 1,
        email: 1
        // Todo: May wish to enable these as well:
        /*
        activated: 1,
        cookie: 1,
        ip: 1,
        passKey: 1,
        activationCode: 1,
        unactivatedEmail: 1,
        activationRequestDate: 1,
        _id: 1
        */
      });
      this.groups = await this.adapter.getGroups();
      await this.accounts.createIndex({
        groupName: 1
      });

      await this.addDefaultGroups();

      this.privileges = await this.adapter.getPrivileges();

      await this.addDefaultPrivileges();

      await this.accounts.createIndex({
        privilegeName: 1
      });
    } catch (err) {
      // Not clear on how to check; we're just rethrowing here for
      //   now anyways
      // istanbul ignore next
      console.error(err);
      // Ignore for reasons as stated above previous line
      // istanbul ignore next
      throw err;
    }
    return this;
  }

  /**
   * Currently only in use by the CLI.
   * @returns {Promise<void>}
   */
  async listIndexes () {
    const indexes = await /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).indexes();
    for (const [i, index] of indexes.entries()) {
      console.log(
        this.adapter.config._(
          'index',
          {
            i,
            index: JSON.stringify(index, null, 2)
          }
        )
      );
    }
  }

  /**
   * @returns {Promise<import('mongodb').BulkWriteResult|void>}
   */
  async addDefaultGroups () {
    return await this.groups?.bulkWrite(
      [
        // If adding more here, add also to `builtInGroups` Set above
        {
          updateOne: {
            filter: {
              groupName: 'nogin.loggedInUsers'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                groupName: 'nogin.loggedInUsers',
                privilegeIDs: [],
                userIDs: [],
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              groupName: 'nogin.guests'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                groupName: 'nogin.guests',
                privilegeIDs: [],
                userIDs: [],
                builtin: true
              }
            }
          }
        }
      ]
    );
  }

  /**
   * @returns {Promise<import('mongodb').BulkWriteResult|void>}
   */
  async addDefaultPrivileges () {
    return await this.privileges?.bulkWrite(
      [
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.editPrivilege'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                // Todo: Could make more granular, but need to reflect in
                //         UI and API
                privilegeName: 'nogin.editPrivilege',
                description: 'Privilege to allow creating new privileges, ' +
                  'renaming them, and deleting them.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.addPrivilegeToGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.addPrivilegeToGroup',
                description: 'Privilege to allow adding privileges to groups.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.removePrivilegeFromGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.removePrivilegeFromGroup',
                description: 'Privilege to allow removing privileges ' +
                  'from groups.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.readPrivilege'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.readPrivilege',
                description: 'Privilege to allow reading and listing ' +
                                'of privileges.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.readUsers'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.readUsers',
                description: 'Privilege to allow reading and listing of users.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.deleteUsers'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.deleteUsers',
                description: 'Privilege to allow deleting users.',
                builtin: true
              }
            }
          }
        },

        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.editGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.editGroup',
                description: 'Privilege to allow creating new groups, ' +
                  'renaming them, and deleting them.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.addUserToGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.addUserToGroup',
                description: 'Privilege to allow adding users to groups.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.removeUserFromGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.removeUserFromGroup',
                description: 'Privilege to allow removing users from groups.',
                builtin: true
              }
            }
          }
        },
        {
          updateOne: {
            filter: {
              privilegeName: 'nogin.readGroup'
            },
            upsert: true,
            update: {
              $setOnInsert: {
                privilegeName: 'nogin.readGroup',
                description: 'Privilege to allow reading and listing ' +
                                'of groups.',
                builtin: true
              }
            }
          }
        }
      ]
    );
  }

  /*
    login validation methods
  */

  /**
   * @param {string} user
   * @param {string} pass The hashed password
   * @returns {Promise<Partial<AccountInfo>|null>}
   */
  async autoLogin (user, pass) {
    try {
      const o = await
      /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
        this.accounts
      ).findOne({user, activated: true});

      return safeCompare(/** @type {string} */ (o?.pass), pass)
        ? o
        // Todo: Could try to provide a coverage case for this,
        //  but it seems very obscure
        // See discussion under `app.get(routes.root)` for the obscure
        //  internal states that could exist to cause this
        // istanbul ignore next
        : null;
    } catch {
      // No special reason to expect it throwing
      // istanbul ignore next
      return null;
    }
  }

  /**
   * @param {AccountInfoFilter} acctInfo
   * @returns {Promise<Partial<AccountInfo>[]>}
   */
  getRecords (acctInfo) {
    return /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
      this.accounts
    // eslint-disable-next-line unicorn/no-array-callback-reference -- Mongo API
    ).find(acctInfo).toArray();
  }

  // /**
  //  * @param {GroupInfoFilter} groupInfo
  //  * @returns {Promise<Partial<GroupInfo>[]>}
  //  */
  // getGroups (groupInfo) {
  //   return /** @type {import('mongodb').Collection<Partial<GroupInfo>>} */ (
  //     this.groups
  // eslint-disable-next-line @stylistic/max-len -- Long
  //   // eslint-disable-next-line unicorn/no-array-callback-reference -- Mongo API
  //   ).find(groupInfo).toArray();
  // }

  /**
   * @returns {Promise<GroupInfo[]>}
   */
  async getAllGroups () {
    return await
    /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).find().toArray();
  }

  /**
   * @returns {Promise<PrivilegeInfo[]>}
   */
  async getAllPrivileges () {
    return await
    /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
      this.privileges
    ).find().toArray();
  }

  /**
   * @param {string} user
   * @param {string} pass The raw password
   * @returns {Promise<Partial<AccountInfo>>}
   */
  async manualLogin (user, pass) {
    let o;
    try {
      o = await
      /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
        this.accounts
      ).findOne({user, activated: true});
    } catch {}
    if (isNullish(o)) {
      throw new Error('user-not-found');
    }
    let valid = false;
    // These may throw
    switch (o.passVer) {
    case 1:
      valid = await validatePasswordV1(pass, /** @type {string} */ (o.pass));
      break;
    default:
      throw new Error('unexpected-pass-version-error');
    }
    if (!valid) {
      throw new Error('bad-password');
    }
    return o;
  }

  /**
   * @param {string} user
   * @param {string} ipAddress
   * @returns {Promise<string>} The cookie uuid
   */
  async generateLoginKey (user, ipAddress) {
    const cookie = uuid();
    await /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).findOneAndUpdate({user}, {$set: {
      ip: ipAddress,
      cookie
    }}, {returnDocument: 'after'});
    return cookie;
  }

  /**
   * @param {string} cookie
   * @param {string} ipAddress
   * @returns {Promise<Partial<AccountInfo>|null>}
   */
  async validateLoginKey (cookie, ipAddress) {
    // ensure the cookie maps to the user's last recorded ip address
    return await
    /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
      this.accounts
    ).findOne({cookie, ip: ipAddress});
  }

  /**
   * @param {string} email
   * @param {string} ipAddress
   * @returns {Promise<Partial<AccountInfo>>}
   */
  async generatePasswordKey (email, ipAddress) {
    const passKey = uuid();
    let o, e;
    try {
      o = /** @type {import('mongodb').WithId<any> | null} */ (await
      /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
        this.accounts
      ).findOneAndUpdate({email}, {$set: {
        ip: ipAddress,
        passKey
      }, $unset: {cookie: ''}}, {returnDocument: 'after'}));
    } catch (err) {
      // Above should not throw readily
      // istanbul ignore next
      e = err;
    }

    if (o) {
      return o;
    }
    // Todo: Either i18nize these in the UI or if better to avoid sniffing
    //  existence of hidden user accounts, avoid this specific message,
    //  or avoid throwing at all
    throw e ||
      new Error('email-not-found');
  }

  /**
   * @param {string} passKey
   * @param {string} ipAddress
   * @returns {Promise<Partial<AccountInfo>|null>}
   */
  async validatePasswordKey (passKey, ipAddress) {
    // ensure the passKey maps to the user's last recorded ip address
    return await
    /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
      this.accounts
    ).findOne({passKey, ip: ipAddress});
  }

  /*
    record insertion, update & deletion methods
  */

  /**
   * @param {AccountInfo} newData
   * @param {{
   *   allowCustomPassVer?: boolean
   * }} [allowCustomPassVer]
   * @returns {Promise<AccountInfo & {
   *   activationCode: string
   * }>}
   * @todo Would ideally check for multiple errors to report back all issues
   *   at once.
   */
  async addNewAccount (newData, {allowCustomPassVer = false} = {}) {
    let o;
    try {
      o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne({
        user: newData.user,
        activated: true
      });
    } catch {}
    if (o) {
      throw new Error('username-taken');
    }

    let _o;
    try {
      _o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne({
        email: newData.email,
        activated: true
      });
    } catch {}
    if (_o) {
      throw new Error('email-taken');
    }

    const [accountHash, passHash] = await Promise.all([
      // Add password into mix so can't be auto-enabled for other users
      AccountManager.getAccountHash(newData),
      saltAndHash(newData.pass)
    ]);

    newData.activationCode = accountHash;
    newData.activated = Boolean(newData.activated);
    newData.pass = passHash;
    newData.passVer = (allowCustomPassVer && newData.passVer) || passVer;
    if (!newData.name) {
      // Avoid business logic or templates needing to deal with nullish names
      newData.name = '';
    }

    // Append date stamp when record was created
    newData.date = Date.now();

    await /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
      this.accounts
    ).insertOne(newData);
    if (newData.activated) {
      await this.deleteAccounts({
        user: newData.user,
        activated: false
      });
    }
    return (
      /**
       * @type {AccountInfo & {
       *   activationCode: string
       * }}
       */ (newData)
    );
  }

  /**
   * @param {Partial<GroupInfo>} data
   * @returns {Promise<GroupInfo>}
   */
  async addNewGroup (data) {
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-groupname');
    }

    let o;
    try {
      // eslint-disable-next-line @stylistic/max-len -- Long
      o = await /** @type {import('mongodb').Collection<Partial<GroupInfo>>} */ (
        this.groups
      ).findOne({
        groupName: data.groupName
      });
    } catch {}
    if (o) {
      throw new Error('groupname-taken');
    }

    const newData = {
      groupName: data.groupName,
      userIDs: [],
      privilegeIDs: [],
      builtin: false,
      // Append date stamp when record was created
      date: Date.now()
    };

    await /** @type {import('mongodb').Collection<Partial<GroupInfo>>} */ (
      this.groups
    ).insertOne(newData);

    return newData;
  }

  /**
   * @param {string} userID
   * @returns {Promise<string|void>}
   */
  async getGroupForUser (userID) {
    let o;
    try {
      // eslint-disable-next-line @stylistic/max-len -- Long
      o = await /** @type {import('mongodb').Collection<Partial<GroupInfo>>} */ (
        this.groups
      ).findOne({
        userIDs: {$in: [userID]}
      });
    } catch {}
    if (!o) {
      return undefined;
      // throw new Error('group-not-found');
    }
    return /** @type {string} */ (o.groupName);
  }

  /**
   * @param {Partial<GroupInfo> & {newGroupName: string}} data
   * @returns {Promise<void>}
   */
  async renameGroup (data) {
    if (typeof data.newGroupName !== 'string' || !data.newGroupName ||
      builtInGroups.has(data.newGroupName)
    ) {
      throw new Error('bad-groupname');
    }
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-old-groupname');
    }

    let o;
    try {
      o = await /** @type {import('mongodb').Collection<GroupInfo>} */ (
        this.groups
      ).findOne({
        groupName: data.newGroupName
      });
    } catch {}
    if (o) {
      throw new Error('groupname-taken');
    }

    const filter = {
      groupName: data.groupName
    };

    const newData = {
      groupName: data.newGroupName,
      // Append date stamp when record was modified
      date: Date.now()
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filter,
      {
        // Strip out `undefined` which now are treated by Mongodb as null
        // eslint-disable-next-line unicorn/prefer-structured-clone -- Different
        $set: JSON.parse(JSON.stringify(newData))
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {Partial<GroupInfo> & {userID: string}} data
   * @returns {Promise<void>}
   */
  async addUserToGroup (data) {
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-groupname');
    }

    let _o;
    const userFilter = {
      user: {$eq: data.userID}
    };
    try {
      _o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne(userFilter);
    } catch {}
    if (!_o) {
      throw new Error('user-missing');
    }

    // First remove user from any other groups
    await this.removeUserIDFromGroup(data.userID);

    const filterAdd = {
      groupName: data.groupName
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filterAdd,
      {
        $addToSet: {userIDs: data.userID},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {Partial<GroupInfo> & {userID: string}} data
   * @returns {Promise<void>}
   */
  async removeUserFromGroup (data) {
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-groupname');
    }

    let _o;
    const userFilter = {
      user: {$eq: data.userID}
    };
    try {
      _o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne(userFilter);
    } catch {}
    if (!_o) {
      throw new Error('user-missing');
    }

    const filter = {
      groupName: data.groupName
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filter,
      {
        $pull: {userIDs: data.userID},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {Partial<PrivilegeInfo>} data
   * @returns {Promise<PrivilegeInfo>}
   */
  async addNewPrivilege (data) {
    if (typeof data.privilegeName !== 'string' || !data.privilegeName ||
      builtInPrivileges.has(data.privilegeName)
    ) {
      throw new Error('bad-privilegename');
    }

    if (typeof data.description !== 'string') {
      throw new TypeError('bad-privilege-description');
    }

    let o;
    try {
      // eslint-disable-next-line @stylistic/max-len -- Long
      o = await /** @type {import('mongodb').Collection<Partial<PrivilegeInfo>>} */ (
        this.privileges
      ).findOne({
        privilegeName: data.privilegeName
      });
    } catch {}
    if (o) {
      throw new Error('privilegename-taken');
    }

    const newData = {
      privilegeName: data.privilegeName,
      description: data.description,
      builtin: false,
      // Append date stamp when record was created
      date: Date.now()
    };

    await /** @type {import('mongodb').Collection<Partial<PrivilegeInfo>>} */ (
      this.privileges
    ).insertOne(newData);

    return newData;
  }

  /**
   * @param {string} privilege
   * @returns {Promise<void>}
   */
  async removePrivilegeIDFromGroup (privilege) {
    const filter = {
      privilegeIDs: {$in: [privilege]}
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filter,
      {
        $pull: {privilegeIDs: privilege},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {Partial<GroupInfo> & {privilegeName: string}} data
   * @returns {Promise<void>}
   */
  async addPrivilegeToGroup (data) {
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-groupname');
    }
    if (typeof data.privilegeName !== 'string' || !data.privilegeName) {
      throw new Error('bad-privilegename');
    }

    let _o;
    const privilegeFilter = {
      privilegeName: {$eq: data.privilegeName}
    };
    try {
      _o = await /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
        this.privileges
      ).findOne(privilegeFilter);
    } catch {}
    if (!_o) {
      throw new Error('privilege-missing');
    }

    const filterAdd = {
      groupName: data.groupName
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filterAdd,
      {
        $addToSet: {privilegeIDs: data.privilegeName},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {Partial<GroupInfo> & {privilegeName: string}} data
   * @returns {Promise<void>}
   */
  async removePrivilegeFromGroup (data) {
    if (typeof data.groupName !== 'string' || !data.groupName) {
      throw new Error('bad-groupname');
    }
    if (typeof data.privilegeName !== 'string' || !data.privilegeName) {
      throw new Error('bad-privilegename');
    }

    let _o;
    const privilegeFilter = {
      privilegeName: {$eq: data.privilegeName}
    };
    try {
      _o = await /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
        this.privileges
      ).findOne(privilegeFilter);
    } catch {}
    if (!_o) {
      throw new Error('privilege-missing');
    }

    const filter = {
      groupName: data.groupName
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filter,
      {
        $pull: {privilegeIDs: data.privilegeName},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {string} privilegeName
   * @returns {Promise<Partial<PrivilegeInfo>|null|undefined>}
   */
  async getPrivilege (privilegeName) {
    let o;
    try {
      // eslint-disable-next-line @stylistic/max-len -- Long
      o = await /** @type {import('mongodb').Collection<Partial<PrivilegeInfo>>} */ (
        this.privileges
      ).findOne({
        privilegeName
      });
    } catch {}
    return o;
  }

  /**
   * @param {string} groupName
   * @returns {Promise<PrivilegeInfo[]>}
   */
  async getPrivilegesForGroup (groupName) {
    let o;
    try {
      // eslint-disable-next-line @stylistic/max-len -- Long
      o = await /** @type {import('mongodb').Collection<Partial<GroupInfo>>} */ (
        this.groups
      ).findOne({
        groupName
      });
    } catch {}
    if (!o) {
      throw new Error('group-not-found');
    }

    return await Promise.all(/** @type {Promise<PrivilegeInfo>[]} */ (
      /** @type {string[]} */
      (o.privilegeIDs).map(async (privilegeName) => {
        // eslint-disable-next-line @stylistic/max-len -- Long
        return await /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
          this.privileges
        ).findOne({
          privilegeName
        });
      }).filter(Boolean)
    ));
  }

  /**
   * @param {string} activationCode
   * @returns {Promise<import('mongodb').UpdateResult|
   *   import('mongodb').Document>}
   */
  async activateAccount (activationCode) {
    let o;
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const unactivatedConditions = {
      $and: [
        {activationCode},
        {$or: [
          {activated: false},
          {unactivatedEmail: {$exists: true}}
        ]},
        {$or: [
          {activationRequestDate: null},
          {activationRequestDate: {$gt: twentyFourHoursAgo}}
        ]}
      ]
    };

    try {
      o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne(unactivatedConditions);
    } catch {}

    if (!o) {
      throw new Error('activationCodeProvidedInvalid');
    }

    // Overwrite any previous email now that confirmed (if this was an
    //   update)
    o.email = o.unactivatedEmail || o.email;
    delete o.activationRequestDate;
    delete o.unactivatedEmail;
    o.activated = true;
    const ret = /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).replaceOne(unactivatedConditions, o);
    await this.deleteAccounts({
      user: o.user,
      activated: false
    });
    return ret;
  }

  /**
  * @callback ChangedEmailHandler
  * @param {Partial<AccountInfo>} acct
  * @param {string} user Since not provided on `acct`
  * @returns {void}
  */

  /**
   * @param {Partial<AccountInfo> & {
   *   user: string
   * }} newData
   * @param {object} cfg
   * @param {boolean} [cfg.forceUpdate]
   * @param {ChangedEmailHandler} [cfg.changedEmailHandler]
   * @returns {Promise<
   *   import('mongodb').WithId<import('mongodb').Document>
   * >}
   */
  async updateAccount (newData, {forceUpdate, changedEmailHandler}) {
    let _o;

    // Exclude the user's own account (as we don't want an
    //  `email-taken` error by finding their account).
    const differentUserWithEmailFilter = {
      email: newData.email,
      user: {$ne: newData.user}
    };
    try {
      _o = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne(differentUserWithEmailFilter);
    } catch {}
    if (_o) {
      throw new Error('email-taken');
    }

    let oldAccount;
    try {
      /**
       * @type {{
       *   user: string|undefined,
       *   activated?: boolean
       * }}
       */
      const oldAccountFilter = {
        user: newData.user
      };
      if (!forceUpdate) {
        oldAccountFilter.activated = true;
      }
      oldAccount = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOne(oldAccountFilter);
    } catch {}
    // Todo: Should only occur if user established session and then we
    //  deleted their account
    // istanbul ignore if
    if (!oldAccount) {
      throw new Error('session-lost');
    }
    const changedEmail = oldAccount.email !== newData.email;

    /**
     * @param {Partial<AccountInfo> & {
     *   user: string,
     *   id?: string
     * }} cfg
     * @returns {Promise<
     *   import('mongodb').WithId<import('mongodb').Document>
     * >}
     */
    const findOneAndUpdate = async ({
      name, email, country, pass, id, user, activated,
      unactivatedEmail, activationRequestDate
    }) => {
      const addingTemporaryEmail = !forceUpdate && changedEmail;

      /** @type {Partial<AccountInfo>} */
      const o = {
        name, country,
        ...(addingTemporaryEmail
          ? {
            unactivatedEmail: newData.email,
            activationRequestDate: Date.now()
          }
          : forceUpdate
            ? {email, unactivatedEmail, activationRequestDate}
            : null
        ),
        // Will be `true` unless setting to `false` from non-web API
        activated: !forceUpdate || activated !== false
      };
      if (addingTemporaryEmail) {
        // Add password into mix so can't be auto-enabled for other users
        const accountHash = await AccountManager.getAccountHash(
          // Todo: What to do if no pass?
          /** @type {Required<AccountInfo>} */ (newData)
        );
        o.activationCode = accountHash;
      }
      if (pass) {
        o.pass = pass;
        o.passVer = passVer;
      }
      const filter = id || !forceUpdate
        ? {
          _id:
          /** @type {typeof import('./db-adapters/MongoDB.js').MongoDB} */ (
            this.adapter.constructor
          ).getObjectId(id)
        }
        : {user};

      const ret = await /** @type {import('mongodb').Collection} */ (
        this.accounts
      ).findOneAndUpdate(
        filter,
        {
          // Strip out `undefined` which now are treated by Mongodb as null
          // eslint-disable-next-line @stylistic/max-len -- Long
          // eslint-disable-next-line unicorn/prefer-structured-clone -- Different
          $set: JSON.parse(JSON.stringify(o))
        },
        {upsert: true, returnDocument: 'after'}
      );
      if (changedEmailHandler && addingTemporaryEmail) {
        await changedEmailHandler(o, user);
      }
      // istanbul ignore if -- Should not occur?
      if (!ret) {
        throw new Error('missing-user');
      }
      return ret;
    };
    if (!newData.pass) {
      return findOneAndUpdate(newData);
    }
    const hash = await saltAndHash(newData.pass);
    newData.pass = hash;
    return findOneAndUpdate(newData);
  }

  /**
   * @param {string} passKey
   * @param {string} newPass
   * @returns {Promise<import('mongodb').WithId<any> | null>}
   */
  async updatePassword (passKey, newPass) {
    const hash = await saltAndHash(newPass);
    return /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).findOneAndUpdate({passKey}, {
      $set: {pass: hash, passVer},
      $unset: {passKey: ''}
    }, {upsert: true, returnDocument: 'after'});
  }

  /*
    account lookup methods
  */

  /**
   * @returns {Promise<Partial<AccountInfo>[]>}
   */
  async getAllRecords () {
    return await
    /** @type {import('mongodb').Collection<Partial<AccountInfo>>} */ (
      this.accounts
    ).find().toArray();
  }

  /**
   * @param {string} id
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deleteAccountById (id) {
    // Todo: Should really run `await this.removeUserIDFromGroup(userID);`,
    //        but requires knowing the user ID
    return await
    /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).deleteOne({
      _id: /** @type {typeof import('./db-adapters/MongoDB.js').MongoDB} */ (
        this.adapter.constructor
      ).getObjectId(id)
    });
  }

  /**
   * @param {string} groupName
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deleteGroupByGroupName (groupName) {
    if (typeof groupName !== 'string' || !groupName ||
      builtInGroups.has(groupName)
    ) {
      throw new Error('bad-groupname');
    }

    return await
    /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).deleteOne({
      groupName
    });
  }

  /**
   * @param {string} userID
   * @returns {Promise<void>}
   */
  async removeUserIDFromGroup (userID) {
    const filter = {
      userIDs: {$in: [userID]}
    };

    await /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).findOneAndUpdate(
      filter,
      {
        $pull: {userIDs: userID},
        $set: {date: Date.now()}
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {string} privilegeName
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deletePrivilegeByPrivilegeName (privilegeName) {
    if (typeof privilegeName !== 'string' || !privilegeName ||
      builtInPrivileges.has(privilegeName)
    ) {
      throw new Error('bad-privilegename');
    }

    return await
    /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
      this.privileges
    ).deleteOne({
      privilegeName
    });
  }

  /**
   * @param {Partial<PrivilegeInfo> & {newPrivilegeName: string}} data
   * @returns {Promise<void>}
   */
  async editPrivilege (data) {
    if (typeof data.newPrivilegeName !== 'string' || !data.newPrivilegeName ||
      builtInPrivileges.has(data.newPrivilegeName)
    ) {
      throw new Error('bad-privilegename');
    }
    if (typeof data.privilegeName !== 'string' || !data.privilegeName) {
      throw new Error('bad-old-privilegename');
    }
    if (typeof data.description !== 'string') {
      throw new TypeError('bad-privilege-description');
    }

    // User may also be just editing description
    if (data.newPrivilegeName !== data.privilegeName) {
      let o;
      try {
        o = await /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
          this.privileges
        ).findOne({
          privilegeName: data.newPrivilegeName
        });
      } catch {}
      if (o) {
        throw new Error('privilegename-taken');
      }
    }

    const filter = {
      privilegeName: data.privilegeName
    };

    const newData = {
      privilegeName: data.newPrivilegeName,
      description: data.description,
      // Append date stamp when record was modified
      date: Date.now()
    };

    await /** @type {import('mongodb').Collection<PrivilegeInfo>} */ (
      this.privileges
    ).findOneAndUpdate(
      filter,
      {
        // Strip out `undefined` which now are treated by Mongodb as null
        // eslint-disable-next-line unicorn/prefer-structured-clone -- Different
        $set: JSON.parse(JSON.stringify(newData))
      },
      {upsert: false, returnDocument: 'after'}
    );
  }

  /**
   * @param {AccountInfoFilter} acctInfo
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deleteAccounts (acctInfo) {
    const userID = acctInfo.user?.$in?.[0];
    // Todo: Should really try even if userID is missing, but filter won't work
    if (userID) {
      // Remove any references to the user ID within groups
      await this.removeUserIDFromGroup(userID);
    }

    return await
    /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).deleteMany(acctInfo);
  }

  /**
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deleteAllAccounts () {
    return await
    /** @type {import('mongodb').Collection} */ (
      this.accounts
    ).deleteMany({});
  }

  /**
   * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
   */
  async deleteAllGroups () {
    return await
    /** @type {import('mongodb').Collection<GroupInfo>} */ (
      this.groups
    ).deleteMany({});
  }
}

export default AccountManager;

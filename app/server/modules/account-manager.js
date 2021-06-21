'use strict';

const safeCompare = require('safe-compare');

const {isNullish, uuid} = require('./common.js');
const {
  saltAndHash, validatePasswordV1
} = require('./crypto.js');

const DBFactory = require('./db-factory.js');

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
   * @param {DBConfigObject} config
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
      this.accounts = await this.adapter.getAccounts();
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
    const indexes = await this.accounts.indexes();
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

  /*
    login validation methods
  */

  /**
   * @param {string} user
   * @param {string} pass The hashed password
   * @returns {Promise<AccountInfo|null>}
   */
  async autoLogin (user, pass) {
    try {
      const o = await this.accounts.findOne({user, activated: true});
      return safeCompare(o.pass, pass)
        ? o
        // Todo: Could try to provide a coverage case for this,
        //  but it seems very obscure
        // See discussion under `app.get(routes.root)` for the obscure
        //  internal states that could exist to cause this
        // istanbul ignore next
        : null;
    } catch (err) {
      // No special reason to expect it throwing
      // istanbul ignore next
      return null;
    }
  }

  /**
   * @param {AccountInfoFilter} acctInfo
   * @returns {Promise<AccountInfo[]>}
   */
  getRecords (acctInfo) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return this.accounts.find(acctInfo).toArray();
  }

  /**
   * @param {string} user
   * @param {string} pass The raw password
   * @returns {Promise<AccountInfo>}
   */
  async manualLogin (user, pass) {
    let o;
    try {
      o = await this.accounts.findOne({user, activated: true});
    } catch (err) {}
    if (isNullish(o)) {
      throw new Error('user-not-found');
    }
    let valid = false;
    // These may throw
    switch (o.passVer) {
    case 1:
      valid = await validatePasswordV1(pass, o.pass);
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
    await this.accounts.findOneAndUpdate({user}, {$set: {
      ip: ipAddress,
      cookie
    }}, {returnDocument: 'after'});
    return cookie;
  }

  /* eslint-disable require-await */
  /**
   * @param {string} cookie
   * @param {string} ipAddress
   * @returns {Promise<AccountInfo>}
   */
  async validateLoginKey (cookie, ipAddress) {
    /* eslint-enable require-await */
    // ensure the cookie maps to the user's last recorded ip address
    return this.accounts.findOne({cookie, ip: ipAddress});
  }

  /**
   * @param {string} email
   * @param {string} ipAddress
   * @returns {Promise<AccountInfo>}
   */
  async generatePasswordKey (email, ipAddress) {
    const passKey = uuid();
    let o, e;
    try {
      o = await this.accounts.findOneAndUpdate({email}, {$set: {
        ip: ipAddress,
        passKey
      }, $unset: {cookie: ''}}, {returnDocument: 'after'});
    } catch (err) {
      // Above should not throw readily
      // istanbul ignore next
      e = err;
    }

    if (o && !isNullish(o.value)) {
      return o.value;
    }
    // Todo: Either i18nize these in the UI or if better to avoid sniffing
    //  existence of hidden user accounts, avoid this specific message,
    //  or avoid throwing at all
    throw e ||
      new Error('email-not-found');
  }

  /* eslint-disable require-await */
  /**
   * @param {string} passKey
   * @param {string} ipAddress
   * @returns {Promise<AccountInfo>}
   */
  async validatePasswordKey (passKey, ipAddress) {
    /* eslint-enable require-await */
    // ensure the passKey maps to the user's last recorded ip address
    return this.accounts.findOne({passKey, ip: ipAddress});
  }

  /*
    record insertion, update & deletion methods
  */

  /**
  * @typedef {PlainObject} AccountInfoFilter
  * @property {PlainObject<"$in",string[]>} user
  * @property {PlainObject<"$in",string[]>} name
  * @property {PlainObject<"$in",string[]>} email
  * @property {PlainObject<"$in",string[]>} country
  * @property {PlainObject<"$in",string[]>} pass
  * @property {PlainObject<"$in",number[]>} passVer
  * @property {PlainObject<"$in",number[]>} date Timestamp
  * @property {PlainObject<"$in",boolean[]>} activated
  * @property {PlainObject<"$in",string[]>} activationCode
  * @property {PlainObject<"$in",string[]>} unactivatedEmail
  * @property {PlainObject<"$in",number[]>} activationRequestDate Timestamp
  */

  /**
  * @typedef {PlainObject} AccountInfo
  * @property {string} _id Auto-set
  * @property {string} user
  * @property {string} name
  * @property {string} email
  * @property {string} pass Will be overwritten with hash
  * @property {number} passVer Auto-generated version.
  * @property {number} date Auto-generated timestamp.
  * @property {boolean} activated Auto-set
  * @property {string} activationCode Auto-set
  * @property {string} unactivatedEmail
  * @property {number} activationRequestDate Timestamp
  * @property {string} cookie Auto-set
  * @property {string} ip Auto-set
  * @property {string} passKey Auto-set and unset
  */

  /**
   * @param {AccountInfo} newData
   * @param {boolean} [allowCustomPassVer=false]
   * @returns {Promise<AccountInfo>}
   * @todo Would ideally check for multiple erros to report back all issues
   *   at once.
   */
  async addNewAccount (newData, {allowCustomPassVer = false} = {}) {
    let o;
    try {
      o = await this.accounts.findOne({
        user: newData.user,
        activated: true
      });
    } catch (err) {}
    if (o) {
      throw new Error('username-taken');
    }

    let _o;
    try {
      _o = await this.accounts.findOne({
        email: newData.email,
        activated: true
      });
    } catch (err) {}
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

    await this.accounts.insertOne(newData);
    if (newData.activated) {
      await this.deleteAccounts({
        user: newData.user,
        activated: false
      });
    }
    return newData;
  }

  /**
   * @param {string} activationCode
   * @returns {Promise<AccountInfo>}
   */
  async activateAccount (activationCode) {
    let o;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
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
      o = await this.accounts.findOne(unactivatedConditions);
    } catch (err) {}

    if (!o) {
      throw new Error('activationCodeProvidedInvalid');
    }

    // Overwrite any previous email now that confirmed (if this was an
    //   update)
    o.email = o.unactivatedEmail || o.email;
    delete o.activationRequestDate;
    delete o.unactivatedEmail;
    o.activated = true;
    const ret = this.accounts.replaceOne(unactivatedConditions, o);
    await this.deleteAccounts({
      user: o.user,
      activated: false
    });
    return ret;
  }

  /**
  * @callback ChangedEmailHandler
  * @param {AccountInfo} acct
  * @param {string} user Since not provided on `acct`
  * @returns {void}
  */

  /**
   * @param {AccountInfo} newData
   * @param {PlainObject} cfg
   * @param {boolean} cfg.forceUpdate
   * @param {ChangedEmailHandler} cfg.changedEmailHandler
   * @returns {Promise<FindAndModifyWriteOpResult>}
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
      _o = await this.accounts.findOne(differentUserWithEmailFilter);
    } catch (err) {}
    if (_o) {
      throw new Error('email-taken');
    }

    let oldAccount;
    try {
      const oldAccountFilter = {
        user: newData.user
      };
      if (!forceUpdate) {
        oldAccountFilter.activated = true;
      }
      oldAccount = await this.accounts.findOne(oldAccountFilter);
    } catch (err) {}
    // Todo: Should only occur if user established session and then we
    //  deleted their account
    // istanbul ignore if
    if (!oldAccount) {
      throw new Error('session-lost');
    }
    const changedEmail = oldAccount.email !== newData.email;

    const findOneAndUpdate = async ({
      name, email, country, pass, id, user, activated,
      unactivatedEmail, activationRequestDate
    }) => {
      const addingTemporaryEmail = !forceUpdate && changedEmail;

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
        const accountHash = await AccountManager.getAccountHash(newData);
        o.activationCode = accountHash;
      }
      if (pass) {
        o.pass = pass;
        o.passVer = passVer;
      }
      const filter = id || !forceUpdate
        ? {_id: this.adapter.constructor.getObjectId(id)}
        : {user};

      const ret = await this.accounts.findOneAndUpdate(
        filter,
        {$set: o},
        {upsert: true, returnDocument: 'after'}
      );
      if (addingTemporaryEmail) {
        await changedEmailHandler(o, user);
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
   * @returns {Promise<FindAndModifyWriteOpResult>}
   */
  async updatePassword (passKey, newPass) {
    const hash = await saltAndHash(newPass);
    return this.accounts.findOneAndUpdate({passKey}, {
      $set: {pass: hash, passVer},
      $unset: {passKey: ''}
    }, {upsert: true, returnDocument: 'after'});
  }

  /*
    account lookup methods
  */

  /* eslint-disable require-await */
  /**
   * @returns {Promise<AccountInfo[]>}
   */
  async getAllRecords () {
    /* eslint-enable require-await */
    return this.accounts.find().toArray();
  }

  /* eslint-disable require-await */
  /**
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResult>}
   */
  async deleteAccountById (id) {
    /* eslint-enable require-await */
    return this.accounts.deleteOne({
      _id: this.adapter.constructor.getObjectId(id)
    });
  }

  /* eslint-disable require-await */
  /**
   * @param {AccountInfoFilter} acctInfo
   * @returns {Promise<DeleteWriteOpResult>}
   */
  async deleteAccounts (acctInfo) {
    /* eslint-enable require-await */
    return this.accounts.deleteMany(acctInfo);
  }

  /* eslint-disable require-await */
  /**
   * @returns {Promise<DeleteWriteOpResult>}
   */
  async deleteAllAccounts () {
    /* eslint-enable require-await */
    return this.accounts.deleteMany({});
  }
}

module.exports = AccountManager;

'use strict';

const {isNullish, guid} = require('./common.js');
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
      await this.accounts.createIndex({user: 1, email: 1});
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
      return o.pass === pass ? o : null;
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
    // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
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
   * @returns {Promise<string>} The cookie GUID
   */
  async generateLoginKey (user, ipAddress) {
    const cookie = guid();
    await this.accounts.findOneAndUpdate({user}, {$set: {
      ip: ipAddress,
      cookie
    }}, {returnOriginal: false});
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
    const passKey = guid();
    let o, e;
    try {
      o = await this.accounts.findOneAndUpdate({email}, {$set: {
        ip: ipAddress,
        passKey
      }, $unset: {cookie: ''}}, {returnOriginal: false});
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
  * @property {PlainObject<"$in",string[]>} _id Auto-set
  * @property {PlainObject<"$in",string[]>} user
  * @property {PlainObject<"$in",string[]>} name
  * @property {PlainObject<"$in",string[]>} email
  * @property {PlainObject<"$in",string[]>} pass
  * @property {PlainObject<"$in",number[]>} passVer
  * @property {PlainObject<"$in",number[]>} date
  * @property {PlainObject<"$in",string[]>} activationCode
  * @property {PlainObject<"$in",boolean[]>} activated
  * @property {PlainObject<"$in",string[]>} cookie
  * @property {PlainObject<"$in",string[]>} ip
  * @property {PlainObject<"$in",string[]>} passKey
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
  * @property {string} activationCode Auto-set
  * @property {boolean} activated Auto-set
  * @property {string} cookie Auto-set
  * @property {string} ip Auto-set
  * @property {string} passKey Auto-set and unset
  */

  /**
   * @param {AccountInfo} newData
   * @returns {Promise<AccountInfo>}
   * @todo Would ideally check for multiple erros to report back all issues
   *   at once.
   */
  async addNewAccount (newData) {
    let o;
    try {
      o = await this.accounts.findOne({user: newData.user});
    } catch (err) {}
    if (o) {
      throw new Error('username-taken');
    }
    let _o;
    try {
      _o = await this.accounts.findOne({email: newData.email});
    } catch (err) {}
    if (_o) {
      throw new Error('email-taken');
    }

    const [userHash, passHash] = await Promise.all([
      saltAndHash(newData.user),
      saltAndHash(newData.pass)
    ]);

    newData.activationCode = userHash;
    newData.activated = Boolean(newData.activated);
    newData.pass = passHash;
    newData.passVer = passVer;
    if (!newData.name) {
      // Avoid business logic or templates needing to deal with nullish names
      newData.name = '';
    }

    // Append date stamp when record was created
    newData.date = new Date().getTime();

    await this.accounts.insertOne(newData);
    return newData;
  }

  /**
   * @param {string} activationCode
   * @returns {Promise<AccountInfo>}
   */
  async activateAccount (activationCode) {
    let o;
    try {
      o = await this.accounts.findOne({
        activationCode, activated: false
      });
    } catch (err) {}
    if (!o) {
      throw new Error('activationCodeProvidedInvalid');
    }

    o.activated = true;
    return this.accounts.replaceOne({activationCode, activated: false}, o);
  }

  /**
   * @param {AccountInfo} newData
   * @param {boolean} allowUserUpdate
   * @returns {Promise<FindAndModifyWriteOpResult>}
   */
  async updateAccount (newData, allowUserUpdate) {
    let _o;
    try {
      _o = await this.accounts.findOne({email: newData.email});
    } catch (err) {}
    if (_o) {
      // Todo: Should let user resubmit their old email without erring
      throw new Error('email-taken');
    }
    const findOneAndUpdate = ({
      name, email, country, pass, id, user
    }) => {
      const o = {name, email, country, activated: true};
      if (pass) {
        o.pass = pass;
        o.passVer = passVer;
      }
      const filter = id || !allowUserUpdate
        ? {_id: this.adapter.constructor.getObjectId(id)}
        : {user};
      return this.accounts.findOneAndUpdate(
        filter,
        {$set: o},
        {upsert: true, returnOriginal: false}
      );
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
    }, {upsert: true, returnOriginal: false});
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

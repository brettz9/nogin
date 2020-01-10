'use strict';

/* eslint-disable-next-line no-shadow  */
const crypto = require('crypto');
const moment = require('moment');
const {MongoClient, ObjectID} = require('mongodb');

const {isNullish} = require('./common.js');

const PASS_VER = 1;

const guid = function () {
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  /* eslint-enable no-bitwise */
};

/*
  private encryption & validation methods
*/

const md5 = function (str) {
  return crypto.createHash('md5').update(str).digest('hex');
};

const saltAndHash = function (pass) {
  const hasher = 'sha256';
  const iterations = 10000;
  const hashLength = 32;
  const saltBytes = 16;
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    crypto.randomBytes(saltBytes, function (err, buf) {
      if (err) {
        reject(err);
        return;
      }
      const salt = buf.toString('hex');
      crypto.pbkdf2(
        pass, salt, iterations, hashLength, hasher,
        function (error, derivedKey) {
          if (error) {
            reject(error);
            return;
          }
          const hash = derivedKey.toString('hex');
          resolve([salt, hash].join('$'));
        }
      );
    });
  });
};

const validatePasswordV0 = function (plainPass, hashedPass) {
  const salt = hashedPass.slice(0, 10);
  const validHash = salt + md5(plainPass + salt);
  if (hashedPass !== validHash) {
    throw new Error('invalid-password');
  }
};

const validatePasswordV1 = function (plainPass, hashedPass) {
  const hasher = 'sha256';
  const iterations = 10000;
  const hashLength = 32;
  const salt = hashedPass.split('$')[0];
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plainPass, salt, iterations, hashLength, hasher,
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      function (err, derivedKey) {
        if (err) {
          reject(new Error('invalid-password'));
          return;
        }
        const plainPassHash = derivedKey.toString('hex');
        const validHash = [salt, plainPassHash].join('$');
        resolve(hashedPass === validHash);
      }
    );
  });
};

const getObjectId = function (id) {
  return new ObjectID(id);
};

class AccountManager {
  constructor (config) {
    this.config = config;
  }

  async connect () {
    const {
      DB_URL,
      DB_NAME
    } = this.config;

    try {
      const client = await MongoClient.connect(DB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      });
      this.db = client.db(DB_NAME);
      this.accounts = this.db.collection('accounts');
      // index fields 'user' & 'email' for faster new account validation
      await this.accounts.createIndex({user: 1, email: 1});
      console.log(
        'mongo :: connected to database :: "' + DB_NAME + '"'
      );
    } catch (err) {
      console.log(err);
    }
    return this;
  }

  // Not currently exposed/in use
  async listIndexes () {
    const indexes = await this.accounts.indexes();
    for (const [i, index] of indexes.entries()) {
      console.log('index:', i, index);
    }
  }

  /*
    login validation methods
  */

  async autoLogin (user, pass) {
    try {
      const o = await this.accounts.findOne({user});
      return o.pass === pass ? o : null;
    } catch (err) {
      return null;
    }
  }

  async manualLogin (user, pass) {
    let o;
    try {
      o = await this.accounts.findOne({user});
    } catch (err) {}
    if (isNullish(o)) {
      throw new Error('user-not-found');
    }
    // These may throw
    if (o.pass_ver === undefined || o.pass_ver === 0) {
      validatePasswordV0(pass, o.pass);
    } else if (o.pass_ver === 1) {
      await validatePasswordV1(pass, o.pass);
    }
    return o;
  }

  async generateLoginKey (user, ipAddress) {
    const cookie = guid();
    await this.accounts.findOneAndUpdate({user}, {$set: {
      ip: ipAddress,
      cookie
    }}, {returnOriginal: false});
    return cookie;
  }

  // eslint-disable-next-line require-await
  async validateLoginKey (cookie, ipAddress) {
    // ensure the cookie maps to the user's last recorded ip address
    return this.accounts.findOne({cookie, ip: ipAddress});
  }

  async generatePasswordKey (email, ipAddress) {
    const passKey = guid();
    let o, e;
    try {
      o = await this.accounts.findOneAndUpdate({email}, {$set: {
        ip: ipAddress,
        passKey
      }, $unset: {cookie: ''}}, {returnOriginal: false});
    } catch (err) {
      e = err;
    }
    if (o && !isNullish(o.value)) {
      return o.value;
    }
    throw (e || new Error('account not found'));
  }

  // eslint-disable-next-line require-await
  async validatePasswordKey (passKey, ipAddress) {
    // ensure the passKey maps to the user's last recorded ip address
    return this.accounts.findOne({passKey, ip: ipAddress});
  }

  /*
    record insertion, update & deletion methods
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

    const hash = await saltAndHash(newData.pass);
    newData.pass = hash;
    newData.pass_ver = PASS_VER;
    // Todo: store as timestamp and use i18n to format for
    //   date (e.g., on print page)
    // Append date stamp when record was created
    newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    return this.accounts.insertOne(newData);
  }

  async updateAccount (newData) {
    const findOneAndUpdate = ({
      name, email, country, pass, id
    }) => {
      const o = {name, email, country};
      if (pass) {
        o.pass = pass;
        o.pass_ver = PASS_VER;
      }
      return this.accounts.findOneAndUpdate(
        {_id: getObjectId(id)},
        {$set: o},
        {upsert: true, returnOriginal: false}
      );
    };
    if (newData.pass === '') {
      return findOneAndUpdate(newData);
    }
    const hash = await saltAndHash(newData.pass);
    newData.pass = hash;
    return findOneAndUpdate(newData);
  }

  async updatePassword (passKey, newPass) {
    const hash = await saltAndHash(newPass);
    return this.accounts.findOneAndUpdate({passKey}, {
      $set: {pass: hash, pass_ver: PASS_VER},
      $unset: {passKey: ''}
    }, {upsert: true, returnOriginal: false});
  }

  /*
    account lookup methods
  */

  // eslint-disable-next-line require-await
  async getAllRecords () {
    return this.accounts.find().toArray();
  }

  // eslint-disable-next-line require-await
  async deleteAccount (id) {
    return this.accounts.deleteOne({_id: getObjectId(id)});
  }

  // eslint-disable-next-line require-await
  async deleteAllAccounts () {
    return this.accounts.deleteMany({});
  }
}

module.exports = AccountManager;

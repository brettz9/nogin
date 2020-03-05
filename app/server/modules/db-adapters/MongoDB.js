'use strict';

const {MongoClient, ObjectID} = require('mongodb');
const DBAbstraction = require('../db-abstraction.js');

/**
 * Adapter for MongoDB.
 */
class MongoDB extends DBAbstraction {
  /**
   * @param {boolean} prod
   * @param {DbConfig} dbConfig
   * @returns {string}
   */
  static getURL (prod, {
    DB_USER,
    DB_PASS,
    DB_HOST,
    DB_PORT,
    DB_NAME
  }) {
    // build mongo database connection url
    return prod
      // prepend url with authentication credentials
      ? `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }

  /**
   * @see https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html
   * @param {string} id Can be a 24 byte hex string, 12 byte binary
   * string or a Number.
   * @returns {ObjectID}
   */
  static getObjectId (id) {
    return new ObjectID(id);
  }

  /**
   * @returns {Promise<ConnectionObject>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html}.
   */
  async connect () {
    const {DB_NAME, DB_URL} = this.config;

    // For connect method: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html#.connect
    // For client object: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html
    this.connection = await MongoClient.connect(DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

    // For db method: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html#db
    // For db object: https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html
    this.db = this.connection.db(DB_NAME);
  }

  /**
   * @returns {Promise<CollectionObject>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
   */
  async getAccounts () {
    const {DB_NAME, log} = this.config;

    // For collection method: See https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html#collection
    // For collection object: https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html
    const accounts = await this.db.collection('accounts');

    if (log) {
      log('ConnectedToDatabase', {adapter: 'mongodb', DB_NAME});
    }
    return accounts;
  }
}

module.exports = MongoDB;

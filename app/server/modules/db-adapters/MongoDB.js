import mongodb from 'mongodb';
import DBAbstraction from '../db-abstraction.js';

const {MongoClient, ObjectId} = mongodb;

/**
 * Adapter for MongoDB.
 */
class MongoDB extends DBAbstraction {
  /**
   * @param {boolean} prod
   * @param {import('../db-factory.js').DbConfig} dbConfig
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
   * @param {string} [id] Can be a 24 byte hex string, 12 byte binary
   * string or a Number.
   * @returns {import('mongodb').ObjectId}
   */
  static getObjectId (id) {
    return new ObjectId(id);
  }

  /**
   * @returns {Promise<void>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html}.
   */
  async connect () {
    const {DB_NAME, DB_URL} = this.config;

    // For connect method: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html#.connect
    // For client object: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html
    this.connection = await MongoClient.connect(DB_URL);

    // For db method: https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html#db
    // For db object: https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html
    this.db = this.connection.db(DB_NAME);
  }

  /**
   * @returns {Promise<import('mongodb').Collection>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
   */
  async getAccounts () {
    const {DB_NAME, log} = this.config;

    // For collection method: See https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html#collection
    // For collection object: https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html
    const accounts = await /** @type {import('mongodb').Db} */ (
      this.db
    ).collection('accounts');

    if (log) {
      log('ConnectedToDatabase', {adapter: 'mongodb', DB_NAME});
    }
    return accounts;
  }
}

export default MongoDB;

export {MongoDB};

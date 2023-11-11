/* eslint-disable class-methods-use-this, no-unused-vars */
/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html}.
 * While in MongoDB, this is an object, as its `toString` (and `toHexString`)
 * will be called, another implementation can simply return a string.
 * @typedef {string|object} ObjectID
 */

/**
* Has other properties, but not required here.
* @typedef {import('mongodb').InsertOneResult} InsertOneWriteOpResult
* @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#~insertOneWriteOpResult
*/

/**
 * Has other properties, but not required here.
 * @typedef {import('mongodb').DeleteResult} DeleteWriteOpResult
 */

/**
 * Patterned after {@link https://docs.mongodb.com/manual/reference/method/js-cursor/}.
 * @typedef {import('mongodb').AbstractCursor} Cursor
 */

/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html}.
 * @typedef {import('mongodb').Db} DBObject
 */

/**
* @typedef {object} DBConfigObject
* @property {string} DB_NAME
* @property {string} DB_URL
* @property {import('./getLogger.js').Logger} [log]
* @property {import('./email-dispatcher.js').Internationalizer} _
*/

/**
 * Class for abstracting out database calls.
 */
class DBAbstraction {
  /**
   * @abstract
   * @param {boolean} prod
   * @param {import('./db-factory.js').DbConfig} dbConfig
   * @returns {string}
   */
  static getURL (prod, dbConfig) {
    throw new Error('Abstract method');
  }

  /**
   * @abstract
   * @param {string|number} [id] Can be a 24 byte hex string, 12 byte binary
   * string or a Number.
   * @returns {ObjectID|string} Sufficient to return a string for our purposes.
   */
  static getObjectId (id) {
    throw new Error('Abstract method');
  }

  /**
   * @param {DBConfigObject} config
   */
  constructor (config) {
    this.config = config;
  }

  /**
   * Recommended to set {@link import('mongodb').MongoClient} on
   * `this.connection` and {@link DBObject} on `this.db`.
   * @abstract
   */
  connect () {
    throw new Error('Abstract method');
  }

  /**
   * @abstract
   * @returns {Promise<import('mongodb').Collection>}
   */
  getAccounts () {
    throw new Error('Abstract method');
  }
}

export default DBAbstraction;

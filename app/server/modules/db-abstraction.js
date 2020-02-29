/* eslint-disable class-methods-use-this */
'use strict';

/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html}.
 * While in MongoDB, this is an object, as its `toString` (and `toHexString`)
 * will be called, another implementation can simply return a string.
 * @typedef {string|PlainObject} ObjectID
 */

/**
 * @typedef {PlainObject|any} FindAndModifyWriteOpResult
 * @property {PlainObject} value With `returnOriginal` option, will return
 * upserted document when none found.
 * @property {PlainObject} [lastErrorObject] Not currently used
 * @property {number} [ok] "1" if ok. Not currently used.
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#~findAndModifyWriteOpResult
*/

/**
* Has other properties, but not required here.
* @typedef {GenericObject} InsertOneWriteOpResult
* @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#~insertOneWriteOpResult
*/

/**
 * Has other properties, but not required here.
 * @typedef {GenericObject} DeleteWriteOpResult
 */

/**
 * Patterned after {@link https://docs.mongodb.com/manual/reference/method/js-cursor/}.
 * @interface Cursor
 */
/**
 * @function Cursor#toArray
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Cursor.html#toArray
 * @returns {Promise<PlainObject[]>}
*/

/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
 * @interface CollectionObject
 */
/**
 * @function CollectionObject#createIndex
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#createIndex
 * @returns {Promise<GenericObject>} Not currently in use.
 */
/**
 * @function CollectionObject#indexes
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#indexes
 * @returns {Promise<GenericObject[]>} Resolves to an array (with `entries()`)
*/
/**
 * @function CollectionObject#findOne
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#findOne
 * @returns {Promise<PlainObject>} A plain object; see {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#~resultCallback}
*/
/**
 * @function CollectionObject#findOneAndUpdate
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#findOneAndUpdate
 * @returns {Promise<FindAndModifyWriteOpResult>}
*/
/**
 * @function CollectionObject#find
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#find
 * @returns {Promise<Cursor>}
*/
/**
 * @function CollectionObject#insertOne
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#insertOne
 * @returns {Promise<InsertOneWriteOpResult>} Not used.
*/
/**
 * @function CollectionObject#deleteOne
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#deleteOne
 * @returns {Promise<DeleteWriteOpResult>} Not used.
*/
/**
 * @function CollectionObject#deleteMany
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html#deleteMany
 * @returns {Promise<DeleteWriteOpResult>} Not used.
*/

/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html}.
 * @interface DBObject
 */
/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html#collection}.
 * @function DBObject#collection
 * @returns {CollectionObject}
*/

/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html}.
 * @interface ConnectionObject
 */
/**
 * @function ConnectionObject#db
 * @see https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html#db
 * @returns {DBObject}
*/

/**
* @typedef {PlainObject} DBConfigObject
* @property {string} DB_NAME
* @property {string} DB_URL
* @property {Logger} log
* @property {Internationalizer} _
*/

/**
 * Class for abstracting out database calls.
 */
class DBAbstraction {
  /**
   * @abstract
   * @param {boolean} prod
   * @param {DbConfig} dbConfig
   * @returns {string}
   */
  static getURL (prod, dbConfig) {
    throw new Error('Abstract method');
  }

  /**
   * @abstract
   * @param {string|number} id Can be a 24 byte hex string, 12 byte binary
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
   * Recommended to set {@link ConnectionObject} on `this.connection` and
   * {@link DBObject} on `this.db`.
   * @abstract
   */
  connect () {
    throw new Error('Abstract method');
  }

  /**
   * @abstract
   * @returns {CollectionObject}
   */
  getAccounts () {
    throw new Error('Abstract method');
  }
}

module.exports = DBAbstraction;

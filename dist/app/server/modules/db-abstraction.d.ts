export default DBAbstraction;
/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html}.
 * While in MongoDB, this is an object, as its `toString` (and `toHexString`)
 * will be called, another implementation can simply return a string.
 */
export type ObjectID = string | object;
/**
 * Has other properties, but not required here.
 */
export type InsertOneWriteOpResult = import("mongodb").InsertOneResult;
/**
 * Has other properties, but not required here.
 */
export type DeleteWriteOpResult = import("mongodb").DeleteResult;
/**
 * Patterned after {@link https://docs.mongodb.com/manual/reference/method/js-cursor/}.
 */
export type Cursor = import("mongodb").AbstractCursor;
/**
 * Patterned after {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Db.html}.
 */
export type DBObject = import("mongodb").Db;
export type DBConfigObject = {
    DB_NAME: string;
    DB_URL: string;
    log?: import("./getLogger.js").Logger | undefined;
    _: import("./email-dispatcher.js").Internationalizer;
};
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
declare class DBAbstraction {
    /**
     * @abstract
     * @param {boolean} prod
     * @param {import('./db-factory.js').DbConfig} dbConfig
     * @returns {string}
     */
    static getURL(prod: boolean, dbConfig: import("./db-factory.js").DbConfig): string;
    /**
     * @abstract
     * @param {string|number} [id] Can be a 24 byte hex string, 12 byte binary
     * string or a Number.
     * @returns {ObjectID|string} Sufficient to return a string for our purposes.
     */
    static getObjectId(id?: string | number | undefined): ObjectID | string;
    /**
     * @param {DBConfigObject} config
     */
    constructor(config: DBConfigObject);
    config: DBConfigObject;
    /**
     * Recommended to set {@link import('mongodb').MongoClient} on
     * `this.connection` and {@link DBObject} on `this.db`.
     * @abstract
     */
    connect(): void;
    /**
     * @abstract
     * @returns {Promise<import('mongodb').Collection>}
     */
    getAccounts(): Promise<import("mongodb").Collection>;
}
//# sourceMappingURL=db-abstraction.d.ts.map
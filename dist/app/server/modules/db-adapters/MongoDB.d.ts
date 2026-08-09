import mongodb from 'mongodb';
import DBAbstraction from '../db-abstraction.js';
/**
 * Adapter for MongoDB.
 */
declare class MongoDB extends DBAbstraction {
    connection: mongodb.MongoClient | undefined;
    db: mongodb.Db | undefined;
    /**
     * @param {boolean} prod
     * @param {import('../db-factory.js').DbConfig} dbConfig
     * @returns {string}
     */
    static getURL(prod: boolean, { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME }: import('../db-factory.js').DbConfig): string;
    /**
     * @see https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html
     * @param {string} [id] Can be a 24 byte hex string, 12 byte binary
     * string or a Number.
     * @returns {import('mongodb').ObjectId}
     */
    static getObjectId(id?: string): import('mongodb').ObjectId;
    /**
     * @returns {Promise<void>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html}.
     */
    connect(): Promise<void>;
    /**
     * @returns {Promise<import('mongodb').Collection>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
     */
    getAccounts(): Promise<import('mongodb').Collection>;
    /**
     * @returns {Promise<
     *   import('mongodb').Collection<import('../account-manager.js').GroupInfo>
     * >} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
     */
    getGroups(): Promise<import('mongodb').Collection<import('../account-manager.js').GroupInfo>>;
    /**
     * @returns {Promise<
    *   import('mongodb').Collection<
    *     import('../account-manager.js').PrivilegeInfo
    *   >
    * >} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/Collection.html}.
    */
    getPrivileges(): Promise<import('mongodb').Collection<import('../account-manager.js').PrivilegeInfo>>;
}
export default MongoDB;
export { MongoDB };
//# sourceMappingURL=MongoDB.d.ts.map
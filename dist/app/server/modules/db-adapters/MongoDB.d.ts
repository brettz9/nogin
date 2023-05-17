export default MongoDB;
/**
 * Adapter for MongoDB.
 */
export class MongoDB extends DBAbstraction {
    /**
     * @see https://mongodb.github.io/node-mongodb-native/3.4/api/ObjectID.html
     * @param {string} [id] Can be a 24 byte hex string, 12 byte binary
     * string or a Number.
     * @returns {import('mongodb').ObjectId}
     */
    static getObjectId(id?: string | undefined): import('mongodb').ObjectId;
    /**
     * @returns {Promise<void>} See {@link https://mongodb.github.io/node-mongodb-native/3.4/api/MongoClient.html}.
     */
    connect(): Promise<void>;
    connection: mongodb.MongoClient | undefined;
    db: mongodb.Db | undefined;
}
import DBAbstraction from '../db-abstraction.js';
import mongodb from 'mongodb';
//# sourceMappingURL=MongoDB.d.ts.map
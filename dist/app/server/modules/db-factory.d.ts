import { MongoDB } from './db-adapters/MongoDB.js';
export type Integer = number;
export type DbConfig = {
    DB_USER?: string;
    DB_PASS?: string;
    DB_HOST?: string;
    DB_PORT?: Integer;
    DB_NAME?: string;
};
export type DbOptions = Required<DbConfig> & {
    adapter: "mongodb";
};
/**
 * @typedef {number} Integer
 */
/**
 * @typedef {object} DbConfig
 * @property {string} [DB_USER]
 * @property {string} [DB_PASS]
 * @property {string} [DB_HOST]
 * @property {Integer} [DB_PORT]
 * @property {string} [DB_NAME]
 */
/**
 * @typedef {Required<DbConfig> & {
 *   adapter: "mongodb"
 * }} DbOptions
 */
/**
 * Creates a specific database type instance.
 */
declare const DBFactory: {
    /**
     * @param {Partial<DbConfig>} options
     * @returns {DbOptions}
     */
    getDefaults(options: Partial<DbConfig>): DbOptions;
    /**
     * @param {"mongodb"} adapter
     * @param {boolean} prod
     * @param {DbConfig} dbConfig
     * @returns {string}
     */
    getURL(adapter: "mongodb", prod: boolean, dbConfig: DbConfig): string;
    /**
     * @param {"mongodb"} adapter
     * @param {import('./db-abstraction.js').DBConfigObject} config
     * @returns {MongoDB}
     */
    createInstance(adapter: "mongodb", config: import('./db-abstraction.js').DBConfigObject): MongoDB;
};
export default DBFactory;
//# sourceMappingURL=db-factory.d.ts.map
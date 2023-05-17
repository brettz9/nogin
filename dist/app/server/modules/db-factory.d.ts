export default DBFactory;
export type Integer = number;
export type DbConfig = {
    DB_USER?: string | undefined;
    DB_PASS?: string | undefined;
    DB_HOST?: string | undefined;
    DB_PORT?: number | undefined;
    DB_NAME?: string | undefined;
};
export type DbOptions = Required<DbConfig> & {
    adapter: "mongodb";
};
declare namespace DBFactory {
    /**
     * @param {Partial<DbConfig>} options
     * @returns {DbOptions}
     */
    function getDefaults(options: Partial<DbConfig>): DbOptions;
    /**
     * @param {"mongodb"} adapter
     * @param {boolean} prod
     * @param {DbConfig} dbConfig
     * @returns {string}
     */
    function getURL(adapter: "mongodb", prod: boolean, dbConfig: DbConfig): string;
    /**
     * @param {"mongodb"} adapter
     * @param {import('./db-abstraction.js').DBConfigObject} config
     * @returns {MongoDB}
     */
    function createInstance(adapter: "mongodb", config: import("./db-abstraction.js").DBConfigObject): MongoDB;
}
import { MongoDB } from './db-adapters/MongoDB.js';
//# sourceMappingURL=db-factory.d.ts.map
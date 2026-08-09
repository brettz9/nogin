/**
 * @typedef {number} Integer
 */
export type Integer = number;
export type DbDefinitions = {
    DB_NAME?: string;
    DB_HOST?: string;
    DB_PORT?: Integer;
    DB_USER?: string;
    DB_PASS?: string;
};
/**
 * @typedef {{
 *   DB_NAME?: string,
 *   DB_HOST?: string,
 *   DB_PORT?: Integer,
 *   DB_USER?: string,
 *   DB_PASS?: string,
 * }} DbDefinitions
 */
declare const dbDefinitions: ({
    name: string;
    alias: string;
    type: StringConstructor;
    description: string;
    typeLabel: string;
} | {
    name: string;
    alias: string;
    type: NumberConstructor;
    description: string;
    typeLabel: string;
})[];
export default dbDefinitions;
//# sourceMappingURL=db-definitions.d.ts.map
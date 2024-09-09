export type GenerateLoginOptionDefinitions = import("../server/modules/db-factory.js").DbConfig & {
    user: string | string[];
    ip: string | string[];
};
export type GeneratePasswordOptionDefinitions = import("../server/modules/db-factory.js").DbConfig & {
    email: string | string[];
    ip: string | string[];
};
/**
 * @typedef {import('../server/modules/db-factory.js').DbConfig & {
 *   user: string|string[],
 *   ip: string|string[]
 * }} GenerateLoginOptionDefinitions
 */
/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a login key since that key should really only be
 * useful in a browser.
 * @param {GenerateLoginOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
export function generateLoginKeys(options: GenerateLoginOptionDefinitions): Promise<string[]>;
/**
 * @typedef {import('../server/modules/db-factory.js').
 *   DbConfig & {
 *   email: string|string[],
 *   ip: string|string[]
 * }} GeneratePasswordOptionDefinitions
 */
/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a password key since that key should really only be
 * useful in a browser.
 * @param {GeneratePasswordOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
export function generatePasswordKey(options: GeneratePasswordOptionDefinitions): Promise<string[]>;
//# sourceMappingURL=db-basic-testing-extensions.d.ts.map
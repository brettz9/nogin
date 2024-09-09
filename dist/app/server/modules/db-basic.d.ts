export type OtherAccountProperty = "name" | "email" | "country" | "pass" | "passVer" | "date" | "activated" | "activationCode" | "unactivatedEmail" | "activationRequestDate";
export type ValidateUserPasswordOptionDefinitions = import("./db-factory.js").DbConfig & {
    user: string;
    pass: string;
};
/**
 * @param {import('./db-factory.js').DbConfig &
 *  import('../../../bin/common-definitions.js').CommonDefinitions} options
 * @returns {Promise<AccountManager>}
 */
export function getAccountManager(options: import("./db-factory.js").DbConfig & import("../../../bin/common-definitions.js").CommonDefinitions): Promise<AccountManager>;
/**
 * @param {import('../../../bin/manageAccounts-add-optionDefinitions.js').
 *   AddOptionDefinitions} options
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
 */
export function addAccounts(options: import("../../../bin/manageAccounts-add-optionDefinitions.js").AddOptionDefinitions): Promise<import("./account-manager.js").AccountInfo[]>;
/**
 * This method differs in that it only searches by `user`
 * and the other params are used to update. This might be
 * refactored to allow searching by multiple values for an
 * update as well as setting multiple other values (whether
 * for the same fields or not).
 * @param {import('../../../bin/manageAccounts-update-optionDefinitions.js').
 *   UpdateOptionDefinitions} options
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
 */
export function updateAccounts(options: import("../../../bin/manageAccounts-update-optionDefinitions.js").UpdateOptionDefinitions): Promise<import("./account-manager.js").AccountInfo[]>;
/**
 * @param {import('../../../bin/manageAccounts-remove-optionDefinitions.js').
 *   RemoveOptionDefinitions & {
 *   all?: boolean
 * }} options
 * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
 */
export function removeAccounts(options: import("../../../bin/manageAccounts-remove-optionDefinitions.js").RemoveOptionDefinitions & {
    all?: boolean;
}): Promise<import("./db-abstraction.js").DeleteWriteOpResult>;
/**
 * @param {import('../../../bin/manageAccounts-read-optionDefinitions.js').
 *   ReadOptionDefinitions} [options]
 * @returns {Promise<Partial<import('./account-manager.js').AccountInfo>[]>}
 */
export function readAccounts(options?: import("../../../bin/manageAccounts-read-optionDefinitions.js").ReadOptionDefinitions | undefined): Promise<Partial<import("./account-manager.js").AccountInfo>[]>;
/**
 * @typedef {import('./db-factory.js').
 *  DbConfig & {
 *   user: string,
 *   pass: string
 * }} ValidateUserPasswordOptionDefinitions
 */
/**
 * Could be a use for this on CLI, but less likely.
 * @param {ValidateUserPasswordOptionDefinitions} options
 * @returns {Promise<Partial<import('./account-manager.js').AccountInfo>>}
 */
export function validUserPassword(options: ValidateUserPasswordOptionDefinitions): Promise<Partial<import("./account-manager.js").AccountInfo>>;
/**
 * Logs indexes.
 * @param {import('./db-factory.js').DbConfig} options
 * @returns {Promise<void>}
 */
export function listIndexes(options: import("./db-factory.js").DbConfig): Promise<void>;
import AccountManager from './account-manager.js';
//# sourceMappingURL=db-basic.d.ts.map
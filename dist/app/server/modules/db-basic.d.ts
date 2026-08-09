/**
 * @file Utility for running basic database CRUD commands for accounts
 * and setting specific kinds of account data. Wraps credentials/set-up
 * with `AccountManager` commands. Used by CLI and tests.
 * @todo Add methods for group creation/editing
 */
import AccountManager from './account-manager.js';
export type OtherAccountProperty = "name" | "email" | "country" | "pass" | "passVer" | *   "date" | "activated" | "activationCode" | "unactivatedEmail" | *   "activationRequestDate";
/**
 * @param {import('./db-factory.js').DbConfig &
 *  import('../../../bin/common-definitions.js').CommonDefinitions} options
 * @returns {Promise<AccountManager>}
 */
declare const getAccountManager: (options: import('./db-factory.js').DbConfig & import('../../../bin/common-definitions.js').CommonDefinitions) => Promise<AccountManager>;
/**
 * @param {import('../../../bin/manageAccounts-add-optionDefinitions.js').
 *   AddOptionDefinitions} options
 * @returns {Promise<import('./account-manager.js').AccountInfo[]>}
 */
declare const addAccounts: (options: import('../../../bin/manageAccounts-add-optionDefinitions.js').AddOptionDefinitions) => Promise<import('./account-manager.js').AccountInfo[]>;
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
declare const updateAccounts: (options: import('../../../bin/manageAccounts-update-optionDefinitions.js').UpdateOptionDefinitions) => Promise<import('./account-manager.js').AccountInfo[]>;
/**
 * @param {import('../../../bin/manageAccounts-remove-optionDefinitions.js').
 *   RemoveOptionDefinitions & {
 *   all?: boolean
 * }} options
 * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
 */
declare const removeAccounts: (options: import('../../../bin/manageAccounts-remove-optionDefinitions.js').RemoveOptionDefinitions & {
    all?: boolean;
}) => Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
/**
 * @param {import('../../../bin/manageAccounts-read-optionDefinitions.js').
 *   ReadOptionDefinitions} [options]
 * @returns {Promise<Partial<import('./account-manager.js').AccountInfo>[]>}
 */
declare const readAccounts: (options?: import('../../../bin/manageAccounts-read-optionDefinitions.js').ReadOptionDefinitions) => Promise<Partial<import('./account-manager.js').AccountInfo>[]>;
export type ValidateUserPasswordOptionDefinitions = import('./db-factory.js').DbConfig & {
    user: string;
    pass: string;
};
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
declare const validUserPassword: (options: ValidateUserPasswordOptionDefinitions) => Promise<Partial<import('./account-manager.js').AccountInfo>>;
/**
 * Logs indexes.
 * @param {import('./db-factory.js').DbConfig} options
 * @returns {Promise<void>}
 */
declare const listIndexes: (options: import('./db-factory.js').DbConfig) => Promise<void>;
export { getAccountManager, addAccounts, updateAccounts, removeAccounts, readAccounts, validUserPassword, listIndexes };
//# sourceMappingURL=db-basic.d.ts.map
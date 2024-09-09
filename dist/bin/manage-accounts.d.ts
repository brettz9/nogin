export default manageAccounts;
export type ManageAccountVerb = "view" | "read" | "delete" | "remove" | "update" | "listIndexes" | "create" | "add";
/**
 * @typedef {"view"|"read"|"delete"|"remove"|"update"|"listIndexes"|
 *   "create"|"add"} ManageAccountVerb
 */
/**
 * @param {ManageAccountVerb} verb
 * @param {import('../app/server/modules/getLogger.js').LoggerOptions} cfg
 * @returns {Promise<void>}
 */
declare function manageAccounts(verb: ManageAccountVerb, { loggerLocale }: import("../app/server/modules/getLogger.js").LoggerOptions): Promise<void>;
//# sourceMappingURL=manage-accounts.d.ts.map
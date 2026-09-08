export type PrivilegeType = import('./modules/account-manager.js').PrivilegeType;
export type PrivilegeValue = import('./modules/account-manager.js').PrivilegeValue;
/**
 * @typedef {import('./modules/account-manager.js').PrivilegeType} PrivilegeType
 */
/**
 * @typedef {import('./modules/account-manager.js').
 *   PrivilegeValue} PrivilegeValue
 */
/**
 * @param {(import('./modules/account-manager.js').PrivilegeInfo|null)[]} infos
 * @returns {Map<string, PrivilegeValue|boolean>}
 */
declare const getPrivilegeValues: (infos: (import('./modules/account-manager.js').PrivilegeInfo | null)[]) => Map<string, PrivilegeValue | boolean>;
export type UserAccount = {
    name: string;
    user: string;
    country: string;
    date: string;
};
export type CountryInfo = {
    code: string;
    name: string;
};
/**
 * @typedef {{
 *   name: string,
 *   user: string,
 *   country: string,
 *   date: string
 * }} UserAccount
 */
/**
 * @typedef {{
 *   code: string
 *   name: string
 * }} CountryInfo
 */
/**
 * @param {import('express').Application} app
 * @param {import('./app.js').RouteConfig} config
 * @returns {Promise<void>}
 */
declare const routeList: (app: import('express').Application, config: import('./app.js').RouteConfig) => Promise<void>;
export { getPrivilegeValues };
export default routeList;
//# sourceMappingURL=routeList.d.ts.map
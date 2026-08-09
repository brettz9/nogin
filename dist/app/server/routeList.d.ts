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
export default routeList;
//# sourceMappingURL=routeList.d.ts.map
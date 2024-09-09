export default routeList;
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
declare function routeList(app: import("express").Application, config: import("./app.js").RouteConfig): Promise<void>;
//# sourceMappingURL=routeList.d.ts.map
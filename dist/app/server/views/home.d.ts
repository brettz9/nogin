export default home;
/**
 * @param {import('../routeUtils.js').TitleWithLayoutCallback & {
 *   user: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[]
 *   emailPattern: string,
 *   requireName: boolean
 * }} cfg
 */
declare function home({ _, layout, user, countries, emailPattern, title, requireName }: import("../routeUtils.js").TitleWithLayoutCallback & {
    user: import("../modules/account-manager.js").AccountInfo;
    countries: import("../routeList.js").CountryInfo[];
    emailPattern: string;
    requireName: boolean;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=home.d.ts.map
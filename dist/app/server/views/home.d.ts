/**
 * @param {import('../routeUtils.js').TitleWithLayoutCallback & {
 *   user: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[]
 *   emailPattern: string,
 *   requireName: boolean
 * }} cfg
 */
declare const home: ({ _, layout, user, countries, emailPattern, title, requireName }: import('../routeUtils.js').TitleWithLayoutCallback & {
    user: import('../modules/account-manager.js').AccountInfo;
    countries: import('../routeList.js').CountryInfo[];
    emailPattern: string;
    requireName: boolean;
}) => Promise<[import("jamilih").JamilihDoc]>;
export default home;
//# sourceMappingURL=home.d.ts.map
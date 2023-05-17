export default signup;
/**
 * @param {import('../routeUtils.js').TitleWithLayoutCallback & {
 *   emptyUser: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[],
 *   emailPattern: string,
 *   requireName?: boolean
 * }} cfg
 */
declare function signup({ _, layout, emptyUser, countries, emailPattern, requireName, title }: import('../routeUtils.js').TitleWithLayoutCallback & {
    emptyUser: import('../modules/account-manager.js').AccountInfo;
    countries: import('../routeList.js').CountryInfo[];
    emailPattern: string;
    requireName?: boolean;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=signup.d.ts.map
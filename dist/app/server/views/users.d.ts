export default users;
/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   accounts: (import('../routeList.js').UserAccount & {
 *      groupInfo: {
 *     group: string,
 *     privileges:
 *       import('../modules/account-manager.js').PrivilegeInfo[]
 *   }})[]
 *   hasDeleteUsersAccess: boolean,
 *   hasReadGroupAccess: boolean
 * }} cfg
 */
declare function users({ _, layout, accounts, hasDeleteUsersAccess, hasReadGroupAccess }: {
    _: import("intl-dom").I18NCallback;
    layout: import("../routeUtils.js").LayoutCallback;
    accounts: (import("../routeList.js").UserAccount & {
        groupInfo: {
            group: string;
            privileges: import("../modules/account-manager.js").PrivilegeInfo[];
        };
    })[];
    hasDeleteUsersAccess: boolean;
    hasReadGroupAccess: boolean;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=users.d.ts.map
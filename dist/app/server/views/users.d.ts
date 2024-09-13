export default users;
/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   accounts: import('../routeList.js').UserAccount[]
*   hasDeleteUsersAccess: boolean
* }} cfg
*/
declare function users({ _, layout, accounts, hasDeleteUsersAccess }: {
    _: import("intl-dom").I18NCallback;
    layout: import("../routeUtils.js").LayoutCallback;
    accounts: import("../routeList.js").UserAccount[];
    hasDeleteUsersAccess: boolean;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=users.d.ts.map
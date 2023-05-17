export default users;
/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   accounts: import('../routeList.js').UserAccount[]
* }} cfg
*/
declare function users({ _, layout, accounts }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    accounts: import('../routeList.js').UserAccount[];
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=users.d.ts.map
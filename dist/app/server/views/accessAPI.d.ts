export default accessAPI;
/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
* }} cfg
*/
declare function accessAPI({ _, layout }: {
    _: import("intl-dom").I18NCallback;
    layout: import("../routeUtils.js").LayoutCallback;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=accessAPI.d.ts.map
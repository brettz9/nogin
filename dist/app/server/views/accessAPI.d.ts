/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 * }} cfg
 */
declare const accessAPI: ({ _, layout }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
}) => Promise<[import("jamilih").JamilihDoc]>;
export default accessAPI;
//# sourceMappingURL=accessAPI.d.ts.map
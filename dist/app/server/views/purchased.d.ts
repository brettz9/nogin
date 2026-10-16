/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   receiptText: string,
 *   plansPath: string
 * }} cfg
 */
declare const purchased: ({ _, layout, receiptText, plansPath }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    receiptText: string;
    plansPath: string;
}) => Promise<[import("jamilih").JamilihDoc]>;
export default purchased;
//# sourceMappingURL=purchased.d.ts.map
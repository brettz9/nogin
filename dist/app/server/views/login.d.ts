/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   emailPattern: string,
 *   signup: string
 * }} cfg
 */
declare const login: ({ _, layout, emailPattern, signup }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    emailPattern: string;
    signup: string;
}) => Promise<[import("jamilih").JamilihDoc]>;
export default login;
//# sourceMappingURL=login.d.ts.map
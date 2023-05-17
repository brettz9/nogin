export default login;
/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   emailPattern: string,
 *   signup: string
 * }} cfg
 */
declare function login({ _, layout, emailPattern, signup }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    emailPattern: string;
    signup: string;
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=login.d.ts.map
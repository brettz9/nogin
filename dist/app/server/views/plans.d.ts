export type JamilihChildren = import('jamilih').JamilihChildren;
/**
 * @typedef {import('jamilih').JamilihChildren} JamilihChildren
 */
/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   offersInfo: import('../modules/offer-manager.js').OfferInfo[],
 *   loggedIn: boolean,
 *   paymentsConfigured: boolean,
 *   canManage: boolean,
 *   loginPath: string
 * }} cfg
 */
declare const plans: ({ _, layout, offersInfo, loggedIn, paymentsConfigured, canManage, loginPath }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    offersInfo: import('../modules/offer-manager.js').OfferInfo[];
    loggedIn: boolean;
    paymentsConfigured: boolean;
    canManage: boolean;
    loginPath: string;
}) => Promise<[import("jamilih").JamilihDoc]>;
export default plans;
//# sourceMappingURL=plans.d.ts.map
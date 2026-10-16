/**
 * @typedef {import('jamilih').JamilihChildren} JamilihChildren
 */
export type JamilihChildren = import('jamilih').JamilihChildren;
/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   hasEditOffersAccess: boolean,
 *   paymentsConfigured: boolean,
 *   offersInfo: import('../modules/offer-manager.js').OfferInfo[],
 *   privileges: {
 *     privilegeName: string,
 *     type: import('../modules/account-manager.js').PrivilegeType,
 *     description: string
 *   }[],
 *   groups: string[]
 * }} cfg
 */
declare const offers: ({ _, layout, hasEditOffersAccess, paymentsConfigured, offersInfo, privileges, groups }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    hasEditOffersAccess: boolean;
    paymentsConfigured: boolean;
    offersInfo: import('../modules/offer-manager.js').OfferInfo[];
    privileges: {
        privilegeName: string;
        type: import('../modules/account-manager.js').PrivilegeType;
        description: string;
    }[];
    groups: string[];
}) => Promise<[import("jamilih").JamilihDoc]>;
export default offers;
//# sourceMappingURL=offers.d.ts.map
/**
 * @typedef {import('../modules/offer-manager.js').IntervalUnit} IntervalUnit
 * @typedef {import('../modules/offer-manager.js').OfferInfo} OfferInfo
 */
export type IntervalUnit = import('../modules/offer-manager.js').IntervalUnit;
export type OfferInfo = import('../modules/offer-manager.js').OfferInfo;
export declare const units: IntervalUnit[];
export declare const billingKeys: {
    year: string;
    month: string;
    week: string;
    day: string;
};
/**
 * @param {string} unit
 * @returns {string}
 */
export declare const capitalize: (unit: string) => string;
/**
 * @param {import('intl-dom').I18NCallback} _
 * @returns {{
 *   formatPrice: (offer: OfferInfo) => string,
 *   formatBilling: (offer: OfferInfo) => string|DocumentFragment|Text
 * }}
 */
export declare const getOfferFormatters: (_: import('intl-dom').I18NCallback) => {
    formatPrice: (offer: OfferInfo) => string;
    formatBilling: (offer: OfferInfo) => string | DocumentFragment | Text;
};
//# sourceMappingURL=offerFormat.d.ts.map
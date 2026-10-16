/**
 * @typedef {(cfg: {
 *   _: import('../modules/email-dispatcher.js').Internationalizer,
 *   langDir: {dir: "rtl"|"ltr"|undefined, lang: string},
 *   jml: typeof import('jamilih').jml,
 *   baseurl: string,
 *   name: string,
 *   offerName: string,
 *   priceText: string,
 *   billingText: string,
 *   receiptText?: string,
 *   fromText: string,
 *   fromURL: string
 * }) => import('jamilih').JamilihDoc} ComposePurchaseReceiptEmail
 */
export type ComposePurchaseReceiptEmail = (cfg: {
    _: import('../modules/email-dispatcher.js').Internationalizer;
    langDir: {
        dir: "rtl" | "ltr" | undefined;
        lang: string;
    };
    jml: typeof import('jamilih').jml;
    baseurl: string;
    name: string;
    offerName: string;
    priceText: string;
    billingText: string;
    receiptText?: string;
    fromText: string;
    fromURL: string;
}) => import('jamilih').JamilihDoc;
/** @type {ComposePurchaseReceiptEmail} */
declare const composePurchaseReceiptEmail: ComposePurchaseReceiptEmail;
export default composePurchaseReceiptEmail;
//# sourceMappingURL=composePurchaseReceiptEmail.d.ts.map
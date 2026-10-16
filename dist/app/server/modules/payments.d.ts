import Stripe from 'stripe';
export type OfferInfo = import('./offer-manager.js').OfferInfo;
export type PurchaseInfo = import('./offer-manager.js').PurchaseInfo;
export type PaymentInfo = import('./offer-manager.js').PaymentInfo;
export type OfferManager = import('./offer-manager.js').default;
export type PaymentManagerOptions = {
    /**
     * Stripe secret key
     */
    secret: string;
    /**
     * Stripe webhook signing secret
     */
    webhookSecret: string;
    /**
     * Injectable client (for tests)
     */
    stripe?: Stripe;
    /**
     * Called when a purchase first grants access
     */
    onFulfilled?: (purchase: PurchaseInfo, offer: OfferInfo) => Promise<void> | void;
};
/**
 * Stripe integration: syncs offers to Stripe products/prices, starts hosted
 * Checkout (which offers card and wallet methods such as Apple/Google Pay),
 * and turns verified webhook events into privilege and group-membership
 * grants and revocations. Webhooks, not browser redirects, are the source
 * of truth.
 */
declare class PaymentManager {
    #private;
    om: import("./offer-manager.js").default;
    am: import("./account-manager.js").default;
    purchases: import("mongodb").Collection<import("./offer-manager.js").PurchaseInfo>;
    offers: import("mongodb").Collection<import("./offer-manager.js").OfferInfo>;
    processedEvents: import("mongodb").Collection<import("./offer-manager.js").ProcessedEventInfo>;
    accounts: import("mongodb").Collection<Partial<import("./account-manager.js").AccountInfo>>;
    stripe: Stripe;
    webhookSecret: string;
    onFulfilled: ((purchase: PurchaseInfo, offer: OfferInfo) => Promise<void> | void) | undefined;
    /**
     * @param {OfferManager} om
     * @param {PaymentManagerOptions} options
     */
    constructor(om: OfferManager, { secret, webhookSecret, stripe, onFulfilled }: PaymentManagerOptions);
    /**
     * Ensures the offer has a Stripe product and price, saving their IDs.
     * @param {OfferInfo} offer
     * @returns {Promise<OfferInfo>}
     */
    syncOffer(offer: OfferInfo): Promise<OfferInfo>;
    /**
     * @param {{
     *   userID: string,
     *   offerSlug: string,
     *   successURL: string,
     *   cancelURL: string
     * }} cfg
     * @returns {Promise<string>} The hosted Checkout URL
     */
    createCheckout({ userID, offerSlug, successURL, cancelURL }: {
        userID: string;
        offerSlug: string;
        successURL: string;
        cancelURL: string;
    }): Promise<string>;
    /**
     * Starts a Stripe-hosted billing portal session in which the payer can
     * cancel, update a card, and view invoices.
     * @param {{userID: string, returnURL: string}} cfg
     * @returns {Promise<string>} The portal URL
     */
    createPortalSession({ userID, returnURL }: {
        userID: string;
        returnURL: string;
    }): Promise<string>;
    /**
     * Verifies the signature and processes the event.
     * @param {Buffer|string} rawBody
     * @param {string} signature
     * @returns {Promise<void>}
     */
    handleWebhook(rawBody: Buffer | string, signature: string): Promise<void>;
    /**
     * Idempotent: events already processed are skipped, and the handlers
     * themselves converge on the same state if an event is repeated.
     * @param {import('stripe').Stripe.Event} event
     * @returns {Promise<void>}
     */
    handleEvent(event: import('stripe').Stripe.Event): Promise<void>;
}
export default PaymentManager;
//# sourceMappingURL=payments.d.ts.map
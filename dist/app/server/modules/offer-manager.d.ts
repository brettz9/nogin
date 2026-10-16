export type IntervalUnit = "day" | "week" | "month" | "year";
export type PrivilegeAssignment = import('./account-manager.js').PrivilegeAssignment;
export type OfferInfo = {
    /**
     * Auto-set
     */
    _id?: string;
    /**
     * URL-safe unique identifier
     */
    slug: string;
    /**
     * Human-readable name of the service
     */
    name: string;
    /**
     * Human description of the service
     */
    description: string;
    /**
     * In the currency's minor unit (e.g., cents)
     */
    amount: number;
    /**
     * Lowercase ISO 4217 code
     */
    currency: string;
    /**
     * Absent for a one-time (permanent)
     * purchase
     */
    interval?: IntervalUnit;
    /**
     * Defaults to 1 when `interval` is present
     */
    intervalCount?: number;
    /**
     * User-varying
     * privileges granted
     */
    privilegeIDs: (string | PrivilegeAssignment)[];
    /**
     * Non-builtin groups to which an expiring
     * membership is granted
     */
    groupNames: string[];
    /**
     * Recurring offers only
     */
    graceUnit?: IntervalUnit;
    /**
     * Recurring offers only
     */
    graceCount?: number;
    revokeOnPartialRefund?: boolean;
    /**
     * Shown (and emailed) after purchase
     */
    receiptText?: string;
    active: boolean;
    /**
     * Auto-set
     */
    stripeProductId?: string;
    /**
     * Auto-set
     */
    stripePriceId?: string;
    /**
     * Auto-generated timestamp
     */
    date: number;
};
export type PaymentInfo = {
    invoiceId?: string;
    paymentIntentId?: string;
    chargeId?: string;
    amount: number;
    /**
     * Timestamp
     */
    paidAt: number;
    /**
     * Timestamp of the end of the paid period
     */
    periodEnd?: number;
    /**
     * Expiry that this payment granted
     */
    grantedUntil?: number;
    refunded?: boolean;
};
export type PurchaseStatus = "active" | "past_due" | "canceled" | "refunded" | "expired";
export type PurchaseInfo = {
    /**
     * Auto-set
     */
    _id?: string;
    userID: string;
    offerSlug: string;
    stripeCustomerId: string;
    /**
     * Recurring purchases
     */
    stripeSubscriptionId?: string;
    /**
     * One-time purchases
     */
    stripePaymentIntentId?: string;
    status: PurchaseStatus;
    /**
     * Timestamp
     */
    currentPeriodEnd?: number;
    payments: PaymentInfo[];
    /**
     * Auto-generated timestamp
     */
    date: number;
};
export type ProcessedEventInfo = {
    /**
     * Payment-processor event ID
     */
    _id: string;
    type: string;
    /**
     * Timestamp
     */
    date: number;
};
/**
 * @typedef {"day"|"week"|"month"|"year"} IntervalUnit
 */
/**
 * @typedef {import('./account-manager.js').
 *   PrivilegeAssignment} PrivilegeAssignment
 */
/**
 * @typedef {object} OfferInfo
 * @property {string} [_id] Auto-set
 * @property {string} slug URL-safe unique identifier
 * @property {string} name Human-readable name of the service
 * @property {string} description Human description of the service
 * @property {number} amount In the currency's minor unit (e.g., cents)
 * @property {string} currency Lowercase ISO 4217 code
 * @property {IntervalUnit} [interval] Absent for a one-time (permanent)
 *   purchase
 * @property {number} [intervalCount] Defaults to 1 when `interval` is present
 * @property {(string|PrivilegeAssignment)[]} privilegeIDs User-varying
 *   privileges granted
 * @property {string[]} groupNames Non-builtin groups to which an expiring
 *   membership is granted
 * @property {IntervalUnit} [graceUnit] Recurring offers only
 * @property {number} [graceCount] Recurring offers only
 * @property {boolean} [revokeOnPartialRefund]
 * @property {string} [receiptText] Shown (and emailed) after purchase
 * @property {boolean} active
 * @property {string} [stripeProductId] Auto-set
 * @property {string} [stripePriceId] Auto-set
 * @property {number} date Auto-generated timestamp
 */
/**
 * @typedef {object} PaymentInfo
 * @property {string} [invoiceId]
 * @property {string} [paymentIntentId]
 * @property {string} [chargeId]
 * @property {number} amount
 * @property {number} paidAt Timestamp
 * @property {number} [periodEnd] Timestamp of the end of the paid period
 * @property {number} [grantedUntil] Expiry that this payment granted
 * @property {boolean} [refunded]
 */
/**
 * @typedef {"active"|"past_due"|"canceled"|"refunded"|"expired"} PurchaseStatus
 */
/**
 * @typedef {object} PurchaseInfo
 * @property {string} [_id] Auto-set
 * @property {string} userID
 * @property {string} offerSlug
 * @property {string} stripeCustomerId
 * @property {string} [stripeSubscriptionId] Recurring purchases
 * @property {string} [stripePaymentIntentId] One-time purchases
 * @property {PurchaseStatus} status
 * @property {number} [currentPeriodEnd] Timestamp
 * @property {PaymentInfo[]} payments
 * @property {number} date Auto-generated timestamp
 */
/**
 * @typedef {object} ProcessedEventInfo
 * @property {string} _id Payment-processor event ID
 * @property {string} type
 * @property {number} date Timestamp
 */
export declare const intervalUnits: Set<string>;
/**
 * Calendar-aware (UTC) addition.
 * @param {number} timestamp
 * @param {IntervalUnit} unit
 * @param {number} count
 * @returns {number}
 */
export declare const addInterval: (timestamp: number, unit: IntervalUnit, count: number) => number;
/**
 * Time until which access lasts for a payment covering a period ending at
 * `periodEnd`: that end plus the offer's grace (defaulting to one step below
 * the billing interval).
 * @param {Pick<OfferInfo, 'interval'|'graceUnit'|'graceCount'>} offer Must
 *   be a recurring offer
 * @param {number} periodEnd Timestamp
 * @returns {number}
 */
export declare const getAccessEnd: (offer: Pick<OfferInfo, 'interval' | 'graceUnit' | 'graceCount'>, periodEnd: number) => number;
/**
 * Manages offers (paid access to privileges and groups) and the purchases
 * made of them.
 */
declare class OfferManager {
    #private;
    am: import("./account-manager.js").default;
    /** @type {import('mongodb').Collection<OfferInfo>|undefined} */
    offers: import('mongodb').Collection<OfferInfo> | undefined;
    /** @type {import('mongodb').Collection<PurchaseInfo>|undefined} */
    purchases: import('mongodb').Collection<PurchaseInfo> | undefined;
    /** @type {import('mongodb').Collection<ProcessedEventInfo>|undefined} */
    processedEvents: import('mongodb').Collection<ProcessedEventInfo> | undefined;
    /**
     * @param {import('./account-manager.js').default} am A connected
     *   `AccountManager`
     */
    constructor(am: import('./account-manager.js').default);
    /**
     * @returns {Promise<OfferManager>}
     */
    connect(): Promise<OfferManager>;
    /**
     * @param {Partial<OfferInfo>} data
     * @returns {Promise<OfferInfo>}
     */
    createOffer(data: Partial<OfferInfo>): Promise<OfferInfo>;
    /**
     * Replaces an offer's editable fields. Pricing (`amount`, `currency`,
     * `interval`, `intervalCount`) is immutable once the offer has purchases,
     * since payers agreed to those terms.
     * @param {Partial<OfferInfo> & {slug: string}} data
     * @returns {Promise<OfferInfo>}
     */
    editOffer(data: Partial<OfferInfo> & {
        slug: string;
    }): Promise<OfferInfo>;
    /**
     * Archived offers stay (and keep serving existing payers) but are no longer
     * offered for new purchase.
     * @param {string} slug
     * @param {boolean} [active]
     * @returns {Promise<void>}
     */
    setOfferActive(slug: string, active?: boolean): Promise<void>;
    /**
     * @param {string} slug
     * @returns {Promise<OfferInfo|null>}
     */
    getOffer(slug: string): Promise<OfferInfo | null>;
    /**
     * @param {{activeOnly?: boolean}} [options]
     * @returns {Promise<OfferInfo[]>}
     */
    getOffers({ activeOnly }?: {
        activeOnly?: boolean;
    }): Promise<OfferInfo[]>;
    /**
     * @param {string} userID
     * @returns {Promise<string|undefined>} The user's Stripe customer ID, if
     *   any purchase recorded one
     */
    getCustomerId(userID: string): Promise<string | undefined>;
    /**
     * @param {string} slug
     * @returns {Promise<boolean>}
     */
    hasPurchases(slug: string): Promise<boolean>;
}
export default OfferManager;
//# sourceMappingURL=offer-manager.d.ts.map
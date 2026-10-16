import {builtInGroups, isValidPrivilegeValue} from './account-manager.js';

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

export const intervalUnits = new Set(['day', 'week', 'month', 'year']);

/**
 * One step smaller than the billing interval (e.g., a week of grace for a
 * monthly subscription).
 * @type {{[unit: string]: {unit: IntervalUnit, count: number}}}
 */
const defaultGraces = {
  year: {unit: 'month', count: 1},
  month: {unit: 'week', count: 1},
  week: {unit: 'day', count: 1},
  day: {unit: 'day', count: 0}
};

/**
 * Calendar-aware (UTC) addition.
 * @param {number} timestamp
 * @param {IntervalUnit} unit
 * @param {number} count
 * @returns {number}
 */
export const addInterval = (timestamp, unit, count) => {
  const date = new Date(timestamp);
  switch (unit) {
  case 'day':
    date.setUTCDate(date.getUTCDate() + count);
    break;
  case 'week':
    date.setUTCDate(date.getUTCDate() + (count * 7));
    break;
  case 'month':
    date.setUTCMonth(date.getUTCMonth() + count);
    break;
  /* c8 ignore next 4 -- Callers validate units. */
  default:
    date.setUTCFullYear(date.getUTCFullYear() + count);
    break;
  }
  return date.getTime();
};

/**
 * Time until which access lasts for a payment covering a period ending at
 * `periodEnd`: that end plus the offer's grace (defaulting to one step below
 * the billing interval).
 * @param {Pick<OfferInfo, 'interval'|'graceUnit'|'graceCount'>} offer Must
 *   be a recurring offer
 * @param {number} periodEnd Timestamp
 * @returns {number}
 */
export const getAccessEnd = (offer, periodEnd) => {
  const {unit, count} = offer.graceUnit === undefined
    ? defaultGraces[/** @type {IntervalUnit} */ (offer.interval)]
    : {unit: offer.graceUnit, count: offer.graceCount ?? 0};
  return addInterval(periodEnd, unit, count);
};

/**
 * @param {unknown} value
 * @returns {value is number}
 */
const isNonNegativeInteger = (value) => {
  return Number.isSafeInteger(value) && /** @type {number} */ (value) >= 0;
};

/**
 * @param {unknown} value
 * @returns {value is string}
 */
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

const pricingFields = ['amount', 'currency', 'interval', 'intervalCount'];

/**
 * Manages offers (paid access to privileges and groups) and the purchases
 * made of them.
 */
class OfferManager {
  /** @type {import('mongodb').Collection<OfferInfo>|undefined} */
  offers;

  /** @type {import('mongodb').Collection<PurchaseInfo>|undefined} */
  purchases;

  /** @type {import('mongodb').Collection<ProcessedEventInfo>|undefined} */
  processedEvents;

  /**
   * @param {import('./account-manager.js').default} am A connected
   *   `AccountManager`
   */
  constructor (am) {
    this.am = am;
  }

  /**
   * Validates and normalizes offer fields (excluding auto-set ones).
   * @param {Partial<OfferInfo>} data
   * @returns {Promise<Omit<
   *   OfferInfo, '_id'|'date'|'stripeProductId'|'stripePriceId'
   * >>}
   */
  async #normalize (data) {
    if (!isNonEmptyString(data.slug) ||
      !(/^[a-z0-9][a-z0-9\-]*$/v).test(data.slug)
    ) {
      throw new Error('bad-offer-slug');
    }
    if (!isNonEmptyString(data.name)) {
      throw new Error('bad-offer-name');
    }
    if (!isNonEmptyString(data.description)) {
      throw new Error('bad-offer-description');
    }
    if (!Number.isSafeInteger(data.amount) ||
    /** @type {number} */ (data.amount) <= 0
    ) {
      throw new Error('bad-offer-amount');
    }
    const currency = typeof data.currency === 'string'
      ? data.currency.toLowerCase()
      : '';
    if (!(/^[a-z]{3}$/v).test(currency)) {
      throw new Error('bad-offer-currency');
    }

    const {interval} = data;
    const recurring = interval !== undefined;
    if (recurring && !intervalUnits.has(interval)) {
      throw new Error('bad-offer-interval');
    }
    if (!recurring && (
      data.intervalCount !== undefined ||
      data.graceUnit !== undefined || data.graceCount !== undefined ||
      data.revokeOnPartialRefund !== undefined
    )) {
      throw new Error('bad-offer-interval');
    }
    if (data.intervalCount !== undefined &&
      (!Number.isSafeInteger(data.intervalCount) || data.intervalCount < 1)
    ) {
      throw new Error('bad-offer-interval');
    }
    if (data.graceUnit === undefined
      ? data.graceCount !== undefined
      : (
        !intervalUnits.has(data.graceUnit) ||
        !isNonNegativeInteger(data.graceCount)
      )
    ) {
      throw new Error('bad-offer-grace');
    }
    if (data.receiptText !== undefined &&
      typeof data.receiptText !== 'string'
    ) {
      throw new TypeError('bad-offer-receipttext');
    }

    const privilegeIDs = data.privilegeIDs ?? [];
    const groupNames = data.groupNames ?? [];
    if (!Array.isArray(privilegeIDs) || !Array.isArray(groupNames)) {
      throw new TypeError('bad-offer-grants');
    }
    if (privilegeIDs.length === 0 && groupNames.length === 0) {
      throw new Error('offer-grants-nothing');
    }

    const seenPrivileges = new Set();
    for (const assignment of privilegeIDs) {
      const privilegeName = typeof assignment === 'string'
        ? assignment
        : assignment?.privilegeName;
      if (!isNonEmptyString(privilegeName) ||
        seenPrivileges.has(privilegeName)
      ) {
        throw new Error('bad-privilegename');
      }
      seenPrivileges.add(privilegeName);
      // eslint-disable-next-line no-await-in-loop -- Few, and ordered errors
      const privilege = await this.am.getPrivilege(privilegeName);
      if (!privilege) {
        throw new Error('privilege-missing');
      }
      // Offers assign directly to users, and never grant built-in
      //   (administrative) privileges.
      if (!privilege.userVarying || privilege.builtin) {
        throw new Error('bad-privilege-scope');
      }
      const type = privilege.type || 'boolean';
      if (type === 'boolean'
        ? typeof assignment !== 'string'
        : (
          typeof assignment === 'string' ||
          !isValidPrivilegeValue(type, assignment.value)
        )
      ) {
        throw new TypeError('bad-privilege-value');
      }
    }

    const seenGroups = new Set();
    for (const groupName of groupNames) {
      if (!isNonEmptyString(groupName) || seenGroups.has(groupName) ||
        builtInGroups.has(groupName)
      ) {
        throw new Error('bad-groupname');
      }
      seenGroups.add(groupName);
      // eslint-disable-next-line no-await-in-loop -- Few, and ordered errors
      const group = await /**
                           * @type {import('mongodb').Collection<
                           *Partial<import('./account-manager.js').GroupInfo>
      >} */ (this.am.groups).findOne({groupName});
      if (!group) {
        throw new Error('group-not-found');
      }
    }

    return {
      slug: data.slug,
      name: data.name.trim(),
      description: data.description.trim(),
      amount: /** @type {number} */ (data.amount),
      currency,
      ...(recurring
        ? {
          interval: data.interval,
          intervalCount: data.intervalCount ?? 1,
          ...(data.graceUnit === undefined
            ? {}
            : {
              graceUnit: data.graceUnit, graceCount: data.graceCount
            }),
          revokeOnPartialRefund: Boolean(data.revokeOnPartialRefund)
        }
        : {}),
      privilegeIDs,
      groupNames,
      ...(data.receiptText ? {receiptText: data.receiptText} : {}),
      active: data.active ?? true
    };
  }

  /**
   * @returns {Promise<OfferManager>}
   */
  async connect () {
    const {adapter} = this.am;
    this.offers = await adapter.getOffers();
    await this.offers.createIndex({slug: 1}, {unique: true});
    this.purchases = await adapter.getPurchases();
    await this.purchases.createIndex({userID: 1});
    await this.purchases.createIndex({offerSlug: 1});
    await this.purchases.createIndex(
      {stripeSubscriptionId: 1},
      {unique: true, partialFilterExpression: {
        stripeSubscriptionId: {$type: 'string'}
      }}
    );
    await this.purchases.createIndex(
      {stripePaymentIntentId: 1},
      {unique: true, partialFilterExpression: {
        stripePaymentIntentId: {$type: 'string'}
      }}
    );
    this.processedEvents = await adapter.getProcessedEvents();
    return this;
  }

  /**
   * @param {Partial<OfferInfo>} data
   * @returns {Promise<OfferInfo>}
   */
  async createOffer (data) {
    const offer = {
      ...await this.#normalize(data),
      date: Date.now()
    };
    try {
      await /** @type {import('mongodb').Collection<OfferInfo>} */ (
        this.offers
      ).insertOne(offer);
    } catch (err) {
      if (/** @type {{code?: number}} */ (err).code === 11000) {
        throw new Error('offerslug-taken', {cause: err});
      }
      /* c8 ignore next 2 -- Defensive database failure. */
      throw err;
    }
    return offer;
  }

  /**
   * Replaces an offer's editable fields. Pricing (`amount`, `currency`,
   * `interval`, `intervalCount`) is immutable once the offer has purchases,
   * since payers agreed to those terms.
   * @param {Partial<OfferInfo> & {slug: string}} data
   * @returns {Promise<OfferInfo>}
   */
  async editOffer (data) {
    const existing = await this.getOffer(data.slug);
    if (!existing) {
      throw new Error('offer-missing');
    }
    const normalized = await this.#normalize(data);
    const pricingChanged = pricingFields.some((field) => {
      return /** @type {Record<string, unknown>} */ (existing)[field] !==
      /** @type {Record<string, unknown>} */ (normalized)[field];
    });
    if (pricingChanged && await this.hasPurchases(data.slug)) {
      throw new Error('offer-in-use');
    }
    const offer = {
      ...normalized,
      date: Date.now(),
      ...(pricingChanged
        ? {}
        : {
          ...existing.stripeProductId
            ? {stripeProductId: existing.stripeProductId}
            : {},
          ...existing.stripePriceId
            ? {stripePriceId: existing.stripePriceId}
            : {}
        })
    };
    await /** @type {import('mongodb').Collection<OfferInfo>} */ (
      this.offers
    ).replaceOne({slug: data.slug}, offer);
    return offer;
  }

  /**
   * Archived offers stay (and keep serving existing payers) but are no longer
   * offered for new purchase.
   * @param {string} slug
   * @param {boolean} [active]
   * @returns {Promise<void>}
   */
  async setOfferActive (slug, active = false) {
    // eslint-disable-next-line @stylistic/max-len -- Type cast
    const {matchedCount} = await /** @type {import('mongodb').Collection<OfferInfo>} */ (
      this.offers
    ).updateOne({slug}, {
      $set: {active, date: Date.now()}
    });
    if (!matchedCount) {
      throw new Error('offer-missing');
    }
  }

  /**
   * @param {string} slug
   * @returns {Promise<OfferInfo|null>}
   */
  async getOffer (slug) {
    return await /** @type {import('mongodb').Collection<OfferInfo>} */ (
      this.offers
    ).findOne({slug: {$eq: slug}});
  }

  /**
   * @param {{activeOnly?: boolean}} [options]
   * @returns {Promise<OfferInfo[]>}
   */
  async getOffers ({activeOnly = false} = {}) {
    return await /** @type {import('mongodb').Collection<OfferInfo>} */ (
      this.offers
    ).find(activeOnly ? {active: true} : {}).sort({name: 1}).toArray();
  }

  /**
   * @param {string} userID
   * @returns {Promise<string|undefined>} The user's Stripe customer ID, if
   *   any purchase recorded one
   */
  async getCustomerId (userID) {
    const purchase = await /**
                            * @type {import('mongodb').Collection<
                            *   PurchaseInfo>}
                            */ (this.purchases).findOne({
      userID: {$eq: userID}, stripeCustomerId: {$type: 'string'}
    });
    return purchase?.stripeCustomerId;
  }

  /**
   * @param {string} slug
   * @returns {Promise<boolean>}
   */
  async hasPurchases (slug) {
    return Boolean(
      await /** @type {import('mongodb').Collection<PurchaseInfo>} */ (
        this.purchases
      ).findOne({offerSlug: {$eq: slug}})
    );
  }
}

export default OfferManager;

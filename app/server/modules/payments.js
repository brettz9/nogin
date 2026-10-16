/* eslint-disable camelcase -- Stripe API field names */
import Stripe from 'stripe';

import {getAccessEnd} from './offer-manager.js';

/**
 * @typedef {import('./offer-manager.js').OfferInfo} OfferInfo
 * @typedef {import('./offer-manager.js').PurchaseInfo} PurchaseInfo
 * @typedef {import('./offer-manager.js').PaymentInfo} PaymentInfo
 * @typedef {import('./offer-manager.js').default} OfferManager
 */

/**
 * @typedef {object} PaymentManagerOptions
 * @property {string} secret Stripe secret key
 * @property {string} webhookSecret Stripe webhook signing secret
 * @property {Stripe} [stripe] Injectable client (for tests)
 * @property {(purchase: PurchaseInfo, offer: OfferInfo) => Promise<void>|void
 * } [onFulfilled] Called when a purchase first grants access
 */

/**
 * @param {unknown} value A Stripe expandable field
 * @returns {string|undefined}
 */
const idOf = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  return value && typeof value === 'object' && 'id' in value
    ? String(value.id)
    : undefined;
};

/**
 * @param {import('stripe').Stripe.Invoice} invoice
 * @returns {string|undefined}
 */
const subscriptionOfInvoice = (invoice) => {
  return idOf(invoice.parent?.subscription_details?.subscription);
};

/**
 * Stripe integration: syncs offers to Stripe products/prices, starts hosted
 * Checkout (which offers card and wallet methods such as Apple/Google Pay),
 * and turns verified webhook events into privilege and group-membership
 * grants and revocations. Webhooks, not browser redirects, are the source
 * of truth.
 */
class PaymentManager {
  /**
   * @param {OfferManager} om
   * @param {PaymentManagerOptions} options
   */
  constructor (om, {secret, webhookSecret, stripe, onFulfilled}) {
    this.om = om;
    this.am = om.am;
    this.purchases =
      /** @type {import('mongodb').Collection<PurchaseInfo>} */ (
        om.purchases
      );
    this.offers = /** @type {import('mongodb').Collection<OfferInfo>} */ (
      om.offers
    );
    this.processedEvents = /**
                            * @type {import('mongodb').Collection<
                            *import('./offer-manager.js').ProcessedEventInfo
    >} */ (om.processedEvents);
    this.accounts = /**
                     * @type {import('mongodb').Collection<
                     *Partial<import('./account-manager.js').AccountInfo>
    >} */ (om.am.accounts);
    this.stripe = stripe ?? new Stripe(secret);
    this.webhookSecret = webhookSecret;
    this.onFulfilled = onFulfilled;
  }

  /**
   * @param {import('stripe').Stripe.Event} event
   * @returns {Promise<void>}
   */
  async #dispatch (event) {
    switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await this.#onCheckout(event.data.object);
      break;
    case 'invoice.paid':
      await this.#onInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await this.#setSubscriptionStatus(
        subscriptionOfInvoice(event.data.object), 'past_due'
      );
      break;
    case 'invoice.voided':
      await this.#refundPayments({
        invoiceId: event.data.object.id, full: true
      });
      break;
    case 'customer.subscription.updated':
      await this.#setSubscriptionStatus(
        event.data.object.id,
        event.data.object.status === 'canceled'
          ? 'canceled'
          : (['past_due', 'unpaid'].includes(event.data.object.status)
            ? 'past_due'
            : 'active')
      );
      break;
    case 'customer.subscription.deleted':
      await this.#setSubscriptionStatus(event.data.object.id, 'canceled');
      break;
    case 'charge.refunded': {
      const charge = event.data.object;
      await this.#refundPayments({
        paymentIntentId: idOf(charge.payment_intent),
        full: charge.amount_refunded >= charge.amount
      });
      break;
    }
    case 'charge.dispute.created':
      await this.#refundPayments({
        paymentIntentId: idOf(event.data.object.payment_intent), full: true
      });
      break;
    default:
      break;
    }
  }

  /**
   * @param {string|undefined} stripeSubscriptionId
   * @param {import('./offer-manager.js').PurchaseStatus} status
   * @returns {Promise<void>}
   */
  async #setSubscriptionStatus (stripeSubscriptionId, status) {
    if (!stripeSubscriptionId) {
      return;
    }
    await this.purchases.updateOne(
      {stripeSubscriptionId, status: {$ne: 'refunded'}}, {$set: {status}}
    );
  }

  /**
   * @param {import('stripe').Stripe.Checkout.Session} session
   * @returns {Promise<void>}
   */
  async #onCheckout (session) {
    const {userID, offerSlug} = session.metadata ?? {};
    if (!userID || !offerSlug) {
      return;
    }
    const stripeCustomerId = idOf(session.customer);
    if (session.mode === 'subscription') {
      // Access is granted by `invoice.paid`; just record the purchase.
      await this.#upsertPurchase({
        userID,
        offerSlug,
        stripeCustomerId: /** @type {string} */ (stripeCustomerId),
        stripeSubscriptionId: idOf(session.subscription)
      });
      return;
    }
    if (session.payment_status !== 'paid') {
      return;
    }
    const paymentIntentId = /** @type {string} */ (
      idOf(session.payment_intent)
    );
    const purchase = await this.#upsertPurchase({
      userID,
      offerSlug,
      stripeCustomerId: /** @type {string} */ (stripeCustomerId),
      stripePaymentIntentId: paymentIntentId
    });
    if (purchase.payments.some((p) => {
      return p.paymentIntentId === paymentIntentId;
    })) {
      return;
    }
    const offer = /** @type {OfferInfo} */ (
      await this.om.getOffer(offerSlug)
    );
    /** @type {PaymentInfo} */
    const payment = {
      paymentIntentId,
      amount: session.amount_total ?? offer.amount,
      paidAt: Date.now()
    };
    await this.#recordPayment(purchase, payment);
    for (const assignment of offer.privilegeIDs) {
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.addPrivilegeToUser(
        typeof assignment === 'string'
          ? {userID, privilegeName: assignment}
          : {userID, ...assignment}
      );
    }
    for (const groupName of offer.groupNames) {
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.grantGroupMembershipUntil({
        userID, groupName, expiresAt: Number.MAX_SAFE_INTEGER
      });
    }
    await this.onFulfilled?.(purchase, offer);
  }

  /**
   * @param {{
   *   userID: string,
   *   offerSlug: string,
   *   stripeCustomerId: string,
   *   stripeSubscriptionId?: string,
   *   stripePaymentIntentId?: string
   * }} data
   * @returns {Promise<PurchaseInfo>}
   */
  async #upsertPurchase (data) {
    const {purchases} = this;
    const filter = data.stripeSubscriptionId
      ? {stripeSubscriptionId: data.stripeSubscriptionId}
      : {stripePaymentIntentId: data.stripePaymentIntentId};
    await purchases.updateOne(filter, {
      $setOnInsert: {
        ...data, status: 'active', payments: [], date: Date.now()
      }
    }, {upsert: true});
    return /** @type {PurchaseInfo} */ (await purchases.findOne(filter));
  }

  /**
   * @param {PurchaseInfo} purchase
   * @param {PaymentInfo} payment
   * @returns {Promise<void>}
   */
  async #recordPayment (purchase, payment) {
    await this.purchases.updateOne({_id: purchase._id}, {
      $push: {payments: payment},
      $set: {
        status: 'active',
        ...(payment.periodEnd ? {currentPeriodEnd: payment.periodEnd} : {})
      }
    });
    purchase.payments.push(payment);
  }

  /**
   * @param {import('stripe').Stripe.Invoice} paidInvoice
   * @returns {Promise<void>}
   */
  async #onInvoicePaid (paidInvoice) {
    const stripeSubscriptionId = subscriptionOfInvoice(paidInvoice);
    if (!stripeSubscriptionId) {
      return;
    }
    // Payments are not included in webhook payloads
    const invoice = await this.stripe.invoices.retrieve(paidInvoice.id, {
      expand: ['payments']
    });
    const {userID, offerSlug} =
      invoice.parent?.subscription_details?.metadata ?? {};
    let purchase = /** @type {PurchaseInfo|null} */ (
      await this.purchases.findOne({stripeSubscriptionId})
    );
    if (!purchase) {
      // Events can arrive out of order, ahead of `checkout.session.completed`
      if (!userID || !offerSlug) {
        return;
      }
      purchase = await this.#upsertPurchase({
        userID,
        offerSlug,
        stripeCustomerId: /** @type {string} */ (idOf(invoice.customer)),
        stripeSubscriptionId
      });
    }
    if (purchase.payments.some((p) => {
      return p.invoiceId === invoice.id;
    })) {
      return;
    }
    const offer = await this.om.getOffer(purchase.offerSlug);
    if (!offer?.interval) {
      return;
    }
    const periodEnd = Math.max(
      ...invoice.lines.data.map(({period}) => period.end * 1000)
    );
    const grantedUntil = getAccessEnd(offer, periodEnd);
    const wasFirst = purchase.payments.length === 0;
    await this.#recordPayment(purchase, {
      invoiceId: invoice.id,
      paymentIntentId: idOf(
        invoice.payments?.data[0]?.payment.payment_intent
      ),
      amount: invoice.amount_paid,
      paidAt: Date.now(),
      periodEnd,
      grantedUntil
    });
    for (const assignment of offer.privilegeIDs) {
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.grantPrivilegeUntil({
        userID: purchase.userID,
        expiresAt: grantedUntil,
        ...(typeof assignment === 'string'
          ? {privilegeName: assignment}
          : assignment)
      });
    }
    for (const groupName of offer.groupNames) {
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.grantGroupMembershipUntil({
        userID: purchase.userID, groupName, expiresAt: grantedUntil
      });
    }
    if (wasFirst) {
      await this.onFulfilled?.(purchase, offer);
    }
  }

  /**
   * Marks the matching payment(s) refunded (a full refund, or a partial one
   * for offers that revoke on partial refund) and then recomputes what the
   * user's remaining purchases still entitle them to.
   * @param {{
   *   paymentIntentId?: string,
   *   invoiceId?: string,
   *   full: boolean
   * }} cfg
   * @returns {Promise<void>}
   */
  async #refundPayments ({paymentIntentId, invoiceId, full}) {
    const {purchases} = this;
    const filter = paymentIntentId
      ? {$or: [
        {stripePaymentIntentId: paymentIntentId},
        {'payments.paymentIntentId': paymentIntentId}
      ]}
      : {'payments.invoiceId': invoiceId};
    const purchase = await purchases.findOne(filter);
    if (!purchase) {
      return;
    }
    const offer = await this.om.getOffer(purchase.offerSlug);
    if (!offer || (!full && !offer.revokeOnPartialRefund)) {
      return;
    }
    const payments = purchase.payments.map((payment) => {
      return (paymentIntentId
        ? payment.paymentIntentId === paymentIntentId
        : payment.invoiceId === invoiceId)
        ? {...payment, refunded: true}
        : payment;
    });
    const status = payments.every((p) => {
      return p.refunded;
    })
      ? 'refunded'
      : purchase.status;
    await purchases.updateOne(
      {_id: purchase._id}, {$set: {payments, status}}
    );
    await this.#reconcile(purchase.userID, offer);
  }

  /**
   * Sets each privilege and group membership of the offer to the latest
   * entitlement that the user's non-refunded purchases still give, without
   * touching permanent access that did not come from a purchase.
   * @param {string} userID
   * @param {OfferInfo} refundedOffer
   * @returns {Promise<void>}
   */
  async #reconcile (userID, refundedOffer) {
    const purchases = await this.purchases.find({userID}).toArray();
    /** @type {Map<string, OfferInfo|null>} */
    const offers = new Map();
    for (const {offerSlug} of purchases) {
      // eslint-disable-next-line no-await-in-loop -- Few
      offers.set(offerSlug, await this.om.getOffer(offerSlug));
    }

    /**
     * @param {(offer: OfferInfo) => boolean} grants
     * @returns {number}
     */
    const entitledUntil = (grants) => {
      let end = 0;
      for (const purchase of purchases) {
        const offer = offers.get(purchase.offerSlug);
        if (!offer || !grants(offer)) {
          continue;
        }
        for (const payment of purchase.payments) {
          if (payment.refunded) {
            continue;
          }
          end = Math.max(
            end, offer.interval
              ? (payment.grantedUntil ?? 0)
              : Number.MAX_SAFE_INTEGER
          );
        }
      }
      return end;
    };

    const account = await this.accounts.findOne({user: userID});
    for (const assignment of refundedOffer.privilegeIDs) {
      const privilegeName = typeof assignment === 'string'
        ? assignment
        : assignment.privilegeName;
      const end = entitledUntil((offer) => {
        return offer.privilegeIDs.some((a) => {
          return (typeof a === 'string' ? a : a.privilegeName) ===
            privilegeName;
        });
      });
      const current = (account?.privilegeIDs ?? []).find((a) => {
        return (typeof a === 'string' ? a : a.privilegeName) ===
          privilegeName;
      });
      // Permanent access on a recurring offer's privilege didn't come
      //   from us, so leave it alone.
      if (refundedOffer.interval && (
        typeof current === 'string' || current?.expiresAt === undefined
      )) {
        continue;
      }
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.removePrivilegeFromUser({userID, privilegeName});
      if (end) {
        // eslint-disable-next-line no-await-in-loop -- Few
        await (end === Number.MAX_SAFE_INTEGER
          ? this.am.addPrivilegeToUser(
            typeof assignment === 'string'
              ? {userID, privilegeName}
              : {userID, ...assignment}
          )
          : this.am.grantPrivilegeUntil({
            userID,
            expiresAt: end,
            ...(typeof assignment === 'string'
              ? {privilegeName}
              : assignment)
          }));
      }
    }
    for (const groupName of refundedOffer.groupNames) {
      const end = entitledUntil((offer) => {
        return offer.groupNames.includes(groupName);
      });
      // eslint-disable-next-line no-await-in-loop -- Few
      await this.am.removeGroupMembershipFromUser({userID, groupName});
      if (end) {
        // eslint-disable-next-line no-await-in-loop -- Few
        await this.am.grantGroupMembershipUntil({
          userID, groupName, expiresAt: end
        });
      }
    }
  }
  /**
   * Ensures the offer has a Stripe product and price, saving their IDs.
   * @param {OfferInfo} offer
   * @returns {Promise<OfferInfo>}
   */
  async syncOffer (offer) {
    const {stripe} = this;
    let {stripeProductId, stripePriceId} = offer;
    const productFields = {
      name: offer.name,
      description: offer.description,
      metadata: {offerSlug: offer.slug}
    };
    if (stripeProductId) {
      await stripe.products.update(stripeProductId, productFields);
    } else {
      stripeProductId = (await stripe.products.create(productFields)).id;
    }
    if (!stripePriceId) {
      stripePriceId = (await stripe.prices.create({
        product: stripeProductId,
        unit_amount: offer.amount,
        currency: offer.currency,
        ...(offer.interval
          ? {recurring: {
            interval: offer.interval,
            interval_count: offer.intervalCount ?? 1
          }}
          : {})
      })).id;
    }
    await this.offers.updateOne(
      {slug: offer.slug}, {$set: {stripeProductId, stripePriceId}}
    );
    return {...offer, stripeProductId, stripePriceId};
  }

  /**
   * @param {{
   *   userID: string,
   *   offerSlug: string,
   *   successURL: string,
   *   cancelURL: string
   * }} cfg
   * @returns {Promise<string>} The hosted Checkout URL
   */
  async createCheckout ({userID, offerSlug, successURL, cancelURL}) {
    let offer = await this.om.getOffer(offerSlug);
    if (!offer || !offer.active) {
      throw new Error('offer-missing');
    }
    const user = await this.accounts.findOne({user: userID});
    if (!user) {
      throw new Error('user-missing');
    }
    if (!offer.stripePriceId) {
      offer = await this.syncOffer(offer);
    }
    const customer = await this.om.getCustomerId(userID);
    const metadata = {userID, offerSlug};
    const session = await this.stripe.checkout.sessions.create({
      mode: offer.interval ? 'subscription' : 'payment',
      line_items: [{price: offer.stripePriceId, quantity: 1}],
      client_reference_id: userID,
      metadata,
      ...(customer
        ? {customer}
        : {customer_email: user.email}),
      ...(offer.interval
        ? {subscription_data: {metadata}}
        : {payment_intent_data: {metadata}}),
      success_url: successURL,
      cancel_url: cancelURL
    });
    return /** @type {string} */ (session.url);
  }

  /**
   * Starts a Stripe-hosted billing portal session in which the payer can
   * cancel, update a card, and view invoices.
   * @param {{userID: string, returnURL: string}} cfg
   * @returns {Promise<string>} The portal URL
   */
  async createPortalSession ({userID, returnURL}) {
    const customer = await this.om.getCustomerId(userID);
    if (!customer) {
      throw new Error('no-purchase');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer, return_url: returnURL
    });
    return session.url;
  }

  /**
   * Verifies the signature and processes the event.
   * @param {Buffer|string} rawBody
   * @param {string} signature
   * @returns {Promise<void>}
   */
  async handleWebhook (rawBody, signature) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody, signature, this.webhookSecret
    );
    await this.handleEvent(event);
  }

  /**
   * Idempotent: events already processed are skipped, and the handlers
   * themselves converge on the same state if an event is repeated.
   * @param {import('stripe').Stripe.Event} event
   * @returns {Promise<void>}
   */
  async handleEvent (event) {
    const processed = this.processedEvents;
    if (await processed.findOne({_id: event.id})) {
      return;
    }
    await this.#dispatch(event);
    try {
      await processed.insertOne({
        _id: event.id, type: event.type, date: Date.now()
      });
    /* c8 ignore next 5 -- Race with a concurrent duplicate delivery. */
    } catch (err) {
      if (/** @type {{code?: number}} */ (err).code !== 11000) {
        throw err;
      }
    }
  }
}

export default PaymentManager;

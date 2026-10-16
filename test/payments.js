/* eslint-disable camelcase, require-await -- Stripe names; async fakes */
import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Stripe from 'stripe';

import AccountManager from '../app/server/modules/account-manager.js';
import DBFactory from '../app/server/modules/db-factory.js';
import OfferManager, {
  addInterval
} from '../app/server/modules/offer-manager.js';
import PaymentManager from '../app/server/modules/payments.js';
import {i18n as setI18n} from '../app/server/modules/i18n.js';

/**
 * @typedef {import('stripe').Stripe.Event} StripeEvent
 * @typedef {import('stripe').Stripe.Invoice} StripeInvoice
 * @typedef {import('../app/server/modules/account-manager.js').
 *   PrivilegeAssignment} PrivilegeAssignment
 * @typedef {import('../app/server/modules/account-manager.js').
 *   GroupMembership} GroupMembership
 */

chai.use(chaiAsPromised);

describe('PaymentManager', function () {
  this.timeout(30000);
  const DB_NAME = 'nogin-payments-test';
  const secret = 'whsec_test';
  const DAY = 24 * 60 * 60 * 1000;
  /** @type {AccountManager} */
  let am;
  /** @type {OfferManager} */
  let om;
  /** @type {PaymentManager} */
  let pm;
  /** @type {string[]} */
  let calls;
  /** @type {{[id: string]: StripeInvoice}} */
  let invoices;
  /** @type {string[]} */
  let fulfilled;
  let eventCount = 0;

  /**
   * @param {string} type
   * @param {object} object
   * @returns {StripeEvent}
   */
  const event = (type, object) => {
    eventCount++;
    return /** @type {StripeEvent} */ (/** @type {unknown} */ ({
      id: `evt_${eventCount}`, type, data: {object}
    }));
  };

  /**
   * @param {string} id
   * @param {string} subscription
   * @param {number} periodEnd
   * @param {string} paymentIntent
   * @returns {StripeInvoice}
   */
  const invoice = (id, subscription, periodEnd, paymentIntent) => {
    const inv = /** @type {StripeInvoice} */ (/** @type {unknown} */ ({
      id,
      customer: 'cus_1',
      amount_paid: 500,
      parent: {subscription_details: {
        subscription,
        metadata: {userID: 'payer', offerSlug: 'pro'}
      }},
      lines: {data: [{period: {end: periodEnd / 1000}}]},
      payments: {data: [{payment: {payment_intent: paymentIntent}}]}
    }));
    invoices[id] = inv;
    return inv;
  };

  /**
   * @returns {Promise<{privileges: string[], groups: string[]}>}
   */
  const access = async () => {
    const account = await am.accounts?.findOne({user: 'payer'});
    const now = Date.now();
    /** @type {PrivilegeAssignment[]} */
    const privilegeIDs = account?.privilegeIDs ?? [];
    /** @type {GroupMembership[]} */
    const memberships = account?.groupMemberships ?? [];
    return {
      privileges: privilegeIDs.filter((a) => {
        return typeof a === 'string' || !a.expiresAt || a.expiresAt > now;
      }).map((a) => {
        return typeof a === 'string' ? a : a.privilegeName;
      }),
      groups: memberships.filter((m) => {
        return m.expiresAt > now;
      }).map((m) => {
        return m.groupName;
      })
    };
  };

  before(async function () {
    const _ = await setI18n()({
      // @ts-expect-error Why isn't the first overload accepted?
      acceptsLanguages: () => ['en-US']
    });
    am = await new AccountManager('mongodb', {
      DB_URL: DBFactory.getURL('mongodb', false, {
        DB_HOST: '127.0.0.1', DB_PORT: 27017, DB_NAME
      }),
      DB_NAME,
      _
    }).connect();
    om = await new OfferManager(am).connect();
    await om.offers?.deleteMany({});
    await om.purchases?.deleteMany({});
    await om.processedEvents?.deleteMany({});
    await Promise.all([
      am.addNewPrivilege({
        privilegeName: 'payPriv', description: 'p', userVarying: true
      }),
      am.addNewPrivilege({
        privilegeName: 'lifePriv', description: 'l', userVarying: true
      })
    ]);
    await am.addNewGroup({groupName: 'payGroup'});
    await am.addNewAccount({
      user: 'payer', email: 'payer@example.name', pass: '123456',
      name: '', country: 'US', activated: true
    });
    await om.createOffer({
      slug: 'pro', name: 'Pro', description: 'Pro', amount: 500,
      currency: 'usd', interval: 'month', privilegeIDs: ['payPriv'],
      groupNames: ['payGroup']
    });
    await om.createOffer({
      slug: 'life', name: 'Life', description: 'Life', amount: 9900,
      currency: 'usd', privilegeIDs: ['lifePriv'], groupNames: []
    });

    calls = [];
    invoices = {};
    fulfilled = [];
    const stripe = /** @type {Stripe} */ (/** @type {unknown} */ ({
      products: {
        async create () {
          calls.push('product.create');
          return {id: 'prod_1'};
        },
        async update () {
          calls.push('product.update');
        }
      },
      prices: {
        async create () {
          calls.push('price.create');
          return {id: 'price_1'};
        }
      },
      checkout: {sessions: {async create (
        /** @type {import('stripe').Stripe.Checkout.SessionCreateParams} */
        params
      ) {
        calls.push(`checkout:${params.mode}`);
        return {url: 'https://checkout.example/session'};
      }}},
      billingPortal: {sessions: {async create (
        /** @type {import('stripe').Stripe.BillingPortal.SessionCreateParams} */
        params
      ) {
        calls.push(`portal:${params.customer}`);
        return {url: 'https://portal.example/session'};
      }}},
      invoices: {async retrieve (/** @type {string} */ id) {
        return invoices[id];
      }},
      webhooks: new Stripe('sk_test_x').webhooks
    }));
    pm = new PaymentManager(om, {
      secret: 'sk_test_x',
      webhookSecret: secret,
      stripe,
      onFulfilled (purchase) {
        fulfilled.push(purchase.offerSlug);
      }
    });
  });

  after(async function () {
    await om.offers?.deleteMany({});
    await om.purchases?.deleteMany({});
    await om.processedEvents?.deleteMany({});
    await am.deleteAccounts({user: 'payer'});
    await Promise.all([
      am.deletePrivilegeByPrivilegeName('payPriv'),
      am.deletePrivilegeByPrivilegeName('lifePriv'),
      am.deleteGroupByGroupName('payGroup')
    ]);
  });

  it('syncs offers to Stripe and starts checkout', async function () {
    const offer = await om.getOffer('pro');
    if (!offer) {
      throw new Error('Missing offer');
    }
    await pm.syncOffer(offer);
    expect((await om.getOffer('pro'))?.stripePriceId).to.equal('price_1');
    const url = await pm.createCheckout({
      userID: 'payer', offerSlug: 'pro', successURL: 'https://x/ok',
      cancelURL: 'https://x/no'
    });
    expect(url).to.equal('https://checkout.example/session');
    expect(calls).to.include('checkout:subscription');
    await expect(pm.createCheckout({
      userID: 'payer', offerSlug: 'nope', successURL: 'a', cancelURL: 'b'
    })).to.be.rejectedWith(Error, 'offer-missing');
    await expect(pm.createCheckout({
      userID: 'nobody', offerSlug: 'pro', successURL: 'a', cancelURL: 'b'
    })).to.be.rejectedWith(Error, 'user-missing');
  });

  it('verifies webhook signatures', async function () {
    const payload = JSON.stringify(event('ping', {}));
    await expect(pm.handleWebhook(payload, 'bad')).to.be.rejected;
    const header = Stripe.webhooks.generateTestHeaderString({
      payload, secret
    });
    await pm.handleWebhook(payload, header);
  });

  it('grants, extends, and refunds a subscription', async function () {
    const start = Date.now();
    const periodEnd = addInterval(start, 'month', 1);
    await pm.handleEvent(event('checkout.session.completed', {
      mode: 'subscription', customer: 'cus_1', subscription: 'sub_1',
      metadata: {userID: 'payer', offerSlug: 'pro'}
    }));
    expect((await access()).privileges).to.not.include('payPriv');

    const first = event(
      'invoice.paid', invoice('in_1', 'sub_1', periodEnd, 'pi_1')
    );
    await pm.handleEvent(first);
    await pm.handleEvent(first);
    expect(await access()).to.deep.equal({
      privileges: ['payPriv'], groups: ['payGroup']
    });
    expect(fulfilled).to.deep.equal(['pro']);
    let purchase = await om.purchases?.findOne({stripeSubscriptionId: 'sub_1'});
    expect(purchase?.payments).to.have.length(1);
    // One week of grace for a monthly plan
    expect(purchase?.payments[0].grantedUntil).to.equal(
      addInterval(periodEnd, 'week', 1)
    );

    await pm.handleEvent(event('invoice.payment_failed', {
      parent: {subscription_details: {subscription: 'sub_1'}}
    }));
    purchase = await om.purchases?.findOne({stripeSubscriptionId: 'sub_1'});
    expect(purchase?.status).to.equal('past_due');
    expect((await access()).privileges).to.include('payPriv');

    const next = addInterval(periodEnd, 'month', 1);
    await pm.handleEvent(
      event('invoice.paid', invoice('in_2', 'sub_1', next, 'pi_2'))
    );
    purchase = await om.purchases?.findOne({stripeSubscriptionId: 'sub_1'});
    expect(purchase).to.deep.include({
      status: 'active', currentPeriodEnd: next
    });

    // Partial refund does nothing by default
    await pm.handleEvent(event('charge.refunded', {
      payment_intent: 'pi_2', amount: 500, amount_refunded: 100
    }));
    expect((await access()).privileges).to.include('payPriv');

    // Full refund of the latest payment falls back to the earlier one
    await pm.handleEvent(event('charge.refunded', {
      payment_intent: 'pi_2', amount: 500, amount_refunded: 500
    }));
    let account = await am.accounts?.findOne({user: 'payer'});
    expect(account?.groupMemberships?.[0].expiresAt).to.equal(
      addInterval(periodEnd, 'week', 1)
    );

    // Dispute of the remaining payment revokes everything
    await pm.handleEvent(event('charge.dispute.created', {
      payment_intent: 'pi_1'
    }));
    expect(await access()).to.deep.equal({privileges: [], groups: []});
    purchase = await om.purchases?.findOne({stripeSubscriptionId: 'sub_1'});
    expect(purchase?.status).to.equal('refunded');

    await pm.handleEvent(event('customer.subscription.deleted', {id: 'sub_1'}));
    account = await am.accounts?.findOne({user: 'payer'});
    expect(account?.privilegeIDs ?? []).to.deep.equal([]);
  });

  it('creates the purchase when invoice.paid arrives first', async function () {
    const periodEnd = addInterval(Date.now(), 'month', 1);
    await pm.handleEvent(event(
      'invoice.paid', invoice('in_3', 'sub_2', periodEnd, 'pi_3')
    ));
    expect(await om.purchases?.findOne({stripeSubscriptionId: 'sub_2'})).
      to.deep.include({userID: 'payer', offerSlug: 'pro'});
    expect((await access()).privileges).to.include('payPriv');
    await pm.handleEvent(event('customer.subscription.updated', {
      id: 'sub_2', status: 'unpaid'
    }));
    const sub2 = await om.purchases?.findOne({stripeSubscriptionId: 'sub_2'});
    expect(sub2?.status).to.equal('past_due');
    await pm.handleEvent(event('invoice.voided', {id: 'in_3'}));
    expect((await access()).privileges).to.not.include('payPriv');
  });

  it('grants and refunds one-time purchases permanently', async function () {
    const session = {
      mode: 'payment', customer: 'cus_1', payment_intent: 'pi_9',
      payment_status: 'paid', amount_total: 9900,
      metadata: {userID: 'payer', offerSlug: 'life'}
    };
    await pm.handleEvent(event('checkout.session.completed', session));
    await pm.handleEvent(event(
      'checkout.session.async_payment_succeeded', session
    ));
    expect((await access()).privileges).to.deep.equal(['lifePriv']);
    expect(fulfilled.filter((slug) => slug === 'life')).to.have.length(1);
    await pm.handleEvent(event('charge.refunded', {
      payment_intent: 'pi_9', amount: 9900, amount_refunded: 9900
    }));
    expect((await access()).privileges).to.deep.equal([]);
    // Unpaid or unknown sessions and events are ignored
    await pm.handleEvent(event('checkout.session.completed', {
      ...session, payment_intent: 'pi_10', payment_status: 'unpaid'
    }));
    await pm.handleEvent(
      event('checkout.session.completed', {mode: 'payment'})
    );
    await pm.handleEvent(event('something.else', {}));
    expect(DAY).to.be.greaterThan(0);
  });

  it('opens the billing portal only for payers', async function () {
    expect(await pm.createPortalSession({
      userID: 'payer', returnURL: 'https://x/plans'
    })).to.equal('https://portal.example/session');
    expect(calls).to.include('portal:cus_1');
    await expect(pm.createPortalSession({
      userID: 'nobody', returnURL: 'https://x/plans'
    })).to.be.rejectedWith(Error, 'no-purchase');
  });
});

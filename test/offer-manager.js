import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import AccountManager from '../app/server/modules/account-manager.js';
import DBFactory from '../app/server/modules/db-factory.js';
import OfferManager, {
  addInterval, getAccessEnd
} from '../app/server/modules/offer-manager.js';
import {i18n as setI18n} from '../app/server/modules/i18n.js';

chai.use(chaiAsPromised);

describe('OfferManager', function () {
  describe('addInterval and getAccessEnd', function () {
    const start = Date.UTC(2026, 0, 31, 12);
    it('adds calendar-aware intervals', function () {
      expect(addInterval(start, 'day', 2)).to.equal(Date.UTC(2026, 1, 2, 12));
      expect(addInterval(start, 'week', 1)).to.equal(
        Date.UTC(2026, 1, 7, 12)
      );
      expect(addInterval(start, 'year', 1)).to.equal(
        Date.UTC(2027, 0, 31, 12)
      );
      expect(addInterval(Date.UTC(2026, 0, 15), 'month', 1)).to.equal(
        Date.UTC(2026, 1, 15)
      );
    });
    it('defaults grace to one step below the interval', function () {
      /**
       * @type {[
       *   import('../app/server/modules/offer-manager.js').IntervalUnit,
       *   number
       * ][]}
       */
      const cases = [
        ['year', addInterval(start, 'month', 1)],
        ['month', addInterval(start, 'week', 1)],
        ['week', addInterval(start, 'day', 1)],
        ['day', start]
      ];
      for (const [interval, expected] of cases) {
        expect(getAccessEnd(
          {interval}, start
        )).to.equal(expected);
      }
    });
    it('honors configured grace', function () {
      expect(getAccessEnd(
        {interval: 'month', graceUnit: 'day'}, start
      )).to.equal(start);
      expect(getAccessEnd(
        {interval: 'month', graceUnit: 'day', graceCount: 3}, start
      )).to.equal(addInterval(start, 'day', 3));
    });
  });

  describe('with a database', function () {
    this.timeout(30000);
    const DB_NAME = 'nogin-offers-test';
    /** @type {AccountManager} */
    let am;
    /** @type {OfferManager} */
    let om;

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
      await Promise.all([
        am.addNewPrivilege({
          privilegeName: 'offerBool', description: 'b', userVarying: true
        }),
        am.addNewPrivilege({
          privilegeName: 'offerNum', description: 'n', type: 'number',
          userVarying: true
        }),
        am.addNewPrivilege({
          privilegeName: 'offerGroupScoped', description: 'g'
        })
      ]);
      await am.addNewGroup({groupName: 'offerGroup'});
    });

    after(async function () {
      await om.offers?.deleteMany({});
      await om.purchases?.deleteMany({});
      await Promise.all([
        am.deletePrivilegeByPrivilegeName('offerBool'),
        am.deletePrivilegeByPrivilegeName('offerNum'),
        am.deletePrivilegeByPrivilegeName('offerGroupScoped'),
        am.deleteGroupByGroupName('offerGroup')
      ]);
    });

    const valid = () => ({
      slug: 'pro', name: 'Pro', description: 'Pro service', amount: 500,
      currency: 'USD', interval: /** @type {const} */ ('month'),
      privilegeIDs: ['offerBool'], groupNames: ['offerGroup']
    });

    it('creates, reads, lists, and archives offers', async function () {
      const offer = await om.createOffer({
        ...valid(), privilegeIDs: [
          'offerBool', {privilegeName: 'offerNum', value: 3}
        ], receiptText: 'Thanks!'
      });
      expect(offer).to.deep.include({
        slug: 'pro', currency: 'usd', interval: 'month', intervalCount: 1,
        revokeOnPartialRefund: false, active: true, receiptText: 'Thanks!'
      });
      expect(await om.getOffer('pro')).to.deep.include({slug: 'pro'});
      expect(await om.getOffer('nope')).to.be.null;

      await om.createOffer({
        slug: 'lifetime', name: 'Lifetime', description: 'Once',
        amount: 9900, currency: 'usd', privilegeIDs: ['offerBool'],
        active: false
      });
      expect((await om.getOffers()).map(({slug}) => slug)).to.deep.equal([
        'lifetime', 'pro'
      ]);
      expect(
        (await om.getOffers({activeOnly: true})).map(({slug}) => slug)
      ).to.deep.equal(['pro']);
      await om.setOfferActive('pro');
      expect(await om.getOffers({activeOnly: true})).to.deep.equal([]);
      await om.setOfferActive('pro', true);
      await expect(om.setOfferActive('nope')).to.be.rejectedWith(
        Error, 'offer-missing'
      );
      await expect(om.createOffer(valid())).to.be.rejectedWith(
        Error, 'offerslug-taken'
      );
    });

    it('rejects invalid offers', async function () {
      /** @type {[Record<string, unknown>, string][]} */
      const cases = [
        [{slug: 'Bad Slug'}, 'bad-offer-slug'],
        [{name: ' '}, 'bad-offer-name'],
        [{description: ''}, 'bad-offer-description'],
        [{amount: 0}, 'bad-offer-amount'],
        [{amount: 5.5}, 'bad-offer-amount'],
        [{currency: 'dollars'}, 'bad-offer-currency'],
        [{currency: 5}, 'bad-offer-currency'],
        [{interval: 'fortnight'}, 'bad-offer-interval'],
        [{interval: undefined, intervalCount: 2}, 'bad-offer-interval'],
        [{interval: undefined, graceUnit: 'day', graceCount: 1},
          'bad-offer-interval'],
        [{intervalCount: 0}, 'bad-offer-interval'],
        [{graceUnit: 'fortnight', graceCount: 1}, 'bad-offer-grace'],
        [{graceUnit: 'day', graceCount: -1}, 'bad-offer-grace'],
        [{graceCount: 1}, 'bad-offer-grace'],
        [{receiptText: 5}, 'bad-offer-receipttext'],
        [{privilegeIDs: 'x'}, 'bad-offer-grants'],
        [{privilegeIDs: [], groupNames: []}, 'offer-grants-nothing'],
        [{privilegeIDs: [''], groupNames: []}, 'bad-privilegename'],
        [{privilegeIDs: ['offerBool', 'offerBool']}, 'bad-privilegename'],
        [{privilegeIDs: ['missing']}, 'privilege-missing'],
        [{privilegeIDs: ['offerGroupScoped']}, 'bad-privilege-scope'],
        [{privilegeIDs: ['nogin.readUsers']}, 'bad-privilege-scope'],
        [{privilegeIDs: ['offerNum']}, 'bad-privilege-value'],
        [{privilegeIDs: [{privilegeName: 'offerNum', value: 'x'}]},
          'bad-privilege-value'],
        [{privilegeIDs: [{privilegeName: 'offerBool', value: true}]},
          'bad-privilege-value'],
        [{groupNames: ['nogin.guests']}, 'bad-groupname'],
        [{groupNames: ['offerGroup', 'offerGroup']}, 'bad-groupname'],
        [{groupNames: ['']}, 'bad-groupname'],
        [{groupNames: ['missingGroup']}, 'group-not-found']
      ];
      for (const [override, message] of cases) {
        // eslint-disable-next-line no-await-in-loop -- Sequential cases
        await expect(
          om.createOffer({...valid(), slug: 'bad', ...override}),
          message
        ).to.be.rejectedWith(Error, message);
      }
      expect(await om.getOffer('bad')).to.be.null;
    });

    it('locks pricing once purchases exist', async function () {
      await om.offers?.updateOne({slug: 'pro'}, {
        $set: {stripePriceId: 'price_1', stripeProductId: 'prod_1'}
      });
      const edited = await om.editOffer({
        ...valid(), name: 'Pro+', amount: 700
      });
      expect(edited.name).to.equal('Pro+');
      // Changed pricing invalidates the Stripe price
      expect(edited.stripePriceId).to.be.undefined;

      await om.offers?.updateOne({slug: 'pro'}, {
        $set: {stripePriceId: 'price_2', stripeProductId: 'prod_2'}
      });
      const renamed = await om.editOffer({
        ...valid(), amount: 700, name: 'Pro again'
      });
      expect(renamed).to.deep.include({
        stripePriceId: 'price_2', stripeProductId: 'prod_2'
      });

      expect(await om.hasPurchases('pro')).to.equal(false);
      await om.purchases?.insertOne({
        userID: 'u', offerSlug: 'pro', stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1', status: 'active', payments: [],
        date: Date.now()
      });
      expect(await om.hasPurchases('pro')).to.equal(true);
      await expect(om.editOffer({...valid(), amount: 800})).to.be.rejectedWith(
        Error, 'offer-in-use'
      );
      await om.editOffer({...valid(), amount: 700, description: 'New text'});
      await expect(om.editOffer({...valid(), slug: 'nope'})).to.be.rejectedWith(
        Error, 'offer-missing'
      );

      // Unique processor identifiers
      await expect(om.purchases?.insertOne({
        userID: 'v', offerSlug: 'pro', stripeCustomerId: 'cus_2',
        stripeSubscriptionId: 'sub_1', status: 'active', payments: [],
        date: Date.now()
      })).to.be.rejected;
      // Purchases lacking an identifier don't collide
      await om.purchases?.insertMany([
        {
          userID: 'w', offerSlug: 'lifetime', stripeCustomerId: 'cus_3',
          stripePaymentIntentId: 'pi_1', status: 'active', payments: [],
          date: Date.now()
        },
        {
          userID: 'x', offerSlug: 'lifetime', stripeCustomerId: 'cus_4',
          stripePaymentIntentId: 'pi_2', status: 'active', payments: [],
          date: Date.now()
        }
      ]);
    });
  });
});

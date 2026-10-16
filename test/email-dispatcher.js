import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import EmailDispatcher from '../app/server/modules/email-dispatcher.js';
import {getLangDir, i18n as setI18n} from '../app/server/modules/i18n.js';
import composeResetPasswordEmailView from
  '../app/server/views/composeResetPasswordEmail.js';
import composeActivationEmailView from
  '../app/server/views/composeActivationEmail.js';

// Add `rejectedWith`, etc.
chai.use(chaiAsPromised);

const baseConfig = {
  NL_EMAIL_HOST: 'smtp.example.name',
  NL_EMAIL_USER: 'user@example.name',
  NL_EMAIL_PASS: '1234',
  NL_EMAIL_FROM: 'Node Login <do-not-reply@example.name>',
  NL_SITE_URL: 'https://example.name',
  NS_EMAIL_TIMEOUT: 1000,
  composeResetPasswordEmailView,
  composeActivationEmailView
};

const resendConfig = {
  ...baseConfig,
  NL_RESEND_FROM: 'Resend <do-not-reply@resend.example.name>',
  NL_RESEND_PASS: 're_123'
};

const _ = await setI18n()({
  // @ts-expect-error Why isn't the first overload accepted?
  acceptsLanguages: () => ['en-US']
});
const langDir = getLangDir(_);

const cfg = {fromText: 'Site', fromURL: 'https://example.name'};
const resetAccount = {
  name: 'Bob', user: 'bob', passKey: 'abc', email: 'bob@example.name'
};
/** @type {import('../app/server/modules/offer-manager.js').OfferInfo} */
const receiptOffer = {
  slug: 'pro', name: 'Pro plan', description: 'All of it', amount: 2000,
  currency: 'usd', interval: 'year', intervalCount: 1, privilegeIDs: [],
  groupNames: [], receiptText: 'Welcome aboard!', active: true, date: 0
};
const activationAccount = {
  name: 'Bob', user: 'bob', activationCode: 'xyz', email: 'bob@example.name'
};

/**
 * @param {EmailDispatcher} dispatcher
 * @returns {import('emailjs').SMTPClient}
 */
const getSMTPClient = (dispatcher) => {
  if (!dispatcher.smtpClient) {
    throw new Error('Expected an SMTP client');
  }
  return dispatcher.smtpClient;
};

/**
 * @param {EmailDispatcher} dispatcher
 * @returns {import('resend').Resend}
 */
const getResend = (dispatcher) => {
  if (!dispatcher.resend) {
    throw new Error('Expected a Resend client');
  }
  return dispatcher.resend;
};

describe('EmailDispatcher', function () {
  describe('constructor', function () {
    it('uses SMTP when no Resend password is given', function () {
      const dispatcher = new EmailDispatcher(baseConfig);
      expect(dispatcher.smtpClient).to.be.an('object');
      expect(dispatcher.resend).to.be.undefined;
    });

    it('uses Resend (and no SMTP client) when configured', function () {
      const dispatcher = new EmailDispatcher(resendConfig);
      expect(dispatcher.resend).to.be.an('object');
      expect(dispatcher.smtpClient).to.be.undefined;
    });

    it('throws if `NL_RESEND_PASS` lacks `NL_RESEND_FROM`', function () {
      expect(() => {
        // eslint-disable-next-line no-new -- Testing constructor
        new EmailDispatcher({...baseConfig, NL_RESEND_PASS: 're_123'});
      }).to.throw('`NL_RESEND_PASS` requires `NL_RESEND_FROM`.');
    });

    it('throws if `NL_RESEND_FROM` is empty', function () {
      expect(() => {
        // eslint-disable-next-line no-new -- Testing constructor
        new EmailDispatcher({
          ...baseConfig, NL_RESEND_PASS: 're_123', NL_RESEND_FROM: ''
        });
      }).to.throw('`NL_RESEND_PASS` requires `NL_RESEND_FROM`.');
    });
  });

  describe('SMTP (emailjs) path', function () {
    /**
     * @type {(import('emailjs').Message|
     *   import('emailjs').MessageHeaders)[]}
     */
    let sent;
    /** @type {EmailDispatcher} */
    let dispatcher;
    beforeEach(function () {
      sent = [];
      dispatcher = new EmailDispatcher(baseConfig);
      getSMTPClient(dispatcher).sendAsync = (msg) => {
        sent.push(msg);
        return Promise.resolve(msg);
      };
    });

    it('sends a password reset email', async function () {
      await dispatcher.dispatchResetPasswordLink(
        resetAccount, cfg, _, langDir
      );
      expect(sent).to.have.lengthOf(1);
      expect(sent[0]).to.include({
        from: baseConfig.NL_EMAIL_FROM,
        to: 'bob@example.name',
        subject: _('PasswordReset')
      });
      expect(sent[0]).to.have.property('text').that.includes('bob');
      expect(sent[0]).to.have.property('attachment').with.lengthOf(1);
    });

    it('sends an activation email', async function () {
      await dispatcher.dispatchActivationLink(
        activationAccount, cfg, _, langDir
      );
      expect(sent).to.have.lengthOf(1);
      expect(sent[0]).to.include({
        from: baseConfig.NL_EMAIL_FROM,
        to: 'bob@example.name',
        subject: _('AccountActivation')
      });
      expect(sent[0]).to.have.property('attachment').with.lengthOf(1);
    });

    it('sends a purchase receipt email', async function () {
      await dispatcher.dispatchPurchaseReceipt(
        {name: 'Bob', email: 'bob@example.name'}, receiptOffer, cfg, _, langDir
      );
      expect(sent).to.have.lengthOf(1);
      expect(sent[0]).to.include({
        from: baseConfig.NL_EMAIL_FROM,
        to: 'bob@example.name',
        subject: _('PurchaseReceipt')
      });
      const [{data}] = dispatcher.composePurchaseReceiptEmail(
        {name: 'Bob'}, receiptOffer, cfg, _, langDir
      );
      expect(data).to.include('Pro plan').and.to.include('$20.00').
        and.to.include('Welcome aboard!');
      const [{data: bare}] = dispatcher.composePurchaseReceiptEmail(
        {name: 'Bob'}, {...receiptOffer, receiptText: undefined},
        cfg, _, langDir
      );
      expect(bare).to.not.include('Welcome aboard!');
    });

    it('rejects when the SMTP client rejects', async function () {
      getSMTPClient(dispatcher).sendAsync = () => {
        return Promise.reject(new Error('SMTP down'));
      };
      await expect(
        dispatcher.dispatchActivationLink(
          activationAccount, cfg, _, langDir
        )
      ).to.be.rejectedWith('SMTP down');
    });
  });

  describe('Resend path', function () {
    /** @type {import('resend').CreateEmailOptions[]} */
    let sent;
    /** @type {EmailDispatcher} */
    let dispatcher;
    beforeEach(function () {
      sent = [];
      dispatcher = new EmailDispatcher(resendConfig);
      getResend(dispatcher).emails.send = (payload) => {
        sent.push(payload);
        return Promise.resolve({
          data: {id: 'abc'}, error: null, headers: null
        });
      };
    });

    it('sends a password reset email', async function () {
      const result = await dispatcher.dispatchResetPasswordLink(
        resetAccount, cfg, _, langDir
      );
      expect(result).to.deep.equal({id: 'abc'});
      expect(sent).to.have.lengthOf(1);
      expect(sent[0]).to.include({
        from: resendConfig.NL_RESEND_FROM,
        to: 'bob@example.name',
        subject: _('PasswordReset')
      });
      expect(sent[0]).to.have.property('html').that.includes('bob');
    });

    it('sends an activation email', async function () {
      await dispatcher.dispatchActivationLink(
        activationAccount, cfg, _, langDir
      );
      expect(sent).to.have.lengthOf(1);
      expect(sent[0]).to.include({
        from: resendConfig.NL_RESEND_FROM,
        to: 'bob@example.name',
        subject: _('AccountActivation')
      });
    });

    it('throws when Resend returns an error response', async function () {
      getResend(dispatcher).emails.send = () => {
        return Promise.resolve({
          data: null,
          error: {
            message: 'Domain not verified',
            statusCode: 403,
            name: 'invalid_from_address'
          },
          headers: null
        });
      };
      await expect(
        dispatcher.dispatchActivationLink(
          activationAccount, cfg, _, langDir
        )
      ).to.be.rejectedWith('Domain not verified');
    });
  });
});

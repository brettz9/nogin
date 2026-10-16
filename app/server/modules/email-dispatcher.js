// // eslint-disable-next-line import/no-unresolved -- https://github.com/import-js/eslint-plugin-import/issues/2495
import {SMTPClient} from 'emailjs';

// Todo: Reenable when getting dominum working
// import JML from 'jamilih/dist/jml-dominum.js';
// const jml = JML.default;
import {jml} from 'jamilih';
import {Resend} from 'resend';

import composeResetPasswordEmailViewDefault from
  '../views/composeResetPasswordEmail.js';
import composeActivationEmailViewDefault from
  '../views/composeActivationEmail.js';
import composePurchaseReceiptEmailViewDefault from
  '../views/composePurchaseReceiptEmail.js';
import {getOfferFormatters} from '../views/offerFormat.js';

/**
 * @typedef {object} EmailDispatcherConfig
 * @property {string} NL_EMAIL_HOST
 * @property {string} NL_EMAIL_USER E.g., your-email-address@example.name
 * @property {string} NL_EMAIL_PASS E.g., 1234
 * @property {string} NL_EMAIL_FROM
 * @property {string} NL_SITE_URL
 * @property {number} NS_EMAIL_TIMEOUT
 * @property {string} [NL_RESEND_FROM]
 * @property {string} [NL_RESEND_PASS]
 * @property {import('../views/composeResetPasswordEmail.js').
 *   ComposeResetPasswordEmail} composeResetPasswordEmailView
 * @property {import('../views/composeActivationEmail.js').
 *   ComposeActivationEmail} composeActivationEmailView
 * @property {import('../views/composePurchaseReceiptEmail.js').
 *   ComposePurchaseReceiptEmail} [composePurchaseReceiptEmailView]
 */

/**
 * @typedef {import('intl-dom').I18NCallback<string>} Internationalizer
 */

/**
 * Class to send emails.
 */
class EmailDispatcher {
  /**
   * Sets up config and connects to server.
   * @param {EmailDispatcherConfig} config
   */
  constructor (config) {
    const {
      NL_EMAIL_HOST,
      NL_EMAIL_USER, // = 'your-email-address@example.name',
      NL_EMAIL_PASS, // = '1234',
      NL_EMAIL_FROM, // = 'Node Login <do-not-reply@example.name>',
      NS_EMAIL_TIMEOUT,
      NL_SITE_URL,
      NL_RESEND_FROM,
      NL_RESEND_PASS,
      composeResetPasswordEmailView = composeResetPasswordEmailViewDefault,
      composeActivationEmailView = composeActivationEmailViewDefault,
      composePurchaseReceiptEmailView = composePurchaseReceiptEmailViewDefault
    } = config;
    this.NL_SITE_URL = NL_SITE_URL;
    this.NL_EMAIL_FROM = NL_EMAIL_FROM;
    this.NL_RESEND_FROM = NL_RESEND_FROM;
    this.composeResetPasswordEmailView = composeResetPasswordEmailView;
    this.composeActivationEmailView = composeActivationEmailView;
    this.composePurchaseReceiptEmailView = composePurchaseReceiptEmailView;
    Object.assign(this, {
      NL_EMAIL_HOST, NL_EMAIL_USER, NL_EMAIL_PASS,
      NS_EMAIL_TIMEOUT
    });

    if (NL_RESEND_PASS) {
      if (!NL_RESEND_FROM) {
        throw new Error('`NL_RESEND_PASS` requires `NL_RESEND_FROM`.');
      }
      this.resend = new Resend(NL_RESEND_PASS);
    } else {
      this.smtpClient = new SMTPClient({
        host: NL_EMAIL_HOST,
        user: NL_EMAIL_USER,
        password: NL_EMAIL_PASS,
        timeout: NS_EMAIL_TIMEOUT,
        // Todo: Make configurable
        ssl: true
      });
    }
  }

  /**
   * @param {string} to
   * @param {string} subject
   * @param {EmailInfo[]} attachment
   * @returns {Promise<import('emailjs').Message|
   *   import('emailjs').MessageHeaders|
   *   import('resend').CreateEmailResponseSuccess|null>}
   */
  async #send (to, subject, attachment) {
    if (this.resend) {
      // Resend resolves (rather than rejects) on API errors
      const {data, error} = await this.resend.emails.send({
        from: /** @type {string} */ (this.NL_RESEND_FROM),
        to,
        subject,
        html: attachment[0].data
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    }

    return await /** @type {SMTPClient} */ (this.smtpClient).sendAsync({
      from: this.NL_EMAIL_FROM,
      to,
      subject,
      text: attachment[0].data,
      attachment
    });
  }

  /**
   * @param {UserAccountInfo} account
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {Promise<import('emailjs').Message|
   *   import('emailjs').MessageHeaders|
   *   import('resend').CreateEmailResponseSuccess|null>}
   */
  async dispatchResetPasswordLink (account, cfg, _, langDir) {
    const attachment = this.composeResetPasswordEmail(account, cfg, _, langDir);
    const subject = /** @type {string} */ (_('PasswordReset'));
    const to = account.email;

    return await this.#send(to, subject, attachment);
  }

  /**
   * @typedef {object} EmailInfo
   * @property {string} data
   * @property {boolean} alternative
   */

  /**
   * @typedef {object} UserAccountInfo
   * @property {string} name
   * @property {string} user
   * @property {string} passKey
   * @property {string} email
   */

  /**
   * @typedef {object} FromEmailConfig
   * @property {string} fromText
   * @property {string} fromURL
   */

  /**
   * @param {UserAccountInfo} acctInfo
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {EmailInfo[]}
   */
  composeResetPasswordEmail (
    {name, user, passKey}, {fromText, fromURL}, _, langDir
  ) {
    const baseurl = this.NL_SITE_URL;

    const jamilih = this.composeResetPasswordEmailView({
      _, langDir, jml, baseurl, name, user, passKey,
      fromText, fromURL
    });
    const html = jml.toXML(jamilih);
    return [{data: html, alternative: true}];
  }

  /**
   * @param {Partial<import('./account-manager.js').AccountInfo> & {
   *   name: string,
   *   user: string,
   *   activationCode: string
   * }} account
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {Promise<import('emailjs').Message|
   *   import('emailjs').MessageHeaders|
   *   import('resend').CreateEmailResponseSuccess|null>}
   */
  async dispatchActivationLink (account, cfg, _, langDir) {
    const attachment = this.composeActivationEmail(account, cfg, _, langDir);
    const to = /** @type {string} */ (account.email);
    const subject = /** @type {string} */ (_('AccountActivation'));

    return await this.#send(to, subject, attachment);
  }

  /**
   * @param {Partial<import('./account-manager.js').AccountInfo> & {
   *   name: string,
   *   user: string,
   *   activationCode: string
   * }} o
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {EmailInfo[]}
   */
  composeActivationEmail (
    {name, user, activationCode}, {fromText, fromURL}, _, langDir
  ) {
    const baseurl = this.NL_SITE_URL;

    const jamilih = this.composeActivationEmailView({
      _, langDir, jml, baseurl, name, user, activationCode,
      fromText, fromURL
    });
    const html = jml.toXML(jamilih);
    return [{data: html, alternative: true}];
  }

  /**
   * @param {{name: string, email: string}} account
   * @param {import('./offer-manager.js').OfferInfo} offer
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {Promise<import('emailjs').Message|
   *   import('emailjs').MessageHeaders|
   *   import('resend').CreateEmailResponseSuccess|null>}
   */
  async dispatchPurchaseReceipt (account, offer, cfg, _, langDir) {
    const attachment = this.composePurchaseReceiptEmail(
      account, offer, cfg, _, langDir
    );
    const subject = /** @type {string} */ (_('PurchaseReceipt'));

    return await this.#send(account.email, subject, attachment);
  }

  /**
   * @param {{name: string}} account
   * @param {import('./offer-manager.js').OfferInfo} offer
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {EmailInfo[]}
   */
  composePurchaseReceiptEmail (
    {name}, offer, {fromText, fromURL}, _, langDir
  ) {
    const {formatPrice, formatBilling} = getOfferFormatters(_);

    const jamilih = this.composePurchaseReceiptEmailView({
      _, langDir, jml, baseurl: this.NL_SITE_URL, name,
      offerName: offer.name,
      priceText: formatPrice(offer),
      billingText: String(formatBilling(offer)),
      receiptText: offer.receiptText,
      fromText, fromURL
    });
    const html = jml.toXML(jamilih);
    return [{data: html, alternative: true}];
  }
}

export default EmailDispatcher;

// eslint-disable-next-line import/no-unresolved -- https://github.com/import-js/eslint-plugin-import/issues/2495
import {SMTPClient} from 'emailjs';

// Todo: Reenable when getting dominum working
// import JML from 'jamilih/dist/jml-dominum.js';
// const jml = JML.default;
import {jml} from 'jamilih/src/jml-jsdom.js';

import composeResetPasswordEmailViewDefault from
  '../views/composeResetPasswordEmail.js';
import composeActivationEmailViewDefault from
  '../views/composeActivationEmail.js';

/**
* @typedef {object} EmailDispatcherConfig
* @property {string} NL_EMAIL_HOST
* @property {string} NL_EMAIL_USER E.g., your-email-address@example.name
* @property {string} NL_EMAIL_PASS E.g., 1234
* @property {string} NL_EMAIL_FROM
* @property {string} NL_SITE_URL
* @property {number} NS_EMAIL_TIMEOUT
* @property {import('../views/composeResetPasswordEmail.js').
*   ComposeResetPasswordEmail} composeResetPasswordEmailView
* @property {import('../views/composeActivationEmail.js').
*   ComposeActivationEmail} composeActivationEmailView
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
      composeResetPasswordEmailView = composeResetPasswordEmailViewDefault,
      composeActivationEmailView = composeActivationEmailViewDefault
    } = config;
    this.NL_SITE_URL = NL_SITE_URL;
    this.NL_EMAIL_FROM = NL_EMAIL_FROM;
    this.composeResetPasswordEmailView = composeResetPasswordEmailView;
    this.composeActivationEmailView = composeActivationEmailView;
    Object.assign(this, {
      NL_EMAIL_HOST, NL_EMAIL_USER, NL_EMAIL_PASS,
      NS_EMAIL_TIMEOUT
    });

    this.smtpClient = new SMTPClient({
      host: NL_EMAIL_HOST,
      user: NL_EMAIL_USER,
      password: NL_EMAIL_PASS,
      timeout: NS_EMAIL_TIMEOUT,
      // Todo: Make configurable
      ssl: true
    });
  }

  /**
   * @param {UserAccountInfo} account
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @param {import('./i18n.js').LanguageDirection} langDir
   * @returns {Promise<import('emailjs').Message>}
   */
  dispatchResetPasswordLink (account, cfg, _, langDir) {
    const attachment = this.composeResetPasswordEmail(account, cfg, _, langDir);
    return this.smtpClient.sendAsync({
      from: this.NL_EMAIL_FROM,
      to: account.email,
      subject: /** @type {string} */ (_('PasswordReset')),
      text: attachment[0].data,
      attachment
    });
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
   * @returns {Promise<import('emailjs').Message>}
   */
  dispatchActivationLink (account, cfg, _, langDir) {
    const attachment = this.composeActivationEmail(account, cfg, _, langDir);
    return this.smtpClient.sendAsync({
      from: this.NL_EMAIL_FROM,
      to: /** @type {string} */ (account.email),
      subject: /** @type {string} */ (_('AccountActivation')),
      text: attachment[0].data,
      attachment
    });
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
}

export default EmailDispatcher;

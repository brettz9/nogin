'use strict';

const {promisify} = require('util');

const {SMTPClient} = require('emailjs');

// Todo: Reenable when getting dominum working
// const jml = require('jamilih/dist/jml-dominum.js').default;
const jml = require('jamilih/dist/jml-jsdom.js').default;

const composeResetPasswordEmailViewDefault = require(
  '../views/composeResetPasswordEmail.js'
);
const composeActivationEmailViewDefault = require(
  '../views/composeActivationEmail.js'
);

/**
* @typedef {PlainObject} EmailDispatcherConfig
* @property {string} NL_EMAIL_HOST
* @property {string} NL_EMAIL_USER E.g., your-email-address@example.name
* @property {string} NL_EMAIL_PASS E.g., 1234
* @property {string} NL_EMAIL_FROM
* @property {string} NL_SITE_URL
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
    Object.assign(this, {
      composeResetPasswordEmailView,
      composeActivationEmailView,
      NL_EMAIL_HOST, NL_EMAIL_USER, NL_EMAIL_PASS,
      NS_EMAIL_TIMEOUT,
      NL_EMAIL_FROM, NL_SITE_URL
    });

    this.smtpClient = new SMTPClient({
      host: NL_EMAIL_HOST,
      user: NL_EMAIL_USER,
      password: NL_EMAIL_PASS,
      timeout: NS_EMAIL_TIMEOUT,
      // Todo: Make configurable
      ssl: true
    });
    this.smtpClient.send = promisify(this.smtpClient.send);
  }

  /**
   * @callback Internationalizer
   * @returns {string|Element}
   */

  /**
   * @param {UserAccountInfo} account
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @returns {Promise<string>}
   */
  dispatchResetPasswordLink (account, cfg, _) {
    const attachment = this.composeResetPasswordEmail(account, cfg, _);
    return this.smtpClient.send({
      from: this.NL_EMAIL_FROM,
      to: account.email,
      subject: _('PasswordReset'),
      text: attachment[0].data,
      attachment
    });
  }

  /**
  * @typedef {GenericArray} EmailInfo
  * @property {string} data
  * @property {boolean} alternative
  */

  /**
   * @typedef {PlainObject} UserAccountInfo
   * @property {string} name
   * @property {string} user
   * @property {string} passKey
   */

  /**
   * @typedef {PlainObject} FromEmailConfig
   * @property {string} fromText
   * @property {string} fromURL
   */

  /**
   * @param {UserAccountInfo} acctInfo
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @returns {EmailInfo[]}
   */
  composeResetPasswordEmail (
    {name, user, passKey}, {fromText, fromURL}, _
  ) {
    const baseurl = this.NL_SITE_URL;

    const jamilih = this.composeResetPasswordEmailView({
      _, jml, baseurl, name, user, passKey,
      fromText, fromURL
    });
    const html = jml.toXML(jamilih);
    return [{data: html, alternative: true}];
  }

  /**
   * @param {AccountInfo} account
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @returns {Promise<string>}
   */
  dispatchActivationLink (account, cfg, _) {
    const attachment = this.composeActivationEmail(account, cfg, _);
    return this.smtpClient.send({
      from: this.NL_EMAIL_FROM,
      to: account.email,
      subject: _('AccountActivation'),
      text: attachment[0].data,
      attachment
    });
  }

  /**
   * @param {AccountInfo} o
   * @param {FromEmailConfig} cfg
   * @param {Internationalizer} _
   * @returns {EmailInfo[]}
   */
  composeActivationEmail (
    {name, user, activationCode}, {fromText, fromURL}, _
  ) {
    const baseurl = this.NL_SITE_URL;

    const jamilih = this.composeActivationEmailView({
      _, jml, baseurl, name, user, activationCode,
      fromText, fromURL
    });
    const html = jml.toXML(jamilih);
    return [{data: html, alternative: true}];
  }
}

module.exports = EmailDispatcher;

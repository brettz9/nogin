export default EmailDispatcher;
export type EmailDispatcherConfig = {
    NL_EMAIL_HOST: string;
    /**
     * E.g., your-email-address@example.name
     */
    NL_EMAIL_USER: string;
    /**
     * E.g., 1234
     */
    NL_EMAIL_PASS: string;
    NL_EMAIL_FROM: string;
    NL_SITE_URL: string;
    NS_EMAIL_TIMEOUT: number;
    composeResetPasswordEmailView: import("../views/composeResetPasswordEmail.js").ComposeResetPasswordEmail;
    composeActivationEmailView: import("../views/composeActivationEmail.js").ComposeActivationEmail;
};
export type Internationalizer = import("intl-dom").I18NCallback<string>;
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
declare class EmailDispatcher {
    /**
     * Sets up config and connects to server.
     * @param {EmailDispatcherConfig} config
     */
    constructor(config: EmailDispatcherConfig);
    NL_SITE_URL: string;
    NL_EMAIL_FROM: string;
    composeResetPasswordEmailView: import("../views/composeResetPasswordEmail.js").ComposeResetPasswordEmail;
    composeActivationEmailView: import("../views/composeActivationEmail.js").ComposeActivationEmail;
    smtpClient: SMTPClient;
    /**
     * @param {UserAccountInfo} account
     * @param {FromEmailConfig} cfg
     * @param {Internationalizer} _
     * @param {import('./i18n.js').LanguageDirection} langDir
     * @returns {Promise<import('emailjs').Message>}
     */
    dispatchResetPasswordLink(account: {
        name: string;
        user: string;
        passKey: string;
        email: string;
    }, cfg: {
        fromText: string;
        fromURL: string;
    }, _: Internationalizer, langDir: import("./i18n.js").LanguageDirection): Promise<import("emailjs").Message>;
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
    composeResetPasswordEmail({ name, user, passKey }: {
        name: string;
        user: string;
        passKey: string;
        email: string;
    }, { fromText, fromURL }: {
        fromText: string;
        fromURL: string;
    }, _: Internationalizer, langDir: import("./i18n.js").LanguageDirection): {
        data: string;
        alternative: boolean;
    }[];
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
    dispatchActivationLink(account: Partial<import("./account-manager.js").AccountInfo> & {
        name: string;
        user: string;
        activationCode: string;
    }, cfg: {
        fromText: string;
        fromURL: string;
    }, _: Internationalizer, langDir: import("./i18n.js").LanguageDirection): Promise<import("emailjs").Message>;
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
    composeActivationEmail({ name, user, activationCode }: Partial<import("./account-manager.js").AccountInfo> & {
        name: string;
        user: string;
        activationCode: string;
    }, { fromText, fromURL }: {
        fromText: string;
        fromURL: string;
    }, _: Internationalizer, langDir: import("./i18n.js").LanguageDirection): {
        data: string;
        alternative: boolean;
    }[];
}
import { SMTPClient } from 'emailjs';
//# sourceMappingURL=email-dispatcher.d.ts.map
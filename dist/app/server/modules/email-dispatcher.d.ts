import { SMTPClient } from 'emailjs';
import { Resend } from 'resend';
export type EmailInfo = {
    data: string;
    alternative: boolean;
};
export type UserAccountInfo = {
    name: string;
    user: string;
    passKey: string;
    email: string;
};
export type FromEmailConfig = {
    fromText: string;
    fromURL: string;
};
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
    NL_RESEND_FROM?: string;
    NL_RESEND_PASS?: string;
    composeResetPasswordEmailView: import('../views/composeResetPasswordEmail.js').ComposeResetPasswordEmail;
    composeActivationEmailView: import('../views/composeActivationEmail.js').ComposeActivationEmail;
    composePurchaseReceiptEmailView?: import('../views/composePurchaseReceiptEmail.js').ComposePurchaseReceiptEmail;
};
export type Internationalizer = import('intl-dom').I18NCallback<string>;
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
declare class EmailDispatcher {
    #private;
    NL_SITE_URL: string;
    NL_EMAIL_FROM: string;
    NL_RESEND_FROM: string | undefined;
    composeResetPasswordEmailView: import("../views/composeResetPasswordEmail.js").ComposeResetPasswordEmail;
    composeActivationEmailView: import("../views/composeActivationEmail.js").ComposeActivationEmail;
    composePurchaseReceiptEmailView: import("../views/composePurchaseReceiptEmail.js").ComposePurchaseReceiptEmail;
    resend: Resend | undefined;
    smtpClient: SMTPClient | undefined;
    /**
     * Sets up config and connects to server.
     * @param {EmailDispatcherConfig} config
     */
    constructor(config: EmailDispatcherConfig);
    /**
     * @param {UserAccountInfo} account
     * @param {FromEmailConfig} cfg
     * @param {Internationalizer} _
     * @param {import('./i18n.js').LanguageDirection} langDir
     * @returns {Promise<import('emailjs').Message|
     *   import('emailjs').MessageHeaders|
     *   import('resend').CreateEmailResponseSuccess|null>}
     */
    dispatchResetPasswordLink(account: UserAccountInfo, cfg: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): Promise<import('emailjs').Message | import('emailjs').MessageHeaders | import('resend').CreateEmailResponseSuccess | null>;
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
    composeResetPasswordEmail({ name, user, passKey }: UserAccountInfo, { fromText, fromURL }: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): EmailInfo[];
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
    dispatchActivationLink(account: Partial<import('./account-manager.js').AccountInfo> & {
        name: string;
        user: string;
        activationCode: string;
    }, cfg: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): Promise<import('emailjs').Message | import('emailjs').MessageHeaders | import('resend').CreateEmailResponseSuccess | null>;
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
    composeActivationEmail({ name, user, activationCode }: Partial<import('./account-manager.js').AccountInfo> & {
        name: string;
        user: string;
        activationCode: string;
    }, { fromText, fromURL }: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): EmailInfo[];
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
    dispatchPurchaseReceipt(account: {
        name: string;
        email: string;
    }, offer: import('./offer-manager.js').OfferInfo, cfg: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): Promise<import('emailjs').Message | import('emailjs').MessageHeaders | import('resend').CreateEmailResponseSuccess | null>;
    /**
     * @param {{name: string}} account
     * @param {import('./offer-manager.js').OfferInfo} offer
     * @param {FromEmailConfig} cfg
     * @param {Internationalizer} _
     * @param {import('./i18n.js').LanguageDirection} langDir
     * @returns {EmailInfo[]}
     */
    composePurchaseReceiptEmail({ name }: {
        name: string;
    }, offer: import('./offer-manager.js').OfferInfo, { fromText, fromURL }: FromEmailConfig, _: Internationalizer, langDir: import('./i18n.js').LanguageDirection): EmailInfo[];
}
export default EmailDispatcher;
//# sourceMappingURL=email-dispatcher.d.ts.map
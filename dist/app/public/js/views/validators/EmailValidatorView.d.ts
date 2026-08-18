export type EmailInfoElements = {
    name: JQuery;
    email: JQuery;
    user: JQuery;
    pass: JQuery;
};
/**
 * @typedef {object} EmailInfoElements
 * @property {JQuery} name
 * @property {JQuery} email
 * @property {JQuery} user
 * @property {JQuery} pass
 */
declare const EmailValidatorView: {
    /**
     * @returns {{
     *   retrievePasswordModal: JQuery,
     *   retrievePasswordAlert: JQuery,
     *   retrievePasswordForm: JQuery & {
     *     resetForm: () => void
     *   }
     * }}
     */
    getFormFields(): {
        retrievePasswordModal: JQuery;
        retrievePasswordAlert: JQuery;
        retrievePasswordForm: JQuery & {
            resetForm: () => void;
        };
    };
    /**
     * @param {string} msg
     */
    addSuccess(msg: string): void;
    messages: {
        PleaseEnterValidEmailAddress: string;
    };
};
export default EmailValidatorView;
//# sourceMappingURL=EmailValidatorView.d.ts.map
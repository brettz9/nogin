export default EmailValidatorView;
export type EmailInfoElements = {
    name: JQuery;
    email: JQuery;
    user: JQuery;
    pass: JQuery;
};
declare namespace EmailValidatorView {
    /**
     * @returns {{
     *   retrievePasswordModal: JQuery,
     *   retrievePasswordAlert: JQuery,
     *   retrievePasswordForm: JQuery & {
     *     resetForm: () => void
     *   }
     * }}
     */
    function getFormFields(): {
        retrievePasswordModal: JQuery<HTMLElement>;
        retrievePasswordAlert: JQuery<HTMLElement>;
        retrievePasswordForm: JQuery<HTMLElement> & {
            resetForm: () => void;
        };
    };
    /**
     * @param {string} msg
     */
    function addSuccess(msg: string): void;
    namespace messages {
        const PleaseEnterValidEmailAddress: string;
    }
}
//# sourceMappingURL=EmailValidatorView.d.ts.map
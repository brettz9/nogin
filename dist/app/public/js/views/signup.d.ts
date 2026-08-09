declare const SignupView: {
    /**
     * @returns {JQuery}
     */
    getName(): JQuery;
    /**
     * @returns {JQuery}
     */
    getAccountForm(): JQuery;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setConfirmSignup(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} accountCreatedAlertDialog `HTMLDivElement`
     * @returns {JQuery} `HTMLFormElement`
     */
    getAccountCreatedOkButton(accountCreatedAlertDialog: JQuery): JQuery;
    /**
     * @param {JQuery} accountForm `HTMLFormElement`
     * @returns {JQuery}
     */
    getActionForAccountForm(accountForm: JQuery): JQuery;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    setAccountSettings(): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    accountCreated(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"DispatchActivationLinkError"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedErrorAlert({ type }: {
        type: "DispatchActivationLinkError";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
};
export default SignupView;
//# sourceMappingURL=signup.d.ts.map
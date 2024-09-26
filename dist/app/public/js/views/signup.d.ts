export default SignupView;
declare namespace SignupView {
    /**
     * @returns {JQuery}
     */
    function getName(): JQuery;
    /**
     * @returns {JQuery}
     */
    function getAccountForm(): JQuery;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setConfirmSignup(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} accountCreatedAlertDialog `HTMLDivElement`
     * @returns {JQuery} `HTMLFormElement`
     */
    function getAccountCreatedOkButton(accountCreatedAlertDialog: JQuery): JQuery;
    /**
     * @param {JQuery} accountForm `HTMLFormElement`
     * @returns {JQuery}
     */
    function getActionForAccountForm(accountForm: JQuery): JQuery;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function setAccountSettings(): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function accountCreated(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"DispatchActivationLinkError"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedErrorAlert({ type }: {
        type: "DispatchActivationLinkError";
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
}
//# sourceMappingURL=signup.d.ts.map
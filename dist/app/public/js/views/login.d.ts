declare const LoginView: {
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getInputForInitialFocus(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getLoginModal(): JQuery;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    retrievePasswordModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    retrievePasswordForm(retrievePasswordModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm
     * } `HTMLFormElement`
     */
    getLoginForm(): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    retrievePasswordSubmit(retrievePasswordModal: JQuery): JQuery;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    retrievePasswordCancel(retrievePasswordModal: JQuery): JQuery;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLInputElement`
     */
    retrieveLostPasswordEmail(retrievePasswordModal: JQuery): JQuery;
    /**
     * @param {JQuery} loginModal `HTMLDivElement`
     * @returns {JQuery} `HTMLInputElement`
     */
    getLostPasswordUsername(loginModal: JQuery): JQuery;
    /**
     * @param {JQuery} loginModal
     * @returns {JQuery} `HTMLDivElement`
     */
    getForgotPassword(loginModal: JQuery): JQuery;
    /**
     * @param {JQuery} loginModal
     * @returns {JQuery} `HTMLButtonElement`
     */
    getRememberMeButton(loginModal: JQuery): JQuery;
    /**
     * @param {JQuery} loginModal
     * @returns {boolean}
     */
    isRememberMeChecked(loginModal: JQuery): boolean;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery}
     */
    setRetrievePasswordCancel(retrievePasswordModal: JQuery): JQuery;
    /**
     * @param {JQuery} loginModal
     * @returns {void}
     */
    toggleCheckSquare(loginModal: JQuery): void;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {void}
     */
    switchConfirmToAlert(retrievePasswordModal: JQuery): void;
};
export default LoginView;
//# sourceMappingURL=login.d.ts.map
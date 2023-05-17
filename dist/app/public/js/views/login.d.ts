export default LoginView;
declare namespace LoginView {
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getInputForInitialFocus(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getLoginModal(): JQuery<HTMLElement>;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function retrievePasswordModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function retrievePasswordForm(retrievePasswordModal: JQuery<HTMLElement>): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm
     * } `HTMLFormElement`
     */
    function getLoginForm(): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function retrievePasswordSubmit(retrievePasswordModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function retrievePasswordCancel(retrievePasswordModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {JQuery} `HTMLInputElement`
     */
    function retrieveLostPasswordEmail(retrievePasswordModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} loginModal `HTMLDivElement`
     * @returns {JQuery} `HTMLInputElement`
     */
    function getLostPasswordUsername(loginModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} loginModal
     * @returns {JQuery} `HTMLDivElement`
     */
    function getForgotPassword(loginModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
    * @param {JQuery} loginModal
    * @returns {JQuery} `HTMLButtonElement`
    */
    function getRememberMeButton(loginModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
    * @param {JQuery} loginModal
    * @returns {boolean}
    */
    function isRememberMeChecked(loginModal: JQuery<HTMLElement>): boolean;
    /**
    * @param {JQuery} retrievePasswordModal `HTMLDivElement`
    * @returns {JQuery}
    */
    function setRetrievePasswordCancel(retrievePasswordModal: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
    * @param {JQuery} loginModal
    * @returns {void}
    */
    function toggleCheckSquare(loginModal: JQuery<HTMLElement>): void;
    /**
     * @param {JQuery} retrievePasswordModal `HTMLDivElement`
     * @returns {void}
     */
    function switchConfirmToAlert(retrievePasswordModal: JQuery<HTMLElement>): void;
}
//# sourceMappingURL=login.d.ts.map
export default HomeView;
declare namespace HomeView {
    /**
     * @returns {JQuery}
     */
    function getLogoutButton(): JQuery;
    /**
     * @returns {JQuery}
     */
    function getName(): JQuery;
    /**
     * @returns {JQuery}
     */
    function getEmail(): JQuery;
    /**
     * @param {JQuery} accountForm
     * @returns {JQuery}
     */
    function getDeleteAccountAction(accountForm: JQuery): JQuery;
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @param {JQuery} accountUpdatedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getAccountUpdatedButton(accountUpdatedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery}
     */
    function getUser(): JQuery;
    /**
     * @param {object} cfg
     * @param {"AppearsChangingEmail"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
    */
    function onShowConfirmation({ type }: {
        type: "AppearsChangingEmail";
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setDeleteAccount(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function setAccountSettings(): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onAccountUpdated(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onAccountUpdatedButNotYetEmail(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"accountDeleted"|"loggedOut"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedAlert({ type }: {
        type: "accountDeleted" | "loggedOut";
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedErrorAlert({ type, message }: {
        message?: string | undefined;
        type?: "ErrorLoggingOut" | "SessionLost" | "ProblemDispatchingLink" | "FailureSubmittingUserInfo" | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
}
//# sourceMappingURL=home.d.ts.map
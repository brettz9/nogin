export default HomeView;
declare namespace HomeView {
    /**
     * @returns {JQuery}
     */
    function getLogoutButton(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery}
     */
    function getName(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery}
     */
    function getEmail(): JQuery<HTMLElement>;
    /**
     * @param {JQuery} accountForm
     * @returns {JQuery}
     */
    function getDeleteAccountAction(accountForm: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(lockedAlertDialog: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @param {JQuery} accountUpdatedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getAccountUpdatedButton(accountUpdatedAlertDialog: JQuery<HTMLElement>): JQuery<HTMLElement>;
    /**
     * @returns {JQuery}
     */
    function getUser(): JQuery<HTMLElement>;
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
        type?: "ErrorLoggingOut" | "FailureSubmittingUserInfo" | "SessionLost" | "ProblemDispatchingLink" | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
}
//# sourceMappingURL=home.d.ts.map
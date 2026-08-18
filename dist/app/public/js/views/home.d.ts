declare const HomeView: {
    /**
     * @returns {JQuery}
     */
    getLogoutButton(): JQuery;
    /**
     * @returns {JQuery}
     */
    getName(): JQuery;
    /**
     * @returns {JQuery}
     */
    getEmail(): JQuery;
    /**
     * @param {JQuery} accountForm
     * @returns {JQuery}
     */
    getDeleteAccountAction(accountForm: JQuery): JQuery;
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @param {JQuery} accountUpdatedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getAccountUpdatedButton(accountUpdatedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery}
     */
    getUser(): JQuery;
    /**
     * @param {object} cfg
     * @param {"AppearsChangingEmail"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowConfirmation({ type }: {
        type: "AppearsChangingEmail";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setDeleteAccount(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    setAccountSettings(): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onAccountUpdated(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onAccountUpdatedButNotYetEmail(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"accountDeleted"|"loggedOut"} cfg.type
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedAlert({ type }: {
        type: "accountDeleted" | "loggedOut";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedErrorAlert({ type, message }: {
        message?: string;
        type?: "ErrorLoggingOut" | "FailureSubmittingUserInfo" | "SessionLost" | "ProblemDispatchingLink";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
};
export default HomeView;
//# sourceMappingURL=home.d.ts.map
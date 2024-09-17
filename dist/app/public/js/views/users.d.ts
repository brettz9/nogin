export default UsersView;
declare namespace UsersView {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getDeleteAccounts(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getDeleteAllAccounts(): JQuery<HTMLElement>;
    /**
     * @param {{user: string}} info
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setDeleteAccount(info: {
        user: string;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function setDeleteAllAccounts(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"userAccountDeleted"|"allUserAccountsDeleted"} cfg.type
     * @param {string} [cfg.user]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedAlert({ type, user }: {
        type: "userAccountDeleted" | "allUserAccountsDeleted";
        user?: string | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.user
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedErrorAlert({ type, user, message }: {
        user: string;
        message?: string | undefined;
        type?: "ErrorLoggingOut" | "SessionLost" | "ProblemDispatchingLink" | "FailureSubmittingUserInfo" | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
}
//# sourceMappingURL=users.d.ts.map
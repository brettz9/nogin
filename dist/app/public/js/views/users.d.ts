declare const UsersView: {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getDeleteAccounts(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getDeleteAllAccounts(): JQuery<HTMLElement>;
    /**
     * @param {{user: string}} info
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setDeleteAccount(info: {
        user: string;
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setDeleteAllAccounts(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"userAccountDeleted"|"allUserAccountsDeleted"} cfg.type
     * @param {string} [cfg.user]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedAlert({ type, user }: {
        type: "userAccountDeleted" | "allUserAccountsDeleted";
        user?: string;
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.user
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedErrorAlert({ type, user, message }: {
        user: string;
        message?: string;
        type?: "ErrorLoggingOut" | "FailureSubmittingUserInfo" | "SessionLost" | "ProblemDispatchingLink";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
};
export default UsersView;
//# sourceMappingURL=users.d.ts.map
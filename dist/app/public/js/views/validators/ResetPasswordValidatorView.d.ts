declare const ResetPasswordValidatorView: {
    /**
     * @returns {import('../utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setPasswordDialog(): import('../utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getSetPasswordAlert(): JQuery;
    /**
     * @param {JQuery} alertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getLockedAlertButton(alertDialog: JQuery): JQuery;
    /**
     * @returns {void}
     */
    showSuccess(): void;
    /**
     * @param {string} msg
     * @returns {void}
     */
    addAlert(msg: string): void;
    /**
     * @param {"bad-session"|undefined} type
     * @returns {import('../utilities/AlertDialog.js').JQueryWithModal|void}
     */
    showDanger(type: "bad-session" | undefined): import('../utilities/AlertDialog.js').JQueryWithModal | void;
    messages: {
        ShouldBeMinimumLength: string | Element;
    };
};
export default ResetPasswordValidatorView;
//# sourceMappingURL=ResetPasswordValidatorView.d.ts.map
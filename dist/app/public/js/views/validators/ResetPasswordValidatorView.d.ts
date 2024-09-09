export default ResetPasswordValidatorView;
declare namespace ResetPasswordValidatorView {
    /**
     * @returns {import('../utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setPasswordDialog(): import("../utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getSetPasswordAlert(): JQuery;
    /**
     * @param {JQuery} alertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(alertDialog: JQuery): JQuery;
    /**
     * @returns {void}
     */
    function showSuccess(): void;
    /**
     * @param {string} msg
     * @returns {void}
     */
    function addAlert(msg: string): void;
    /**
     * @param {"bad-session"|undefined} type
     * @returns {import('../utilities/AlertDialog.js').JQueryWithModal|void}
     */
    function showDanger(type: "bad-session" | undefined): import("../utilities/AlertDialog.js").JQueryWithModal | void;
    namespace messages {
        let ShouldBeMinimumLength: string | Element;
    }
}
//# sourceMappingURL=ResetPasswordValidatorView.d.ts.map
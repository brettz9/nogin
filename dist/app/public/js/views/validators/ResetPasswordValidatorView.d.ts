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
    function getSetPasswordAlert(): JQuery<HTMLElement>;
    /**
     * @param {JQuery} alertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(alertDialog: JQuery<HTMLElement>): JQuery<HTMLElement>;
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
    function showDanger(type: "bad-session" | undefined): void | import("../utilities/AlertDialog.js").JQueryWithModal;
    namespace messages {
        const ShouldBeMinimumLength: string | Element;
    }
}
//# sourceMappingURL=ResetPasswordValidatorView.d.ts.map
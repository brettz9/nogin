/**
 * Resetting password validation.
 */
declare class ResetPasswordValidator {
    modal: import("../views/utilities/AlertDialog.js").JQueryWithModal;
    alert: JQuery<HTMLElement>;
    /**
     * @param {HTMLInputElement} pass Password element
     * @returns {boolean}
     */
    static validatePassword(pass: HTMLInputElement): boolean;
    /**
     * Sets up properties.
     */
    constructor();
    /**
     * @returns {import('../views/utilities/AlertDialog.js').JQueryWithModal}
     */
    getPasswordDialog(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {"bad-session"|undefined} [type]
     * @returns {void}
     */
    showAlert(type?: "bad-session" | undefined): void;
    /**
     * @returns {void}
     */
    hideAlert(): void;
    /**
     * @returns {void}
     */
    showSuccess(): void;
}
export default ResetPasswordValidator;
//# sourceMappingURL=ResetPasswordValidator.d.ts.map
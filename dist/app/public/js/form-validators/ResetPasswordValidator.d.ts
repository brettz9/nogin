export default ResetPasswordValidator;
/**
 * Resetting password validation.
 */
declare class ResetPasswordValidator {
    /**
     * @param {HTMLInputElement} pass Password element
     * @returns {boolean}
     */
    static validatePassword(pass: HTMLInputElement): boolean;
    modal: import("../views/utilities/AlertDialog.js").JQueryWithModal;
    alert: JQuery<HTMLElement>;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').JQueryWithModal}
     */
    getPasswordDialog(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
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
//# sourceMappingURL=ResetPasswordValidator.d.ts.map
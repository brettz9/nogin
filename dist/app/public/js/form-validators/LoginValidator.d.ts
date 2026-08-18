/**
 * Login validation.
 */
declare const LoginValidator: {
    /**
     * @returns {boolean}
     */
    validateForm(): boolean;
    /**
     * Bind a simple alert window to this controller to display any errors.
     * @param {"MismatchUserDataFormat"} [msg]
     * @returns {void}
     */
    showLoginError(msg?: "MismatchUserDataFormat"): void;
};
export default LoginValidator;
//# sourceMappingURL=LoginValidator.d.ts.map
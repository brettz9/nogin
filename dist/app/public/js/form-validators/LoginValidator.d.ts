export default LoginValidator;
declare namespace LoginValidator {
    /**
     * @returns {boolean}
     */
    function validateForm(): boolean;
    /**
    * Bind a simple alert window to this controller to display any errors.
    * @param {"MismatchUserDataFormat"} [msg]
    * @returns {void}
    */
    function showLoginError(msg?: "MismatchUserDataFormat" | undefined): void;
}
//# sourceMappingURL=LoginValidator.d.ts.map
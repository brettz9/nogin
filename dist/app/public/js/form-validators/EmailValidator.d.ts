export default EmailValidator;
/**
 * Validator for email addresses.
 */
declare const EmailValidator: {
    new (): {
        retrievePasswordAlert: JQuery<HTMLElement>;
        /**
         * @param {string} msg The message
         * @returns {void}
         */
        showEmailAlert(msg: string): void;
        /**
         * @returns {void}
         */
        hideEmailAlert(): void;
        /**
         * @param {string} msg The message
         * @returns {void}
         */
        showEmailSuccess(msg: string): void;
    };
    /**
     * @param {HTMLInputElement} input Email input element
     * @returns {boolean} Whether valid
     */
    validateEmail(input: HTMLInputElement): boolean;
};
//# sourceMappingURL=EmailValidator.d.ts.map
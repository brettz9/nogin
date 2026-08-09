/**
 * Ensures accounts are valid.
 */
declare class AccountValidator {
    signup: boolean | undefined;
    form: HTMLFormElement;
    formFields: import("../views/validators/AccountValidatorView.js").AccountInfoElements;
    userId: JQuery<HTMLElement>;
    errorMessages: {
        [key: string]: {
            [key: string]: string;
        };
    };
    /**
     * @param {string} s
     * @returns {boolean}
     */
    userIsLoggedIn: (s: string) => boolean;
    /**
     * Sets up properties and methods.
     * @param {object} [cfg]
     * @param {boolean} [cfg.signup]
     */
    constructor({ signup }?: {
        signup?: boolean;
    });
    /**
     * @returns {void}
     */
    showInvalidEmail(): void;
    /**
     * @returns {void}
     */
    showInvalidUserName(): void;
    /**
     * @returns {boolean}
     */
    validateForm(): boolean;
}
export default AccountValidator;
//# sourceMappingURL=AccountValidator.d.ts.map
export type AccountInfoElements = {
    name: HTMLInputElement;
    email: HTMLInputElement;
    user: HTMLInputElement;
    pass: HTMLInputElement;
    passConfirm: HTMLInputElement;
};
/**
 * @typedef {object} AccountInfoElements
 * @property {HTMLInputElement} name
 * @property {HTMLInputElement} email
 * @property {HTMLInputElement} user
 * @property {HTMLInputElement} pass
 * @property {HTMLInputElement} passConfirm
 */
declare const AccountValidatorView: {
    /**
     * @returns {HTMLFormElement}
     */
    getForm(): HTMLFormElement;
    /**
     * @returns {JQuery}
     */
    getUserId(): JQuery;
    /**
     * @returns {AccountInfoElements}
     */
    getFormFields(): AccountInfoElements;
    /**
     * @type {{[key: string]: {[key: string]: string}}}
     */
    errorMessages: {
        [key: string]: {
            [key: string]: string;
        };
    };
};
export default AccountValidatorView;
//# sourceMappingURL=AccountValidatorView.d.ts.map
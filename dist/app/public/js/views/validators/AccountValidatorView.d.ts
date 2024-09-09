export default AccountValidatorView;
export type AccountInfoElements = {
    name: HTMLInputElement;
    email: HTMLInputElement;
    user: HTMLInputElement;
    pass: HTMLInputElement;
    passConfirm: HTMLInputElement;
};
declare namespace AccountValidatorView {
    /**
     * @returns {HTMLFormElement}
     */
    function getForm(): HTMLFormElement;
    /**
     * @returns {JQuery}
     */
    function getUserId(): JQuery;
    /**
     * @returns {AccountInfoElements}
     */
    function getFormFields(): AccountInfoElements;
    let errorMessages: {
        [x: string]: {
            [x: string]: string;
        };
    };
}
//# sourceMappingURL=AccountValidatorView.d.ts.map
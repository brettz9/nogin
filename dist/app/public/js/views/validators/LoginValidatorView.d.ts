export type LoginInfoElements = {
    user: HTMLInputElement;
    pass: HTMLInputElement;
};
/**
* @typedef {object} LoginInfoElements
* @property {HTMLInputElement} user
* @property {HTMLInputElement} pass
*/
declare const LoginValidatorView: {
    /**
     * @returns {LoginInfoElements}
     */
    getFormFields(): LoginInfoElements;
    errorMessages: {
        PleaseEnterValidUserName: string;
        PleaseEnterValidPassword: string;
        LoginFailure: string;
        PleaseCheckYourUserNameOrPassword: string;
        MismatchUserDataFormat: string;
    };
    messages: {
        LinkToResetPasswordMailed: string | Element;
        EmailNotFound: string | Element;
        ProblemTryAgainLater: string | Element;
    };
};
export default LoginValidatorView;
//# sourceMappingURL=LoginValidatorView.d.ts.map
export default LoginValidatorView;
export type LoginInfoElements = {
    user: HTMLInputElement;
    pass: HTMLInputElement;
};
declare namespace LoginValidatorView {
    /**
     * @returns {LoginInfoElements}
     */
    function getFormFields(): LoginInfoElements;
    namespace errorMessages {
        let PleaseEnterValidUserName: string;
        let PleaseEnterValidPassword: string;
        let LoginFailure: string;
        let PleaseCheckYourUserNameOrPassword: string;
        let MismatchUserDataFormat: string;
    }
    namespace messages {
        let LinkToResetPasswordMailed: string | Element;
        let EmailNotFound: string | Element;
        let ProblemTryAgainLater: string | Element;
    }
}
//# sourceMappingURL=LoginValidatorView.d.ts.map
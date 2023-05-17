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
        const PleaseEnterValidUserName: string;
        const PleaseEnterValidPassword: string;
        const LoginFailure: string;
        const PleaseCheckYourUserNameOrPassword: string;
        const MismatchUserDataFormat: string;
    }
    namespace messages {
        const LinkToResetPasswordMailed: string | Element;
        const EmailNotFound: string | Element;
        const ProblemTryAgainLater: string | Element;
    }
}
//# sourceMappingURL=LoginValidatorView.d.ts.map
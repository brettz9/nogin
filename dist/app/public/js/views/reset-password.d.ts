export default ResetPasswordView;
declare namespace ResetPasswordView {
    /**
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function getSetPasswordForm(): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @returns {JQuery} `HTMLInputElement`
     */
    function getPassword(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getSetPasswordSubmit(): JQuery<HTMLElement>;
}
//# sourceMappingURL=reset-password.d.ts.map
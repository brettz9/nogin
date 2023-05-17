/* globals $ */

const ResetPasswordView = {
  /**
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  getSetPasswordForm () {
    return (
      /**
       * @type {import('../utilities/ajaxFormClientSideValidate.js').
       *   JQueryWithAjaxForm}
       */ ($('#set-password-form'))
    );
  },

  /**
   * @returns {JQuery} `HTMLInputElement`
   */
  getPassword () {
    return $('[data-name="reset-pass"]');
  },

  /**
   * @returns {JQuery} `HTMLButtonElement`
   */
  getSetPasswordSubmit () {
    return $('[data-name="reset-password-submit"]');
  }
};

export default ResetPasswordView;

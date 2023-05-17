/* globals $, Nogin */

/**
* @typedef {object} EmailInfoElements
* @property {JQuery} name
* @property {JQuery} email
* @property {JQuery} user
* @property {JQuery} pass
*/

const EmailValidatorView = {
  /**
   * @returns {{
   *   retrievePasswordModal: JQuery,
   *   retrievePasswordAlert: JQuery,
   *   retrievePasswordForm: JQuery & {
   *     resetForm: () => void
   *   }
   * }}
   */
  getFormFields () {
    return {
      retrievePasswordModal: $('#retrieve-password'),
      retrievePasswordAlert: $('#retrieve-password [data-name=alert]'),
      retrievePasswordForm:
      /**
       * @type {JQuery & {
       *   resetForm: () => void
       * }}
       */ ($('#retrieve-password #retrieve-password-form'))
    };
  },

  /**
   * @param {string} msg
   */
  addSuccess (msg) {
    const {retrievePasswordAlert} = this.getFormFields();
    retrievePasswordAlert.attr('class', 'alert alert-success');
    retrievePasswordAlert.text(msg);
  },

  messages: {
    PleaseEnterValidEmailAddress: /** @type {string} */ (
      Nogin._('PleaseEnterValidEmailAddress')
    )
  }
};

export default EmailValidatorView;

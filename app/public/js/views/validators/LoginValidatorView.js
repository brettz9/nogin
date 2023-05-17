/* globals $, Nogin */

const {_} = Nogin;

/**
* @typedef {object} LoginInfoElements
* @property {HTMLInputElement} user
* @property {HTMLInputElement} pass
*/

const LoginValidatorView = {
  /**
   * @returns {LoginInfoElements}
   */
  getFormFields () {
    return {
      user: /** @type {HTMLInputElement} */ ($('[data-name="user"]')[0]),
      pass: /** @type {HTMLInputElement} */ ($('[data-name="pass"]')[0])
    };
  },

  errorMessages: {
    PleaseEnterValidUserName: /** @type {string} */ (
      _('PleaseEnterValidUserName')
    ),
    PleaseEnterValidPassword: /** @type {string} */ (
      _('PleaseEnterValidPassword')
    ),
    LoginFailure: /** @type {string} */ (_('LoginFailure')),
    PleaseCheckYourUserNameOrPassword: /** @type {string} */ (
      _('PleaseCheckYourUserNameOrPassword')
    ),
    MismatchUserDataFormat: /** @type {string} */ (_('MismatchUserDataFormat'))
  },

  messages: {
    LinkToResetPasswordMailed: _('LinkToResetPasswordMailed'),
    EmailNotFound: _('EmailNotFound'),
    ProblemTryAgainLater: _('ProblemTryAgainLater')
  }
};

export default LoginValidatorView;

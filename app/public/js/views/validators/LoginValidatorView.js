/* globals $, Nogin */

const {_} = Nogin;

/**
* @typedef {PlainObject} LoginInfoElements
* @property {external:jQuery} name
* @property {external:jQuery} pass
*/

const LoginValidatorView = {
  /**
   * @returns {LoginInfoElements}
   */
  getFormFields () {
    return {
      user: $('[data-name="user"]')[0],
      pass: $('[data-name="pass"]')[0]
    };
  },

  errorMessages: {
    PleaseEnterValidUserName: _('PleaseEnterValidUserName'),
    PleaseEnterValidPassword: _('PleaseEnterValidPassword'),
    LoginFailure: _('LoginFailure'),
    PleaseCheckYourUserNameOrPassword: _('PleaseCheckYourUserNameOrPassword'),
    MismatchUserDataFormat: _('MismatchUserDataFormat')
  },

  messages: {
    LinkToResetPasswordMailed: _('LinkToResetPasswordMailed'),
    EmailNotFound: _('EmailNotFound'),
    ProblemTryAgainLater: _('ProblemTryAgainLater')
  }
};

export default LoginValidatorView;

/* globals LoginValidatorView, AlertDialog */
'use strict';

const {user, pass} = LoginValidatorView.getFormFields();

/**
 * Login validation.
 */
window.LoginValidator = class LoginValidator {
  /**
   * @returns {boolean}
   */
  static validateForm () {
    [user, pass].forEach((field) => {
      field.setCustomValidity('');
    });
    if (user.validity.valueMissing) {
      user.setCustomValidity(
        LoginValidatorView.errorMessages.PleaseEnterValidUserName
      );
      user.form.reportValidity();
      return false;
    }
    if (pass.validity.valueMissing) {
      pass.setCustomValidity(
        LoginValidatorView.errorMessages.PleaseEnterValidPassword
      );
      pass.form.reportValidity();
      return false;
    }
    return true;
  }

  /**
  * Bind a simple alert window to this controller to display any errors.
  * @returns {void}
  */
  static showLoginError () {
    const loginErrors = AlertDialog.populate({
      heading: LoginValidatorView.errorMessages.LoginFailure,
      body: LoginValidatorView.errorMessages.PleaseCheckYourUserNameOrPassword,
      keyboard: true,
      backdrop: true
    });
    loginErrors.modal('show');
  }
};

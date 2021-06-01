import AlertDialog from '../views/utilities/AlertDialog.js';
import LoginValidatorView from '../views/validators/LoginValidatorView.js';

const {user, pass} = LoginValidatorView.getFormFields();

/**
 * Login validation.
 */
const LoginValidator = {
  /**
   * @returns {boolean}
   */
  validateForm () {
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
  },

  /**
  * Bind a simple alert window to this controller to display any errors.
  * @param {string} msg
  * @returns {void}
  */
  showLoginError (msg) {
    const loginErrors = AlertDialog.populate({
      heading: LoginValidatorView.errorMessages.LoginFailure,
      body: msg
        ? LoginValidatorView.errorMessages[msg]
        : LoginValidatorView.errorMessages.PleaseCheckYourUserNameOrPassword,
      keyboard: true,
      backdrop: true
    });
    loginErrors.modal('show');
  }
};

export default LoginValidator;

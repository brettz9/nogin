/* globals Nogin */
import ResetPasswordValidatorView from
  '../views/validators/ResetPasswordValidatorView.js';

/**
 * Resetting password validation.
 */
class ResetPasswordValidator {
  /**
   * @param {external:jQuery} pass Password element
   * @returns {boolean}
   */
  static validatePassword (pass) {
    pass.setCustomValidity('');
    // todo[cypress@>9.0.0]: validity: remove this disabling of istanbul
    //   to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (pass.validity.tooShort) {
      pass.setCustomValidity(
        ResetPasswordValidatorView.messages.ShouldBeMinimumLength
      );
    }
    return pass.form.reportValidity();
  }

  /**
   * Sets up properties.
   */
  constructor () {
    this.modal = ResetPasswordValidatorView.setPasswordDialog();
    this.alert = ResetPasswordValidatorView.getSetPasswordAlert();
    this.alert.hide();
  }

  /**
   * @returns {external:jQuery}
   */
  getPasswordDialog () {
    return this.modal;
  }

  /**
   * @param {"bad-session"|undefined} type
   * @returns {void}
   */
  showAlert (type) {
    const alertDialog = ResetPasswordValidatorView.showDanger(type);
    if (alertDialog) {
      alertDialog.modal('show');
      const redirectToRoot = () => {
        Nogin.redirect('root');
      };
      ResetPasswordValidatorView.getLockedAlertButton(alertDialog).click(
        redirectToRoot
      );
      setTimeout(redirectToRoot, 3000);
      return;
    }

    this.alert.show();
  }

  /**
   * @returns {void}
   */
  hideAlert () {
    this.alert.hide();
  }

  /**
   * @returns {void}
   */
  showSuccess () {
    ResetPasswordValidatorView.showSuccess();
    this.alert.fadeIn(500);
  }
}

export default ResetPasswordValidator;

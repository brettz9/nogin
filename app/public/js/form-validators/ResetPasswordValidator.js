/* globals Nogin -- Server-set */
import ResetPasswordValidatorView from
  '../views/validators/ResetPasswordValidatorView.js';

const tooShort = 6;

/**
 * Resetting password validation.
 */
class ResetPasswordValidator {
  /**
   * @param {HTMLInputElement} pass Password element
   * @returns {boolean}
   */
  static validatePassword (pass) {
    pass.setCustomValidity('');
    // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
    //   see https://github.com/cypress-io/cypress/issues/6678
    // if (pass.validity.tooShort) {
    if (pass.value.length < tooShort) {
      pass.setCustomValidity(
        /** @type {string} */ (
          ResetPasswordValidatorView.messages.ShouldBeMinimumLength
        )
      );
    }
    return /** @type {HTMLFormElement} */ (pass.form).reportValidity();
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
   * @returns {import('../views/utilities/AlertDialog.js').JQueryWithModal}
   */
  getPasswordDialog () {
    return this.modal;
  }

  /**
   * @param {"bad-session"|undefined} [type]
   * @returns {void}
   */
  showAlert (type) {
    const alertDialog = ResetPasswordValidatorView.showDanger(type);
    if (alertDialog) {
      alertDialog.modal('show');
      const redirectToRoot = () => {
        Nogin.redirect('root');
      };
      ResetPasswordValidatorView.getLockedAlertButton(alertDialog).on(
        'click',
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

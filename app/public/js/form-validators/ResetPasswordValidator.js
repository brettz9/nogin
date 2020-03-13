/* globals ResetPasswordValidatorView */
'use strict';

/**
 * Resetting password validation.
 */
window.ResetPasswordValidator = class ResetPasswordValidator {
  /**
   * @param {external:jQuery} pass Password element
   * @returns {boolean}
   */
  static validatePassword (pass) {
    pass.setCustomValidity('');
    // Todo[cypress@>4.1.0]: Remove this disabling of istanbul to see if fixed
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
   * @returns {void}
   */
  showAlert () {
    ResetPasswordValidatorView.showDanger();
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
};

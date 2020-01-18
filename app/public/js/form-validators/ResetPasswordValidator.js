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
    pass.setCustomValidity(
      ResetPasswordValidatorView.messages.ShouldBeMinimumLength
    );
    return pass[0].form.reportValidity();
  }

  /**
   * Sets up properties.
   */
  constructor () {
    ResetPasswordValidatorView.setPasswordDialog();
    this.alert = ResetPasswordValidatorView.getSetPasswordAlert();
    this.alert.hide();
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

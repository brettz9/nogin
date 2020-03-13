/* globals AccountValidatorView */
'use strict';

/**
 * Ensures accounts are valid.
 */
window.AccountValidator = class AccountValidator {
  /**
   * Sets up properties and methods.
   * @param {PlainObject} cfg
   * @param {boolean} cfg.signup
   */
  constructor ({signup} = {}) {
    // build array maps of the form inputs & control groups
    this.signup = signup;

    this.form = AccountValidatorView.getForm();
    this.formFields = AccountValidatorView.getFormFields();
    this.userId = AccountValidatorView.getUserId();
    this.errorMessages = AccountValidatorView.errorMessages;

    this.userIsLoggedIn = (s) => {
      // if user is logged in and hasn't changed their password, return ok
      return this.userId.val() && s === '';
    };
  }

  /**
   * @returns {void}
   */
  showInvalidEmail () {
    this.formFields.email.setCustomValidity(
      this.errorMessages.email.emailAddressAlreadyInUse
    );
    this.form.reportValidity();
  }

  /**
   * @returns {void}
   */
  showInvalidUserName () {
    this.formFields.user.setCustomValidity(
      this.errorMessages.user.userNameAlreadyInUse
    );
    this.form.reportValidity();
  }

  /**
   * @returns {boolean}
   */
  validateForm () {
    const {name, email, user, pass, passConfirm} = this.formFields;
    Object.values(this.formFields).forEach((field) => {
      if (field) {
        field.setCustomValidity('');
      }
    });
    // Todo[cypress@>4.1.0]: Remove this disabling of istanbul to see if fixed
    // istanbul ignore if
    if (name.validity.tooShort) {
      name.setCustomValidity(this.errorMessages.name.PleaseEnterName);
    }
    // Todo[cypress@>4.1.0]: Remove this disabling of istanbul to see if fixed
    // istanbul ignore if
    if (email.validity.patternMismatch) {
      email.setCustomValidity(this.errorMessages.email.PleaseEnterValidEmail);
    }
    // Todo[cypress@>4.1.0]: Remove this disabling of istanbul to see if fixed
    // istanbul ignore if
    if (user.validity.tooShort) {
      user.setCustomValidity(this.errorMessages.user.PleaseChooseUserName);
    }
    // Todo[cypress@>4.1.0]: Remove this disabling of istanbul to see if fixed
    // istanbul ignore if
    if (!this.userIsLoggedIn() && pass.validity.tooShort) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordMinimumLength);
    }
    if (this.signup && pass.value !== passConfirm.value) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordsDontMatch);
    }
    return this.form.reportValidity();
  }
};

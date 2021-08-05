import AccountValidatorView from '../views/validators/AccountValidatorView.js';

/**
 * Ensures accounts are valid.
 */
class AccountValidator {
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
    // todo[cypress@>9.0.0]: validity: remove this disabling of istanbul
    //  to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (name.validity.tooShort) {
      name.setCustomValidity(this.errorMessages.name.PleaseEnterName);
    }
    // todo[cypress@>9.0.0]: validity: remove this disabling of istanbul
    //   to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (email.validity.patternMismatch) {
      email.setCustomValidity(this.errorMessages.email.PleaseEnterValidEmail);
    }
    // todo[cypress@>9.0.0]: validity: remove this disabling of istanbul
    //   to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (user.validity.tooShort) {
      user.setCustomValidity(this.errorMessages.user.PleaseChooseUserName);
    }
    // todo[cypress@>9.0.0]: validity: remove this disabling of istanbul
    //   to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (!this.userIsLoggedIn() && pass.validity.tooShort) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordMinimumLength);
    }
    if (this.signup && pass.value !== passConfirm.value) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordsDontMatch);
    }
    return this.form.reportValidity();
  }
}

export default AccountValidator;

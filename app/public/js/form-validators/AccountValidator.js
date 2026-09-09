import AccountValidatorView from '../views/validators/AccountValidatorView.js';

const tooShort = {
  name: 3,
  user: 3,
  pass: 6
};

/**
 * Ensures accounts are valid.
 */
class AccountValidator {
  /**
   * Sets up properties and methods.
   * @param {object} [cfg]
   * @param {boolean} [cfg.signup]
   */
  constructor ({signup} = {}) {
    // build array maps of the form inputs & control groups
    this.signup = signup;

    this.form = AccountValidatorView.getForm();
    this.formFields = AccountValidatorView.getFormFields();
    this.userId = AccountValidatorView.getUserId();
    this.errorMessages = AccountValidatorView.errorMessages;

    /**
     * @param {string} s
     * @returns {boolean}
     */
    this.userIsLoggedIn = (s) => {
      // if user is logged in and hasn't changed their password, return ok
      return Boolean(this.userId.val()) && s === '';
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
    // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
    //   see https://github.com/cypress-io/cypress/issues/6678
    // if (name.validity.tooShort) {
    if (name.value.length < tooShort.name) {
      name.setCustomValidity(this.errorMessages.name.PleaseEnterName);
    }
    // todo[cypress@>=17.0.0]: validity: remove this disabling of istanbul
    //   to see if fixed
    //   see https://github.com/cypress-io/cypress/issues/6678
    // istanbul ignore if
    if (email.validity.patternMismatch) {
      email.setCustomValidity(this.errorMessages.email.PleaseEnterValidEmail);
    }
    // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
    //   see https://github.com/cypress-io/cypress/issues/6678
    // if (user.validity.tooShort) {
    if (user.value.length < tooShort.user) {
      user.setCustomValidity(this.errorMessages.user.PleaseChooseUserName);
    }
    // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
    //   see https://github.com/cypress-io/cypress/issues/6678
    // if (!this.userIsLoggedIn(pass.value) && pass.validity.tooShort) {
    if (
      !this.userIsLoggedIn(pass.value) &&
      pass.value.length < tooShort.pass
    ) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordMinimumLength);
    }
    if (this.signup && pass.value !== passConfirm.value) {
      pass.setCustomValidity(this.errorMessages.pass.PasswordsDontMatch);
    }
    return this.form.reportValidity();
  }
}

export default AccountValidator;

import EmailValidatorView from '../views/validators/EmailValidatorView.js';

/**
 * Validator for email addresses.
 */
const EmailValidator = class EmailValidator {
  /**
   * @param {HTMLInputElement} input Email input element
   * @returns {boolean} Whether valid
   */
  static validateEmail (input) {
    input.setCustomValidity('');
    if (input.validity.patternMismatch) {
      input.setCustomValidity(
        EmailValidatorView.messages.PleaseEnterValidEmailAddress
      );
    }
    return input.form.reportValidity();
  }

  /**
   * Sets up properties and events.
   */
  constructor () {
    const {
      retrievePasswordModal, retrievePasswordAlert, retrievePasswordForm
    } = EmailValidatorView.getFormFields();

    retrievePasswordModal.on('show.bs.modal', () => {
      retrievePasswordForm.resetForm();
      retrievePasswordAlert.hide();
    });

    this.retrievePasswordAlert = retrievePasswordAlert;
  }

  /**
   * @param {string} msg The message
   * @returns {void}
   */
  showEmailAlert (msg) {
    EmailValidatorView.addSuccess(msg);
    this.retrievePasswordAlert.show();
  }

  /**
   * @returns {void}
   */
  hideEmailAlert () {
    this.retrievePasswordAlert.hide();
  }

  /**
   * @param {string} msg The message
   * @returns {void}
   */
  showEmailSuccess (msg) {
    EmailValidatorView.addSuccess(msg);
    this.retrievePasswordAlert.fadeIn(500);
  }
};

export default EmailValidator;

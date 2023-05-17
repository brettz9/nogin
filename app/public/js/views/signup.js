/* globals $, Nogin */
import AlertDialog from './utilities/AlertDialog.js';
import populateForm from './utilities/populateForm.js';

const {_} = Nogin;

const SignupView = {
  /**
   * @returns {JQuery}
   */
  getName () {
    return $('#name-tf');
  },

  /**
   * @param {JQuery} accountCreatedAlertDialog `HTMLDivElement`
   * @returns {JQuery} `HTMLFormElement`
   */
  getAccountCreatedOkButton (accountCreatedAlertDialog) {
    return accountCreatedAlertDialog.find('[data-name=ok]');
  },

  /**
   * @param {JQuery} accountForm `HTMLFormElement`
   * @returns {JQuery}
   */
  getActionForAccountForm (accountForm) {
    return accountForm.find('[data-name=action1]');
  },

  /**
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  setAccountSettings () {
    // Customize the account signup form
    const accountForm = populateForm('[data-name=account-form]', {
      heading: /** @type {string} */ (_('Signup')),
      subheading: /** @type {string} */ (_('PleaseTellUsAboutYourself')),
      action1: /** @type {string} */ (_('Cancel')),
      action2: /** @type {string} */ (_('Submit'))
    });
    return accountForm;
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  accountCreated () {
    // Setup the alert that displays when an account is successfully created
    return AlertDialog.populate({
      heading: /** @type {string} */ (_('AccountCreatedSignup')),
      body: /** @type {Element} */ (_('PleaseCheckEmailForVerificationLink', {
        lb: $('<br/>')[0]
      })),
      keyboard: false,
      backdrop: 'static'
    });
  },

  /**
   * @param {object} cfg
   * @param {"DispatchActivationLinkError"} cfg.type
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type}) {
    return AlertDialog.populate({
      heading: /** @type {string} */ (_('error')),
      body: /** @type {Element} */ (_(type, {
        lb: $('<br/>')[0]
      })),
      keyboard: false,
      backdrop: 'static'
    });
  }
};

export default SignupView;

/* globals $, Nogin */
import AlertDialog from './utilities/AlertDialog.js';
import populateForm from './utilities/populateForm.js';

const {_} = Nogin;

const SignupView = {
  /**
   * @returns {external:jQuery}
   */
  getName () {
    return $('#name-tf');
  },

  /**
   * @param {external:jQuery} accountCreatedAlertDialog `HTMLDivElement`
   * @returns {external:jQuery} `HTMLFormElement`
   */
  getAccountCreatedOkButton (accountCreatedAlertDialog) {
    return accountCreatedAlertDialog.find('[data-name=ok]');
  },

  /**
   * @param {external:jQuery} accountForm `HTMLFormElement`
   * @returns {external:jQuery}
   */
  getActionForAccountForm (accountForm) {
    return accountForm.find('[data-name=action1]');
  },

  /**
   * @returns {external:jQuery} `HTMLFormElement`
   */
  setAccountSettings () {
    // Customize the account signup form
    const accountForm = populateForm('[data-name=account-form]', {
      heading: _('Signup'),
      subheading: _('PleaseTellUsAboutYourself'),
      action1: _('Cancel'),
      action2: _('Submit')
    });
    return accountForm;
  },

  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  accountCreated () {
    // Setup the alert that displays when an account is successfully created
    return AlertDialog.populate({
      heading: _('AccountCreatedSignup'),
      body: _('PleaseCheckEmailForVerificationLink', {
        lb: $('<br/>')[0]
      }),
      keyboard: false,
      backdrop: 'static'
    });
  },

  /**
   * @param {PlainObject} cfg
   * @param {"DispatchActivationLinkError"} [cfg.type]
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type}) {
    return AlertDialog.populate({
      heading: _('error'),
      body: _(type, {
        lb: $('<br/>')[0]
      }),
      keyboard: false,
      backdrop: 'static'
    });
  }
};

export default SignupView;

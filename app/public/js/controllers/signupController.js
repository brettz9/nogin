/* globals Nogin -- Server-set */

import ajaxFormClientSideValidate from
  '../utilities/ajaxFormClientSideValidate.js';
import AccountValidator from '../form-validators/AccountValidator.js';
import SignupView from '../views/signup.js';
import ConfirmDialog from '../views/utilities/ConfirmDialog.js';

const name = SignupView.getName();
name.trigger('focus');

const accountForm = SignupView.setAccountSettings();

// redirect to homepage when cancel button is clicked
const redirectToRoot = () => {
  Nogin.redirect('root');
};
const actionButton = SignupView.getActionForAccountForm(accountForm);
actionButton.on('click', redirectToRoot);

let confirmed = false;

if (Nogin.signupAgreement) {
  const confirmSignupDialog = SignupView.setConfirmSignup();
  ConfirmDialog.getSubmit(
    confirmSignupDialog
  ).on('click', () => {
    if (!confirmed) {
      confirmed = true;
      setupValidationSubmission();
      confirmSignupDialog.modal('hide');
      accountForm.trigger('submit');
    }
  });

  SignupView.getAccountForm().on('submit', (e) => {
    if (!confirmed) {
      e.preventDefault();
      confirmSignupDialog.modal('show');
    }
  });
} else {
  confirmed = true;
  setupValidationSubmission();
}

/**
 * @returns {void}
 */
function setupValidationSubmission () {
  const av = new AccountValidator({signup: true});

  ajaxFormClientSideValidate(
    accountForm,
    {
      checkXSRF: false,
      beforeSubmit () {
        return confirmed;
      },
      validate () {
        av.validateForm();
      },
      success (responseText, status /* , xhr, $form */) {
        // "nocontent" (204), "notmodified" (304), "parseerror" (JSON or XML)
        // istanbul ignore else
        if (status === 'success') {
          onCreatedSuccess();
        }
      },
      error (e) {
        switch (e.responseText) {
        case 'email-taken':
          av.showInvalidEmail();
          break;
        case 'username-taken':
          av.showInvalidUserName();
          break;
        default: { // case 'DispatchActivationLinkError': {
          const lockedAlertDialog = SignupView.onShowLockedErrorAlert({
            type: 'DispatchActivationLinkError'
          });
          lockedAlertDialog.modal('show');
          break;
        }
        }
      }
    }
  );
}

/**
 * @returns {void}
 */
function onCreatedSuccess () {
  const accountCreatedAlertDialog = SignupView.accountCreated();
  // redirect to homepage on new account creation, add short
  //  delay so user can read alert window
  SignupView.getAccountCreatedOkButton(
    accountCreatedAlertDialog
  ).on('click', () => {
    setTimeout(redirectToRoot, 3000);
  });
  accountCreatedAlertDialog.modal('show');
}

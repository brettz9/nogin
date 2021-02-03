/* globals Nogin */

import ajaxFormClientSideValidate from
  '../utilities/ajaxFormClientSideValidate.js';
import AccountValidator from '../form-validators/AccountValidator.js';
import SignupView from '../views/signup.js';

const name = SignupView.getName();
name.focus();

const accountForm = SignupView.setAccountSettings();

// redirect to homepage when cancel button is clicked
const redirectToRoot = () => {
  Nogin.redirect('root');
};
const actionButton = SignupView.getActionForAccountForm(accountForm);
actionButton.click(redirectToRoot);

setupValidationSubmission();

/**
 * @returns {void}
 */
function setupValidationSubmission () {
  const av = new AccountValidator({signup: true});

  ajaxFormClientSideValidate(
    accountForm,
    {
      checkXSRF: false,
      validate () {
        av.validateForm();
      },
      success (responseText, status, xhr, $form) {
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
  SignupView.getAccountCreatedOkButton(accountCreatedAlertDialog).click(() => {
    setTimeout(redirectToRoot, 3000);
  });
  accountCreatedAlertDialog.modal('show');
}

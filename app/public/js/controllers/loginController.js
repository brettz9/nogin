/* globals LoginValidator, EmailValidator, LoginView, LoginValidatorView */
'use strict';

(() => {
const loginModal = LoginView.getLoginModal();
const forgotPassword = LoginView.getForgotPassword(loginModal);
const rememberMeButton = LoginView.getRememberMeButton(loginModal);
const lostPasswordUsername = LoginView.getLostPasswordUsername(loginModal);

const retrievePasswordModal = LoginView.retrievePasswordModal();

const retrievePasswordEmail = LoginView.retrieveLostPasswordEmail(
  retrievePasswordModal
);
const retrievePasswordForm = LoginView.retrievePasswordForm(
  retrievePasswordModal
);
const retrievePasswordSubmit = LoginView.retrievePasswordSubmit(
  retrievePasswordModal
);

// bind event listeners to button clicks
retrievePasswordSubmit.click(() => {
  retrievePasswordForm.submit();
});
forgotPassword.click(() => {
  const retrievePasswordCancel = LoginView.setRetrievePasswordCancel(
    retrievePasswordModal
  );

  // This isn't always happening automatically
  retrievePasswordCancel.click(() => {
    // retrievePasswordModal.modal('hide');
    lostPasswordUsername.focus();
  });

  retrievePasswordSubmit.show();
  retrievePasswordModal.modal('show');
});
rememberMeButton.click(function () {
  LoginView.toggleGlyphicon(loginModal);
});

// automatically toggle focus between the email modal window and
//   the login form
retrievePasswordModal.on('shown.bs.modal', () => {
  retrievePasswordEmail.focus();
});
/*
// This was not consistently triggering in Cypress, so added click
//    listener above to do the focusing
retrievePasswordModal.on('hide.bs.modal', () => {
  lostPasswordUsername.focus();
});
*/

// main login form
loginModal.ajaxForm({
  beforeSubmit (formData, jqForm, options) {
    if (!LoginValidator.validateForm()) {
      return false;
    }
    // append 'remember-me' option to formData to write local cookie
    formData.push({
      name: 'remember-me',
      value: LoginView.isRememberMeChecked(loginModal)
    });
    return true;
  },
  success (responseText, status, xhr, $form) {
    if (status === 'success') {
      location.href = '/home';
    }
  },
  error (e) {
    LoginValidator.showLoginError();
  }
});

LoginView.getInputForInitialFocus().focus();
rememberMeButton.click(function () {
  LoginView.toggleCheckSquare(loginModal);
});

// login retrieval form via email
const ev = new EmailValidator();

retrievePasswordForm.ajaxForm({
  url: '/lost-password',
  beforeSubmit (formData, jqForm, options) {
    const emailInput = retrievePasswordEmail[0];
    if (EmailValidator.validateEmail(emailInput)) {
      // Reset for future attempts
      emailInput.setCustomValidity('');
      ev.hideEmailAlert();
      return true;
    }
    return false;
  },
  success (responseText, status, xhr, $form) {
    LoginView.switchConfirmToAlert(retrievePasswordModal);
    retrievePasswordSubmit.hide();
    ev.showEmailSuccess(LoginValidatorView.messages.LinkToResetPasswordMailed);
  },
  error (e) {
    // Can't easily simulate other errors here
    /* istanbul ignore else */
    if (e.responseText === 'email-not-found') {
      ev.showEmailAlert(LoginValidatorView.messages.EmailNotFound);
    } else {
      console.log(e);
      LoginView.switchConfirmToAlert(retrievePasswordModal);
      retrievePasswordSubmit.hide();
      ev.showEmailAlert(LoginValidatorView.messages.ProblemTryAgainLater);
    }
  }
});
})();

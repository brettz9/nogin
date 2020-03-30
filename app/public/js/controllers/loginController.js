/* globals LoginValidator, EmailValidator, LoginView, LoginValidatorView,
  ajaxFormClientSideValidate, NL_ROUTES */
'use strict';

(() => {
const loginModal = LoginView.getLoginModal();
const loginForm = LoginView.getLoginForm();
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

ajaxFormClientSideValidate(
  loginForm,
  {
    validate () {
      LoginValidator.validateForm();
    },
    beforeSubmit (formData, jqForm, options) {
      /*
      // Doesn't get here; see comment above on validation
      if (!LoginValidator.validateForm()) {
        return false;
      }
      */
      // append 'remember-me' option to formData to write local cookie
      formData.push({
        name: 'remember-me',
        value: LoginView.isRememberMeChecked(loginModal)
      });
      return true;
    },
    success (responseText, status, xhr, $form) {
      // "nocontent" (204), "notmodified" (304), "parseerror" (JSON or XML)
      // istanbul ignore else
      if (status === 'success') {
        location.href = NL_ROUTES.home;
      }
    },
    error (e) {
      switch (e.responseText) {
      case 'unexpected-pass-version-error':
        LoginValidator.showLoginError('MismatchUserDataFormat');
        break;
      default:
        LoginValidator.showLoginError();
        break;
      }
    }
  }
);

LoginView.getInputForInitialFocus().focus();
rememberMeButton.click(function () {
  LoginView.toggleCheckSquare(loginModal);
});

// login retrieval form via email
const ev = new EmailValidator();

ajaxFormClientSideValidate(
  retrievePasswordForm,
  {
    validate () {
      const emailInput = retrievePasswordEmail[0];
      if (EmailValidator.validateEmail(emailInput)) {
        ev.hideEmailAlert();
      }
    },
    url: NL_ROUTES.lostPassword,
    success (responseText, status, xhr, $form) {
      LoginView.switchConfirmToAlert(retrievePasswordModal);
      retrievePasswordSubmit.hide();
      switch (responseText) {
      case 'IfExistingLinkToResetPasswordMailed':
        ev.showEmailSuccess(
          LoginValidatorView.messages.IfExistingLinkToResetPasswordMailed
        );
        break;
      default:
        ev.showEmailSuccess(
          LoginValidatorView.messages.LinkToResetPasswordMailed
        );
        break;
      }
    },
    error (e) {
      if (e.responseText === 'email-not-found') {
        ev.showEmailAlert(LoginValidatorView.messages.EmailNotFound);
      } else {
        console.log(e);
        LoginView.switchConfirmToAlert(retrievePasswordModal);
        retrievePasswordSubmit.hide();
        ev.showEmailAlert(LoginValidatorView.messages.ProblemTryAgainLater);
      }
    }
  }
);
})();

/* globals ResetPasswordValidator, ajaxFormClientSideValidate,
    ResetPasswordView, NL_ROUTES */
'use strict';

(() => {
const rv = new ResetPasswordValidator();

const pass = ResetPasswordView.getPassword();

const setPasswordSubmit = ResetPasswordView.getSetPasswordSubmit();

const setPasswordForm = ResetPasswordView.getSetPasswordForm();

ajaxFormClientSideValidate(
  setPasswordForm,
  {
    validate () {
      rv.hideAlert();
      ResetPasswordValidator.validatePassword(pass[0]);
    },
    beforeSubmit (formData, jqForm, options) {
      rv.hideAlert();
    },
    success (responseText, status, xhr, $form) {
      setPasswordSubmit.addClass('disabled');
      setPasswordSubmit.prop('disabled', true);
      rv.showSuccess();
      setTimeout(() => {
        location.href = NL_ROUTES.root;
      }, 3000);
    },
    error () {
      rv.showAlert();
    }
  }
);

const setPasswordDialog = rv.getPasswordDialog();
setPasswordDialog.on('shown.bs.modal', () => {
  pass[0].focus();
});
setPasswordDialog.modal('show');
})();

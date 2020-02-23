/* globals ResetPasswordValidator, setupFormValidation, ResetPasswordView */
'use strict';

(() => {
const rv = new ResetPasswordValidator();

const pass = ResetPasswordView.getPassword();

const setPasswordSubmit = ResetPasswordView.getSetPasswordSubmit();

const setPasswordForm = ResetPasswordView.getSetPasswordForm();

setupFormValidation({
  form: setPasswordForm[0],
  validate () {
    rv.hideAlert();
    ResetPasswordValidator.validatePassword(pass);
  }
});
setPasswordForm.ajaxForm({
  beforeSubmit (formData, jqForm, options) {
    rv.hideAlert();
  },
  success (responseText, status, xhr, $form) {
    setPasswordSubmit.addClass('disabled');
    setPasswordSubmit.prop('disabled', true);
    rv.showSuccess();
    setTimeout(() => {
      location.href = '/';
    }, 3000);
  },
  error () {
    rv.showAlert();
  }
});

const setPasswordDialog = ResetPasswordView.getSetPasswordDialog();
setPasswordDialog.modal('show');
setPasswordDialog.on('shown', () => {
  pass.focus();
});
})();

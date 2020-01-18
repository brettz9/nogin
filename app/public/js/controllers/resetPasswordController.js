/* globals ResetPasswordValidator, ResetPasswordView */
'use strict';

(() => {
const rv = new ResetPasswordValidator();

const pass = ResetPasswordView.getPassword();

const setPasswordSubmit = ResetPasswordView.getSetPasswordSubmit();

ResetPasswordView.getSetPasswordForm().ajaxForm({
  beforeSubmit (formData, jqForm, options) {
    rv.hideAlert();
    return ResetPasswordValidator.validatePassword(pass) !== false;
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

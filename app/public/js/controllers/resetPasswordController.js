/* globals Nogin */

import ajaxFormClientSideValidate from
  '../utilities/ajaxFormClientSideValidate.js';
import ResetPasswordView from '../views/reset-password.js';
import ResetPasswordValidator from
  '../form-validators/ResetPasswordValidator.js';

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
        Nogin.redirect('root');
      }, 3000);
    },
    error (e) {
      switch (e.responseText) {
      case 'bad-session':
        rv.showAlert('bad-session');
        break;
      default:
        rv.showAlert();
        break;
      }
    }
  }
);

const setPasswordDialog = rv.getPasswordDialog();
setPasswordDialog.on('shown.bs.modal', () => {
  pass[0].focus();
});
setPasswordDialog.modal('show');

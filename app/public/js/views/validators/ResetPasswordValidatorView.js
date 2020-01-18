/* globals $, _, AlertDialog */
'use strict';

const modal = $('#set-password');
window.ResetPasswordValidatorView = {
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  setPasswordDialog () {
    modal.modal({show: false, keyboard: false, backdrop: 'static'});
    return modal;
  },

  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  getSetPasswordAlert () {
    return modal.find('.alert');
  },

  /**
   * @returns {void}
   */
  showSuccess () {
    AlertDialog.addSuccess(_('YourPasswordHasBeenReset'));
  },

  /**
   * @returns {void}
   */
  showDanger () {
    AlertDialog.showDanger(_('SomethingWentWrongPleaseTryAgain'));
  },

  messages: {
    ShouldBeMinimumLength: _('ShouldBeMinimumLength')
  }
};

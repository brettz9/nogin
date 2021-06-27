/* globals $, Nogin */
import AlertDialog from '../utilities/AlertDialog.js';

const {_} = Nogin;

const modal = $('#set-password');
const ResetPasswordValidatorView = {
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
   * @param {external:jQuery} alertDialog
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  getLockedAlertButton (alertDialog) {
    return alertDialog.find('button');
  },

  /**
   * @returns {void}
   */
  showSuccess () {
    this.addAlert(_('YourPasswordHasBeenReset'));
  },

  addAlert (msg) {
    this.getSetPasswordAlert().text(msg);
  },

  /**
   * @param {"bad-session"|undefined} type
   * @returns {void}
   */
  showDanger (type) {
    if (type === 'bad-session') {
      return AlertDialog.populate({
        heading: _('error'),
        body: _('SessionLost', {
          lb: $('<br/>')[0]
        }),
        keyboard: false,
        backdrop: 'static'
      });
    }
    return this.addAlert(_('SomethingWentWrongPleaseTryAgain'));
  },

  messages: {
    ShouldBeMinimumLength: _('ShouldBeMinimumLength')
  }
};

export default ResetPasswordValidatorView;

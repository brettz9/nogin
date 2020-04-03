/* globals $, Nogin */

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
   * @returns {void}
   */
  showSuccess () {
    this.addAlert(_('YourPasswordHasBeenReset'));
  },

  addAlert (msg) {
    this.getSetPasswordAlert().text(msg);
  },

  /**
   * @returns {void}
   */
  showDanger () {
    this.addAlert(_('SomethingWentWrongPleaseTryAgain'));
  },

  messages: {
    ShouldBeMinimumLength: _('ShouldBeMinimumLength')
  }
};

export default ResetPasswordValidatorView;

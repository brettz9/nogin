/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */
import AlertDialog from '../utilities/AlertDialog.js';

const {_} = Nogin;

const modal =
  /**
   * @type {import('../utilities/AlertDialog.js').JQueryWithModal}
   */ ($('#set-password'));
const ResetPasswordValidatorView = {
  /**
   * @returns {import('../utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setPasswordDialog () {
    modal.modal({show: false, keyboard: false, backdrop: 'static'});
    return modal;
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getSetPasswordAlert () {
    return modal.find('.alert');
  },

  /**
   * @param {JQuery} alertDialog
   * @returns {JQuery} `HTMLButtonElement`
   */
  getLockedAlertButton (alertDialog) {
    return alertDialog.find('button');
  },

  /**
   * @returns {void}
   */
  showSuccess () {
    this.addAlert(/** @type {string} */ (_('YourPasswordHasBeenReset')));
  },

  /**
   * @param {string} msg
   * @returns {void}
   */
  addAlert (msg) {
    this.getSetPasswordAlert().text(msg);
  },

  /**
   * @param {"bad-session"|undefined} type
   * @returns {import('../utilities/AlertDialog.js').JQueryWithModal|void}
   */
  showDanger (type) {
    if (type === 'bad-session') {
      return AlertDialog.populate({
        heading: /** @type {string} */ (_('error')),
        body: /** @type {Element} */ (_('SessionLost', {
          lb: $('<br/>')[0]
        })),
        keyboard: false,
        backdrop: 'static'
      });
    }
    return this.addAlert(/** @type {string} */ (
      _('SomethingWentWrongPleaseTryAgain')
    ));
  },

  messages: {
    ShouldBeMinimumLength: _('ShouldBeMinimumLength')
  }
};

export default ResetPasswordValidatorView;

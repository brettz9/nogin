/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */
import AlertDialog from './utilities/AlertDialog.js';

const ActivatedView = {
  /**
   * @returns {JQuery & {
   *   modal: (showOrHide: "show"|"hide") => void
   * }} `HTMLDivElement`
   */
  accountActivated () {
    // Set up the alert that displays when an account has been activated
    return AlertDialog.populate({
      heading: /** @type {string} */ (Nogin._('Activated')),
      body: /** @type {Element} */ (Nogin._('yourAccountHasBeenActivated', {
        lb: $('<br/>')[0]
      })),
      keyboard: false,
      backdrop: 'static'
    });
  },
  /**
   * @param {JQuery} accountFailedActivationAlertDialog
   *  `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  getOKButton (accountFailedActivationAlertDialog) {
    return accountFailedActivationAlertDialog.find('[data-name=ok]');
  }
};

export default ActivatedView;

/* globals $, Nogin, NoginInitialErrorGlobal -- `$` is jQuery not ESM,
  `Nogin` and `NoginInitialErrorGlobal` are server-set */
import AlertDialog from './utilities/AlertDialog.js';

const ActivationFailedView = {
  /**
   * @returns {JQuery & {
   *   modal: (showOrHide: "show"|"hide") => void
   * }} `HTMLDivElement`
   */
  accountFailedActivation () {
    // Set up the alert that displays when an account has not been activated.
    return AlertDialog.populate({
      heading: /** @type {string} */ (Nogin._('ActivationFailed')),
      body: /** @type {Element} */ (Nogin._(
        // Passed from server so we can set in JS
        NoginInitialErrorGlobal,
        {
          lb: $('<br/>')[0]
        }
      )),
      keyboard: false,
      backdrop: 'static'
    });
  },
  /**
   * @param {JQuery} accountActivatedAlertDialog `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  getOKButton (accountActivatedAlertDialog) {
    return accountActivatedAlertDialog.find('[data-name=ok]');
  }
};
export default ActivationFailedView;

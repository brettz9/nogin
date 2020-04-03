/* globals $, Nogin */
import AlertDialog from './utilities/AlertDialog.js';

const ActivatedView = {
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  accountActivated () {
    // Set up the alert that displays when an account has been activated
    return AlertDialog.populate({
      heading: Nogin._('Activated'),
      body: Nogin._('yourAccountHasBeenActivated', {
        lb: $('<br/>')[0]
      }),
      keyboard: false,
      backdrop: 'static'
    });
  },
  /**
   * @param {external:jQuery} accountFailedActivationAlertDialog
   *  `HTMLDivElement`
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  getOKButton (accountFailedActivationAlertDialog) {
    return accountFailedActivationAlertDialog.find('[data-name=ok]');
  }
};

export default ActivatedView;

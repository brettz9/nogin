/* globals Nogin */

import ActivationFailedView from '../views/activation-failed.js';

const accountFailedActivationAlertDialog =
  ActivationFailedView.accountFailedActivation();
accountFailedActivationAlertDialog.modal('show');

const okButton = ActivationFailedView.getOKButton(
  accountFailedActivationAlertDialog
);
okButton.click(function () {
  // Redirect to homepage on account failure, adding short delay so user
  //   can read alert window
  setTimeout(function () {
    Nogin.redirect('root');
  }, 3000);
});

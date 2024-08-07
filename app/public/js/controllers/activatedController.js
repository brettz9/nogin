/* globals Nogin -- Server-set */

import ActivatedView from '../views/activated.js';

const accountActivatedAlertDialog = ActivatedView.accountActivated();
accountActivatedAlertDialog.modal('show');

const okButton = ActivatedView.getOKButton(accountActivatedAlertDialog);
okButton.on('click', function () {
  // Redirect to homepage on account activation, adding short delay so user
  //   can read alert window
  setTimeout(function () {
    Nogin.redirect('root');
  }, 3000);
});

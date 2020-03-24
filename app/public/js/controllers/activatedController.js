/* globals ActivatedView, NL_ROUTES */
'use strict';
(() => {
const accountActivatedAlertDialog = ActivatedView.accountActivated();
accountActivatedAlertDialog.modal('show');

const okButton = ActivatedView.getOKButton(accountActivatedAlertDialog);
okButton.click(function () {
  // Redirect to homepage on account activation, adding short delay so user
  //   can read alert window
  setTimeout(function () {
    location.href = NL_ROUTES.root;
  }, 300);
});
})();

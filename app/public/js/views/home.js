/* globals $, _, populateConfirmDialog, AlertDialog, populateForm */
'use strict';

window.HomeView = {
  /**
   * @returns {external:jQuery}
   */
  getLogoutButton () {
    return $('[data-name=btn-logout]');
  },
  /**
   * @returns {external:jQuery}
   */
  getName () {
    return $('[data-name="name"]');
  },

  /**
   * @param {external:jQuery} deleteAccountConfirmDialog
   * @returns {external:jQuery}
   */
  getDeleteAccountSubmit (deleteAccountConfirmDialog) {
    return deleteAccountConfirmDialog.find('.submit');
  },

  /**
   * @param {external:jQuery} accountForm
   * @returns {external:jQuery}
   */
  getDeleteAccountAction (accountForm) {
    return accountForm.find('[data-name=action1]');
  },

  /**
   * @param {external:jQuery} lockedAlertDialog
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  getLockedAlertButton (lockedAlertDialog) {
    return lockedAlertDialog.find('button');
  },

  /**
   * @param {external:jQuery} accountUpdatedAlertDialog
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  getAccountUpdatedButton (accountUpdatedAlertDialog) {
    return accountUpdatedAlertDialog.find('button');
  },

  /**
   * @returns {external:jQuery}
   */
  getUser () {
    return $('[data-name="user"]');
  },
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  setDeleteAccount () {
    // setup the confirm window that displays when the user chooses to
    //  delete their account
    const deleteAccountConfirmDialog = populateConfirmDialog({
      header: _('deleteAccount'),
      body: _('sureWantDeleteAccount'),
      cancel: _('cancel'),
      submit: _('delete')
    });
    deleteAccountConfirmDialog.find('.submit').addClass('btn-danger');
    return deleteAccountConfirmDialog;
  },
  /**
   * @returns {external:jQuery} `HTMLFormElement`
   */
  setAccountSettings () {
    const accountForm = populateForm('[data-name=account-form]', {
      heading: _('accountSettings'),
      subheading: _('hereAreCurrentSettings'),
      action1: _('deleteText'),
      action2: _('updateText')
    });
    accountForm.find('[data-name=action1]')
      .removeClass('btn-outline-dark')
      .addClass('btn-danger');
    return accountForm;
  },
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onAccountUpdated () {
    return AlertDialog.populate({
      heading: _('success'),
      body: _('yourAccountHasBeenUpdated'),
      keyboard: true,
      backdrop: true
    });
  },
  /**
   * @param {PlainObject} cfg
   * @param {"accountDeleted"|"loggedOut"} cfg.type
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onShowLockedAlert ({type}) {
    return AlertDialog.populate({
      heading: _('success'),
      body: _(type, {
        lb: $('<br/>')[0]
      }),
      keyboard: false,
      backdrop: 'static'
    });
  },

  /**
   * @param {PlainObject} cfg
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"} [cfg.type]
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, message}) {
    return AlertDialog.populate({
      heading: _('error'),
      body: message || _(type, {
        lb: $('<br/>')[0]
      }),
      keyboard: false,
      backdrop: 'static'
    });
  }
};

/* globals $, Nogin */

import ConfirmDialog from './utilities/ConfirmDialog.js';
import AlertDialog from './utilities/AlertDialog.js';
import populateForm from './utilities/populateForm.js';

const {_} = Nogin;

/**
 * @param {PlainObject} cfg
 * @param {string} [cfg.message]
 * @param {string} [cfg.type]
 * @param {"error"|"success"} [cfg.heading]
 * @returns {external:jQuery} `HTMLDivElement`
 */
function lockedAlert ({type, message, heading}) {
  return AlertDialog.populate({
    heading: _(heading),
    body: message || _(type, {
      lb: $('<br/>')[0]
    }),
    keyboard: false,
    backdrop: 'static'
  });
}

const HomeView = {
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
   * @returns {external:jQuery}
   */
  getEmail () {
    return $('[data-name="email"]');
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
   * @param {PlainObject} cfg
   * @param {"AppearsChangingEmail"} cfg.type
   * @returns {external:jQuery} `HTMLDivElement`
  */
  onShowConfirmation ({type}) {
    return ConfirmDialog.populate({
      type: 'notice',
      header: _('notice'),
      body: _(type, {
        lb: $('<br/>')[0]
      }),
      cancel: _('cancel'),
      submit: _('confirm')
    });
  },

  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  setDeleteAccount () {
    // setup the confirm window that displays when the user chooses to
    //  delete their account
    const deleteAccountConfirmDialog = ConfirmDialog.populate({
      type: 'deleteAccount',
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
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onAccountUpdatedButNotYetEmail () {
    return AlertDialog.populate({
      heading: _('success'),
      body: _('yourAccountHasBeenUpdatedButEmail'),
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
    return lockedAlert({type, heading: 'success'});
  },

  /**
   * @param {PlainObject} cfg
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
   * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
   * @returns {external:jQuery} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, message}) {
    return lockedAlert({type, message, heading: 'error'});
  }
};

export default HomeView;

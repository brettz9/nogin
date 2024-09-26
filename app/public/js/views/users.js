/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import ConfirmDialog from './utilities/ConfirmDialog.js';
import AlertDialog from './utilities/AlertDialog.js';

const {_} = Nogin;

/**
 * @param {object} cfg
 * @param {string} [cfg.type]
 * @param {string} [cfg.message]
 * @param {string} [cfg.user]
 * @param {"error"|"success"} cfg.heading
 * @returns {import('./utilities/AlertDialog.js').
 *   JQueryWithModal} `HTMLDivElement`
 */
function lockedAlert ({type, message, user, heading}) {
  return AlertDialog.populate({
    heading: /** @type {string} */ (_(heading)),
    body: message || _(
      /** @type {string} */ (type),
      user
        ? {lb: $('<br/>')[0], user}
        : {}
    ),
    keyboard: false,
    backdrop: 'static'
  });
}

const UsersView = {
  /**
   * @param {JQuery} lockedAlertDialog
   * @returns {JQuery} `HTMLButtonElement`
   */
  getLockedAlertButton (lockedAlertDialog) {
    return lockedAlertDialog.find('button');
  },

  /**
   * @returns {JQuery<HTMLElement>}
   */
  getDeleteAccounts () {
    return $('button.deleteAccount');
  },

  /**
   * @returns {JQuery<HTMLElement>}
   */
  getDeleteAllAccounts () {
    return $('button.deleteAllAccounts');
  },

  /**
   * @param {{user: string}} info
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setDeleteAccount (info) {
    const deleteAccountConfirmDialog = ConfirmDialog.populate({
      type: 'deleteAccount',
      header: /** @type {string} */ (_('deleteAccount')),
      body: /** @type {string} */ (_('sureWantDeleteUserAccount', {
        user: info.user
      })),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    deleteAccountConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      deleteAccountConfirmDialog
    );
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setDeleteAllAccounts () {
    const deleteAllAccountsConfirmDialog = ConfirmDialog.populate({
      type: 'deleteAllAccounts',
      header: /** @type {string} */ (_('deleteAllAccounts')),
      body: /** @type {string} */ (_('reallyWantDeleteAllUserAccounts')),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    deleteAllAccountsConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      deleteAllAccountsConfirmDialog
    );
  },

  /**
   * @param {object} cfg
   * @param {"userAccountDeleted"|"allUserAccountsDeleted"} cfg.type
   * @param {string} [cfg.user]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedAlert ({type, user}) {
    return lockedAlert({type, user, heading: 'success'});
  },

  /**
   * @param {object} cfg
   * @param {string} cfg.user
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
   * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, user, message}) {
    return lockedAlert({type, message, user, heading: 'error'});
  }
};

export default UsersView;

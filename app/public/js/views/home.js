/* globals $, Nogin */

import ConfirmDialog from './utilities/ConfirmDialog.js';
import AlertDialog from './utilities/AlertDialog.js';
import populateForm from './utilities/populateForm.js';

const {_} = Nogin;

/**
 * @param {object} cfg
 * @param {string} [cfg.message]
 * @param {string} [cfg.type]
 * @param {"error"|"success"} cfg.heading
 * @returns {import('./utilities/AlertDialog.js').
 *   JQueryWithModal} `HTMLDivElement`
 */
function lockedAlert ({type, message, heading}) {
  return AlertDialog.populate({
    heading: /** @type {string} */ (_(heading)),
    body: message || _(/** @type {string} */ (type), {
      lb: $('<br/>')[0]
    }),
    keyboard: false,
    backdrop: 'static'
  });
}

const HomeView = {
  /**
   * @returns {JQuery}
   */
  getLogoutButton () {
    return $('[data-name=btn-logout]');
  },
  /**
   * @returns {JQuery}
   */
  getName () {
    return $('[data-name="name"]');
  },

  /**
   * @returns {JQuery}
   */
  getEmail () {
    return $('[data-name="email"]');
  },

  /**
   * @param {JQuery} accountForm
   * @returns {JQuery}
   */
  getDeleteAccountAction (accountForm) {
    return accountForm.find('[data-name=action1]');
  },

  /**
   * @param {JQuery} lockedAlertDialog
   * @returns {JQuery} `HTMLButtonElement`
   */
  getLockedAlertButton (lockedAlertDialog) {
    return lockedAlertDialog.find('button');
  },

  /**
   * @param {JQuery} accountUpdatedAlertDialog
   * @returns {JQuery} `HTMLButtonElement`
   */
  getAccountUpdatedButton (accountUpdatedAlertDialog) {
    return accountUpdatedAlertDialog.find('button');
  },

  /**
   * @returns {JQuery}
   */
  getUser () {
    return $('[data-name="user"]');
  },

  /**
   * @param {object} cfg
   * @param {"AppearsChangingEmail"} cfg.type
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
  */
  onShowConfirmation ({type}) {
    return ConfirmDialog.populate({
      type: 'notice',
      header: /** @type {string} */ (_('notice')),
      body: /** @type {Element} */ (_(type, {
        lb: $('<br/>')[0]
      })),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('confirm'))
    });
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setDeleteAccount () {
    // setup the confirm window that displays when the user chooses to
    //  delete their account
    const deleteAccountConfirmDialog = ConfirmDialog.populate({
      type: 'deleteAccount',
      header: /** @type {string} */ (_('deleteAccount')),
      body: /** @type {string} */ (_('sureWantDeleteAccount')),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    deleteAccountConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      deleteAccountConfirmDialog
    );
  },
  /**
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  setAccountSettings () {
    const accountForm = populateForm('[data-name=account-form]', {
      heading: /** @type {string} */ (_('accountSettings')),
      subheading: /** @type {string} */ (_('hereAreCurrentSettings')),
      action1: /** @type {string} */ (_('deleteText')),
      action2: /** @type {string} */ (_('updateText'))
    });
    accountForm.find('[data-name=action1]')
      .removeClass('btn-outline-dark')
      .addClass('btn-danger');
    return accountForm;
  },
  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onAccountUpdated () {
    return AlertDialog.populate({
      heading: /** @type {string} */ (_('success')),
      body: _('yourAccountHasBeenUpdated'),
      keyboard: true,
      backdrop: true
    });
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onAccountUpdatedButNotYetEmail () {
    return AlertDialog.populate({
      heading: /** @type {string} */ (_('success')),
      body: _('yourAccountHasBeenUpdatedButEmail'),
      keyboard: true,
      backdrop: true
    });
  },

  /**
   * @param {object} cfg
   * @param {"accountDeleted"|"loggedOut"} cfg.type
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedAlert ({type}) {
    return lockedAlert({type, heading: 'success'});
  },

  /**
   * @param {object} cfg
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"|"FailureSubmittingUserInfo"|
   * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, message}) {
    return lockedAlert({type, message, heading: 'error'});
  }
};

export default HomeView;

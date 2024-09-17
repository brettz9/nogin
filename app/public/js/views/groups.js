/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import ConfirmDialog from './utilities/ConfirmDialog.js';
import AlertDialog from './utilities/AlertDialog.js';

const {_} = Nogin;

/**
 * @param {object} cfg
 * @param {string} [cfg.type]
 * @param {string} [cfg.message]
 * @param {string} [cfg.group]
 * @param {"error"|"success"} cfg.heading
 * @returns {import('./utilities/AlertDialog.js').
 *   JQueryWithModal} `HTMLDivElement`
 */
function lockedAlert ({type, message, group, heading}) {
  return AlertDialog.populate({
    heading: /** @type {string} */ (_(heading)),
    body: message || _(
      /** @type {string} */ (type),
      group
        ? {lb: $('<br/>')[0], group}
        : {},
      {
        // We're accepting a variety of messages here so no big deal
        //   if missing a line break (e.g., some even with `group`)
        throwOnExtraSuppliedFormatters: false
      }
    ),
    keyboard: false,
    backdrop: 'static'
  });
}

const GroupsView = {
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
  getDeleteGroups () {
    return $('button.deleteGroup');
  },

  /**
   * @returns {JQuery<HTMLElement>}
   */
  getRemoveUserFromGroup () {
    return $('button.removeUserFromGroup');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getAddPrivilegeToGroupButton () {
    return $('button.addPrivilegeToGroup');
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  addPrivilegeToGroupModal () {
    const addPrivilegeToGroupModal =
      /**
       * @type {import('../views/utilities/AlertDialog.js').
       *   JQueryWithModal}
       */ (
        $('#addPrivilegeToGroup')
      );
    addPrivilegeToGroupModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return addPrivilegeToGroupModal;
  },

  /**
   * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  addPrivilegeToGroupForm (addPrivilegeToGroupModal) {
    return (
    /**
     * @type {import('../utilities/ajaxFormClientSideValidate.js').
     * JQueryWithAjaxForm}
     */
      (addPrivilegeToGroupModal.find('#addPrivilegeToGroup-form'))
    );
  },

  /**
   * @returns {HTMLInputElement}
   */
  getAddPrivilegeToGroupGroup () {
    return /** @type {HTMLInputElement} */ ($('#addPrivilegeToGroup-input')[0]);
  },

  /**
   * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  addPrivilegeToGroupCancel (addPrivilegeToGroupModal) {
    return addPrivilegeToGroupModal.find(
      '[data-name=addPrivilegeToGroup-cancel]'
    );
  },

  /**
   * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  addPrivilegeToGroupSubmit (addPrivilegeToGroupModal) {
    return addPrivilegeToGroupModal.find(
      '[data-name=addPrivilegeToGroup-submit]'
    );
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
  *   JQueryWithModal} `HTMLDivElement`
  */
  createGroupModal () {
    const createGroupModal =
      /**
      * @type {import('../views/utilities/AlertDialog.js').
      *   JQueryWithModal}
      */ (
        $('#createGroup')
      );
    createGroupModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return createGroupModal;
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
  *   JQueryWithModal} `HTMLDivElement`
  */
  renameGroupModal () {
    const renameGroupModal =
      /**
      * @type {import('../views/utilities/AlertDialog.js').
      *   JQueryWithModal}
      */ (
        $('#renameGroup')
      );
    renameGroupModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return renameGroupModal;
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  addUserToGroupModal () {
    const addUserToGroupModal =
      /**
      * @type {import('../views/utilities/AlertDialog.js').
      *   JQueryWithModal}
      */ (
        $('#addUserToGroup')
      );
    addUserToGroupModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return addUserToGroupModal;
  },

  /**
   * @param {JQuery} createGroupModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  createGroupForm (createGroupModal) {
    return (
      /**
       * @type {import('../utilities/ajaxFormClientSideValidate.js').
       * JQueryWithAjaxForm}
       */
      (createGroupModal.find('#createGroup-form'))
    );
  },

  /**
   * @param {JQuery} renameGroupModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
  *   JQueryWithAjaxForm} `HTMLFormElement`
  */
  renameGroupForm (renameGroupModal) {
    return (
      /**
      * @type {import('../utilities/ajaxFormClientSideValidate.js').
      * JQueryWithAjaxForm}
      */
      (renameGroupModal.find('#renameGroup-form'))
    );
  },

  /**
   * @param {JQuery} addUserToGroupModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  addUserToGroupForm (addUserToGroupModal) {
    return (
      /**
      * @type {import('../utilities/ajaxFormClientSideValidate.js').
      * JQueryWithAjaxForm}
      */
      (addUserToGroupModal.find('#addUserToGroup-form'))
    );
  },

  /**
   * @param {JQuery} createGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  createGroupSubmit (createGroupModal) {
    return createGroupModal.find('[data-name=createGroup-submit]');
  },

  /**
   * @param {JQuery} addUserToGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  addUserToGroupSubmit (addUserToGroupModal) {
    return addUserToGroupModal.find('[data-name=addUserToGroup-submit]');
  },

  /**
   * @param {JQuery} renameGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  renameGroupSubmit (renameGroupModal) {
    return renameGroupModal.find('[data-name=renameGroup-submit]');
  },

  /**
   * @param {JQuery} createGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  createGroupCancel (createGroupModal) {
    return createGroupModal.find('[data-name=createGroup-cancel]');
  },

  /**
   * @param {JQuery} addUserToGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  addUserToGroupCancel (addUserToGroupModal) {
    return addUserToGroupModal.find('[data-name=addUserToGroup-cancel]');
  },

  /**
   * @param {JQuery} renameGroupModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  renameGroupCancel (renameGroupModal) {
    return renameGroupModal.find('[data-name=renameGroup-cancel]');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getCreateGroupButton () {
    return $('button.createGroup');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getRenameGroupButton () {
    return $('button.renameGroup');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getAddUserToGroupButton () {
    return $('button.addUserToGroup');
  },

  /**
   * @returns {HTMLInputElement}
   */
  getCreateGroupName () {
    return /** @type {HTMLInputElement} */ ($('#createGroup-input')[0]);
  },

  /**
   * @returns {HTMLInputElement}
   */
  getAddUserToGroupName () {
    return /** @type {HTMLInputElement} */ ($('#addUserToGroup-input')[0]);
  },

  /**
   * @returns {HTMLInputElement}
   */
  getRenameGroupName () {
    return /** @type {HTMLInputElement} */ ($('#renameGroup-input')[0]);
  },

  /**
   * @param {string} group
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setDeleteGroup (group) {
    const deleteGroupConfirmDialog = ConfirmDialog.populate({
      type: 'deleteGroup',
      header: /** @type {string} */ (_('deleteGroup')),
      body: /** @type {string} */ (_('sureWantDeleteGroup', {
        group
      })),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    deleteGroupConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      deleteGroupConfirmDialog
    );
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
  *   JQueryWithModal} `HTMLDivElement`
  */
  setRemoveUserFromGroup () {
    const removeUserFromGroupConfirmDialog = ConfirmDialog.populate({
      type: 'removeUserFromGroup',
      header: /** @type {string} */ (_('removeUserFromGroup')),
      body: /** @type {string} */ (_('reallyWantRemoveUserFromGroup')),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    removeUserFromGroupConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      removeUserFromGroupConfirmDialog
    );
  },

  /**
   * @returns {JQuery<HTMLElement>}
   */
  getRemovePrivilegeFromGroup () {
    return $('button.removePrivilegeFromGroup');
  },

  /**
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setRemovePrivilegeFromGroup () {
    const removePrivilegeFromGroupConfirmDialog = ConfirmDialog.populate({
      type: 'removePrivilegeFromGroup',
      header: /** @type {string} */ (_('removePrivilegeFromGroup')),
      body: /** @type {string} */ (_('reallyWantRemovePrivilegeFromGroup')),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    removePrivilegeFromGroupConfirmDialog.find(
      '.submit'
    ).addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      removePrivilegeFromGroupConfirmDialog
    );
  },

  /**
   * @param {object} cfg
   * @param {"groupCreated"|"groupDeleted"|"groupRenamed"|
   *   "userRemovedFromGroup"|"userAddedToGroup"|
   *   "privilegeAddedToGroup"|"privilegeRemovedFromGroup"} cfg.type
   * @param {string} [cfg.group]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedAlert ({type, group}) {
    return lockedAlert({type, group, heading: 'success'});
  },

  /**
   * @param {object} cfg
   * @param {string} cfg.group
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"|"FailureSubmittingGroupInfo"|
   * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, group, message}) {
    return lockedAlert({type, message, group, heading: 'error'});
  },

  /**
   * @type {{[key: string]: {[key: string]: string}}}
   */
  errorMessages: {
    name: {
      PleaseEnterName: /** @type {string} */ (_('PleaseEnterName'))
    }
  }
};

export default GroupsView;

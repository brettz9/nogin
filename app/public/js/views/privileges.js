/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import ConfirmDialog from './utilities/ConfirmDialog.js';
import AlertDialog from './utilities/AlertDialog.js';

const {_} = Nogin;

/**
 * @param {object} cfg
 * @param {string} [cfg.type]
 * @param {string} [cfg.message]
 * @param {string} [cfg.privilege]
 * @param {"error"|"success"} cfg.heading
 * @returns {import('./utilities/AlertDialog.js').
 *   JQueryWithModal} `HTMLDivElement`
 */
function lockedAlert ({type, message, privilege, heading}) {
  return AlertDialog.populate({
    heading: /** @type {string} */ (_(heading)),
    body: message || _(
      /** @type {string} */ (type),
      privilege
        ? {lb: $('<br/>')[0], privilege}
        : {},
      {
        // We're accepting a variety of messages here so no big deal
        //   if missing a line break (e.g., some even with `privilege`)
        throwOnExtraSuppliedFormatters: false
      }
    ),
    keyboard: false,
    backdrop: 'static'
  });
}

const PrivilegesView = {
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
  getDeletePrivileges () {
    return $('button.deletePrivilege');
  },

  /**
   * @returns {JQuery<HTMLElement>}
   */
  getRemovePrivilegeFromGroup () {
    return $('button.removePrivilegeFromGroup');
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
  *   JQueryWithModal} `HTMLDivElement`
  */
  createPrivilegeModal () {
    const createPrivilegeModal =
      /**
      * @type {import('../views/utilities/AlertDialog.js').
      *   JQueryWithModal}
      */ (
        $('#createPrivilege')
      );
    createPrivilegeModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return createPrivilegeModal;
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
  *   JQueryWithModal} `HTMLDivElement`
  */
  editPrivilegeModal () {
    const editPrivilegeModal =
      /**
      * @type {import('../views/utilities/AlertDialog.js').
      *   JQueryWithModal}
      */ (
        $('#editPrivilege')
      );
    editPrivilegeModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return editPrivilegeModal;
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
   * @param {JQuery} createPrivilegeModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  createPrivilegeForm (createPrivilegeModal) {
    return (
      /**
       * @type {import('../utilities/ajaxFormClientSideValidate.js').
       * JQueryWithAjaxForm}
       */
      (createPrivilegeModal.find('#createPrivilege-form'))
    );
  },

  /**
   * @param {JQuery} editPrivilegeModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
  *   JQueryWithAjaxForm} `HTMLFormElement`
  */
  editPrivilegeForm (editPrivilegeModal) {
    return (
      /**
      * @type {import('../utilities/ajaxFormClientSideValidate.js').
      * JQueryWithAjaxForm}
      */
      (editPrivilegeModal.find('#editPrivilege-form'))
    );
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
   * @param {JQuery} createPrivilegeModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  createPrivilegeSubmit (createPrivilegeModal) {
    return createPrivilegeModal.find('[data-name=createPrivilege-submit]');
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
   * @param {JQuery} editPrivilegeModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  editPrivilegeSubmit (editPrivilegeModal) {
    return editPrivilegeModal.find('[data-name=editPrivilege-submit]');
  },

  /**
   * @param {JQuery} createPrivilegeModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  createPrivilegeCancel (createPrivilegeModal) {
    return createPrivilegeModal.find('[data-name=createPrivilege-cancel]');
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
   * @param {JQuery} editPrivilegeModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  editPrivilegeCancel (editPrivilegeModal) {
    return editPrivilegeModal.find('[data-name=editPrivilege-cancel]');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getCreatePrivilegeButton () {
    return $('button.createPrivilege');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getEditPrivilegeButton () {
    return $('button.editPrivilege');
  },

  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getAddPrivilegeToGroupButton () {
    return $('button.addPrivilegeToGroup');
  },

  /**
   * @returns {HTMLInputElement}
   */
  getCreatePrivilegeName () {
    return /** @type {HTMLInputElement} */ ($('#createPrivilege-input')[0]);
  },

  /**
   * @returns {HTMLInputElement}
   */
  getCreatePrivilegeDescription () {
    return /** @type {HTMLInputElement} */ (
      $('#createPrivilege-description-input')[0]
    );
  },

  /**
   * @returns {HTMLInputElement}
   */
  getAddPrivilegeToGroupName () {
    return /** @type {HTMLInputElement} */ ($('#addPrivilegeToGroup-input')[0]);
  },

  /**
   * @returns {HTMLInputElement}
   */
  getEditPrivilege () {
    return /** @type {HTMLInputElement} */ ($('#editPrivilege-input')[0]);
  },

  /**
   * @param {string} privilege
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  setDeletePrivilege (privilege) {
    const deletePrivilegeConfirmDialog = ConfirmDialog.populate({
      type: 'deletePrivilege',
      header: /** @type {string} */ (_('deletePrivilege')),
      body: /** @type {string} */ (_('sureWantDeletePrivilege', {
        privilege
      })),
      cancel: /** @type {string} */ (_('cancel')),
      submit: /** @type {string} */ (_('delete'))
    });
    deletePrivilegeConfirmDialog.find('.submit').addClass('btn-danger');
    return /** @type {import('./utilities/AlertDialog.js').JQueryWithModal} */ (
      deletePrivilegeConfirmDialog
    );
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
   * @param {"privilegeCreated"|"privilegeDeleted"|"privilegeEdited"|
   *   "privilegeRemovedFromGroup"|"privilegeAddedToGroup"} cfg.type
   * @param {string} [cfg.privilege]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedAlert ({type, privilege}) {
    return lockedAlert({type, privilege, heading: 'success'});
  },

  /**
   * @param {object} cfg
   * @param {string} cfg.privilege
   * @param {string} [cfg.message]
   * @param {"ErrorLoggingOut"|"FailureSubmittingPrivilegeInfo"|
   * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
   * @returns {import('./utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  onShowLockedErrorAlert ({type, privilege, message}) {
    return lockedAlert({type, message, privilege, heading: 'error'});
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

export default PrivilegesView;

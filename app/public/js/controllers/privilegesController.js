/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import '../polyfills/Error.js';
import '../polyfills/console.js';

import ConfirmDialog from '../views/utilities/ConfirmDialog.js';
import PrivilegesView from '../views/privileges.js';

/**
 * @typedef {Error & {
 *   text: string,
 *   responseText: string,
 *   statusText?: string
 * }} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

const createPrivilegeButton = PrivilegesView.getCreatePrivilegeButton();
const createPrivilegeModal = PrivilegesView.createPrivilegeModal();
const createPrivilegeForm = PrivilegesView.createPrivilegeForm(
  createPrivilegeModal
);

createPrivilegeForm.on('submit', function (e) {
  e.preventDefault();
});
createPrivilegeButton.on('click', () => {
  const createPrivilegeCancel = PrivilegesView.createPrivilegeCancel(
    createPrivilegeModal
  );

  createPrivilegeCancel.on('click', () => {
    createPrivilegeModal.modal('hide');
  });
  createPrivilegeModal.modal('show');

  const createPrivilegeSubmit = PrivilegesView.createPrivilegeSubmit(
    createPrivilegeModal
  );
  createPrivilegeSubmit.on('click', async () => {
    try {
      const privilegeToCreate = PrivilegesView.getCreatePrivilegeName();
      if (privilegeToCreate.validity.tooShort) {
        privilegeToCreate.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          createPrivilegeForm[0]
        ).reportValidity();
        return;
      }
      const description = PrivilegesView.getCreatePrivilegeDescription();
      await createPrivilege(privilegeToCreate.value, description.value);
    } catch (er) {
      createPrivilegeModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);

      // Log just in case not internationalized
      console.error(Nogin._('ErrorFormat', {
        text: err.text,
        statusText:
          // istanbul ignore next
          err.statusText ||
          ''
      }));
      // However, should already be internationalized by server
      showLockedErrorAlert({message: err.text});
    }
  });
});

const editPrivilegeButton = PrivilegesView.getEditPrivilegeButton();
const editPrivilegeModal = PrivilegesView.editPrivilegeModal();
const editPrivilegeForm = PrivilegesView.editPrivilegeForm(
  editPrivilegeModal
);

editPrivilegeForm.on('submit', function (e) {
  e.preventDefault();
});
editPrivilegeButton.on('click', (e) => {
  const privilegeName = /** @type {string} */ (e.target.dataset.privilege);
  const privilegeToEdit = PrivilegesView.getEditPrivilege();

  const editPrivilegeCancel = PrivilegesView.editPrivilegeCancel(
    editPrivilegeModal
  );

  editPrivilegeCancel.on('click', () => {
    editPrivilegeModal.modal('hide');
  });
  editPrivilegeModal.modal('show');
  privilegeToEdit.value = privilegeName;

  const editPrivilegeSubmit = PrivilegesView.editPrivilegeSubmit(
    editPrivilegeModal
  );
  editPrivilegeSubmit.on('click', async () => {
    try {
      if (privilegeToEdit.validity.tooShort) {
        privilegeToEdit.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (editPrivilegeForm[0]).reportValidity();
        return;
      }
      const newPrivilegeName = privilegeToEdit.value;
      await editPrivilege(privilegeName, newPrivilegeName);
    } catch (er) {
      editPrivilegeModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);

      // Log just in case not internationalized
      console.error(Nogin._('ErrorFormat', {
        text: err.text,
        statusText:
          // istanbul ignore next
          err.statusText ||
          ''
      }));
      // However, should already be internationalized by server
      showLockedErrorAlert({message: err.text});
    }
  });
});

const addPrivilegeToGroupButton = PrivilegesView.getAddPrivilegeToGroupButton();
const addPrivilegeToGroupModal = PrivilegesView.addPrivilegeToGroupModal();
const addPrivilegeToGroupForm = PrivilegesView.addPrivilegeToGroupForm(
  addPrivilegeToGroupModal
);

addPrivilegeToGroupForm.on('submit', function (e) {
  e.preventDefault();
});
addPrivilegeToGroupButton.on('click', (e) => {
  const groupName = /** @type {string} */ (e.target.dataset.group);
  const privilegeToAdd = PrivilegesView.getAddPrivilegeToGroupName();

  const addPrivilegeToGroupCancel = PrivilegesView.addPrivilegeToGroupCancel(
    addPrivilegeToGroupModal
  );

  addPrivilegeToGroupCancel.on('click', () => {
    addPrivilegeToGroupModal.modal('hide');
  });
  addPrivilegeToGroupModal.modal('show');

  const addPrivilegeToGroupSubmit = PrivilegesView.addPrivilegeToGroupSubmit(
    addPrivilegeToGroupModal
  );
  addPrivilegeToGroupSubmit.on('click', async () => {
    try {
      if (privilegeToAdd.validity.tooShort) {
        privilegeToAdd.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          addPrivilegeToGroupForm[0]
        ).reportValidity();
        return;
      }
      const privilegeID = privilegeToAdd.value;
      await addPrivilegeToGroup(groupName, privilegeID);
    } catch (er) {
      addPrivilegeToGroupModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);

      // Log just in case not internationalized
      console.error(Nogin._('ErrorFormat', {
        text: err.text,
        statusText:
          // istanbul ignore next
          err.statusText ||
          ''
      }));
      // However, should already be internationalized by server
      showLockedErrorAlert({message: err.text});
    }
  });
});

/** @type {string} */
let privilege;

/** @type {import('../views/utilities/AlertDialog.js').JQueryWithModal} */
let deletePrivilegeConfirmDialog;
PrivilegesView.getDeletePrivileges().on('click', (e) => {
  // eslint-disable-next-line prefer-destructuring -- TS
  privilege = /** @type {string} */ (e.target.dataset.privilege);

  // handle privilege deletion
  deletePrivilegeConfirmDialog = PrivilegesView.setDeletePrivilege(privilege);
  ConfirmDialog.getSubmit(
    deletePrivilegeConfirmDialog
  ).on('click', async () => {
    try {
      await deletePrivilege();
    } catch (er) {
      const err = /** @type {AjaxPostError} */ (er);

      // Log just in case not internationalized
      console.error(Nogin._('ErrorFormat', {
        text: err.text,
        statusText:
          // istanbul ignore next
          err.statusText ||
          ''
      }));
      // However, should already be internationalized by server
      showLockedErrorAlert({message: err.text});
    }
  });
  deletePrivilegeConfirmDialog.modal('show');
});

const removePrivilegeFromGroupConfirmDialog =
  PrivilegesView.setRemovePrivilegeFromGroup();
PrivilegesView.getRemovePrivilegeFromGroup().on('click', (e) => {
  const groupName = /** @type {string} */ (e.target.dataset.group);
  const privilegeID = /** @type {string} */ (e.target.dataset.privilege);
  ConfirmDialog.getSubmit(
    removePrivilegeFromGroupConfirmDialog
  ).on('click', async () => {
    try {
      await removePrivilegeFromGroup(groupName, privilegeID);
    } catch (er) {
      const err = /** @type {AjaxPostError} */ (er);

      // Log just in case not internationalized
      console.error(Nogin._('ErrorFormat', {
        text: err.text,
        statusText:
          // istanbul ignore next
          err.statusText ||
          ''
      }));
      // However, should already be internationalized by server
      showLockedErrorAlert({message: err.text});
    }
  });
  removePrivilegeFromGroupConfirmDialog.modal('show');
});

/**
 * @param {string} url
 * @param {object} [data]
 * @returns {Promise<void>}
 */
function post (url, data) {
  /** @type {JQuery.AjaxSettings} */
  const args = {
    type: 'post',
    headers: {
      'X-XSRF-Token': xsrfCookie
    }
  };
  if (data) {
    args.data = data;
  }

  // eslint-disable-next-line promise/avoid-new -- our own API
  return new Promise((resolve, reject) => {
    $.ajax(url, args).done(resolve).fail(
      (jqXHR /* , textStatus, errorThrown */) => {
        const err = /** @type {AjaxPostError} */ (
          new Error('Ajax POST error')
        );
        err.text = jqXHR.responseText;
        err.responseText = jqXHR.statusText;
        reject(err);
      }
    );
  });
  // Reenable after these related issues are fixed:
  // https://github.com/cypress-io/cypress/issues/95
  // https://github.com/cypress-io/cypress/issues/687
  /*
  const resp = await fetch(url, {
    method: 'POST'
  });
  await checkErrors(resp);
  */
  /**
   * @param {Response} resp
   * @throws {Error}
   * @returns {Promise<void>}
   */
  /*
  async function checkErrors (resp) {
    if (!resp.ok) {
      const err = new Error();
      err.text = await resp.text();
      err.responseText = resp.statusText;
      throw err;
    }
  }
  */
}

/**
 * @throws {Error}
 * @param {string} groupName
 * @param {string} privilegeID
 * @returns {Promise<void>}
 */
async function removePrivilegeFromGroup (groupName, privilegeID) {
  removePrivilegeFromGroupConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {
    verb: 'removePrivilegeFromGroup', groupName, privilegeID
  });
  showLockedAlertReload({type: 'privilegeRemovedFromGroup'});
}

/**
 * @param {string} privilegeToCreate
 * @param {string} description
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function createPrivilege (privilegeToCreate, description) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'createPrivilege',
    privilegeName: privilegeToCreate,
    description
  });
  createPrivilegeModal.modal('hide');
  showLockedAlertReload({type: 'privilegeCreated'});
}

/**
 * @param {string} privilegeName
 * @param {string} newPrivilegeName
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function editPrivilege (privilegeName, newPrivilegeName) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'editPrivilege', privilegeName, newPrivilegeName
  });
  editPrivilegeModal.modal('hide');
  showLockedAlertReload({type: 'privilegeEdited'});
}

/**
 * @param {string} groupName
 * @param {string} privilegeID
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function addPrivilegeToGroup (groupName, privilegeID) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'addPrivilegeToGroup', groupName, privilegeID
  });
  addPrivilegeToGroupModal.modal('hide');
  showLockedAlertReload({type: 'privilegeAddedToGroup'});
}

/**
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function deletePrivilege () {
  deletePrivilegeConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {
    verb: 'deletePrivilege', privilegeName: privilege
  });
  showLockedAlertReload({type: 'privilegeDeleted'});
}

/**
 * @param {object} cfg
 * @param {"privilegeCreated"|"privilegeDeleted"|"privilegeEdited"|
 *   "privilegeRemovedFromGroup"|"privilegeAddedToGroup"} cfg.type
 * @returns {void}
 */
function showLockedAlertReload ({type}) {
  const lockedAlertDialog = PrivilegesView.onShowLockedAlert({
    type,
    privilege
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  PrivilegesView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

/**
 * @param {object} cfg
 * @param {"ErrorLoggingOut"|"SessionLost"|"ProblemDispatchingLink"|
 *   "FailureSubmittingPrivilegeInfo"} [cfg.type]
 * @param {string} [cfg.message]
 * @returns {void}
*/
function showLockedErrorAlert ({type, message}) {
  const lockedAlertDialog = PrivilegesView.onShowLockedErrorAlert({
    type, message, privilege
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  PrivilegesView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

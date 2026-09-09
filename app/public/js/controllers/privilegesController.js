/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */
/* eslint-disable unicorn/no-top-level-assignment-in-function -- Convenient */
import '../polyfills/Error.js';
import '../polyfills/console.js';

import ConfirmDialog from '../views/utilities/ConfirmDialog.js';
import PrivilegesView from '../views/privileges.js';
import {
  prepareValueField, validatePrivilegeJSON
} from '../views/utilities/privilegeValue.js';

/**
 * @typedef {Error & {
 *   text: string,
 *   responseText: string,
 *   statusText?: string
 * }} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');
const tooShort = 3;

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

  createPrivilegeCancel.off('.noginModal');
  createPrivilegeCancel.on('click.noginModal', () => {
    createPrivilegeModal.modal('hide');
  });
  createPrivilegeModal.modal('show');

  const createPrivilegeSubmit = PrivilegesView.createPrivilegeSubmit(
    createPrivilegeModal
  );
  createPrivilegeSubmit.off('.noginModal');
  createPrivilegeSubmit.on('click.noginModal', async () => {
    try {
      const privilegeToCreate = PrivilegesView.getCreatePrivilegeName();
      // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
      // if (privilegeToCreate.validity.tooShort) {
      if (privilegeToCreate.value.length < tooShort) {
        privilegeToCreate.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          createPrivilegeForm[0]
        ).reportValidity();
        return;
      }
      const description = PrivilegesView.getCreatePrivilegeDescription();
      const type = PrivilegesView.getCreatePrivilegeType();
      const userVarying = PrivilegesView.getCreatePrivilegeUserVarying();
      await createPrivilege(
        privilegeToCreate.value, description.value, type.value,
        userVarying.checked
      );
    } catch (er) {
      createPrivilegeModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);

      console.log('err', err);

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
  const descriptionVal = /** @type {string} */ (e.target.dataset.description);
  const typeVal = /** @type {string} */ (e.target.dataset.type);
  const userVaryingVal = e.target.dataset.userVarying === 'true';
  const privilegeToEdit = PrivilegesView.getEditPrivilege();

  const editPrivilegeCancel = PrivilegesView.editPrivilegeCancel(
    editPrivilegeModal
  );
  editPrivilegeCancel.off('.noginModal');
  editPrivilegeCancel.on('click.noginModal', () => {
    editPrivilegeModal.modal('hide');
  });

  editPrivilegeModal.modal('show');
  privilegeToEdit.value = privilegeName;

  const privilegeDescription = PrivilegesView.getEditPrivilegeDescription();
  privilegeDescription.value = descriptionVal;
  const privilegeType = PrivilegesView.getEditPrivilegeType();
  privilegeType.value = typeVal;
  privilegeType.disabled = true;
  const userVarying = PrivilegesView.getEditPrivilegeUserVarying();
  userVarying.checked = userVaryingVal;
  userVarying.disabled = true;

  const editPrivilegeSubmit = PrivilegesView.editPrivilegeSubmit(
    editPrivilegeModal
  );
  editPrivilegeSubmit.off('.noginModal');
  editPrivilegeSubmit.on('click.noginModal', async () => {
    try {
      // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
      // if (privilegeToEdit.validity.tooShort) {
      if (privilegeToEdit.value.length < tooShort) {
        privilegeToEdit.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (editPrivilegeForm[0]).reportValidity();
        return;
      }
      const newPrivilegeName = privilegeToEdit.value;
      const description = privilegeDescription.value;
      await editPrivilege(
        privilegeName, newPrivilegeName, description, privilegeType.value
      );
    } catch (er) {
      editPrivilegeModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);

      console.log('err', err);

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

const addPrivilegeToUserButton = PrivilegesView.getAddPrivilegeToUserButton();
const addPrivilegeToUserModal = PrivilegesView.addPrivilegeToUserModal();
const addPrivilegeToUserForm = PrivilegesView.addPrivilegeToUserForm(
  addPrivilegeToUserModal
);

addPrivilegeToUserForm.on('submit', function (e) {
  e.preventDefault();
});
addPrivilegeToUserButton.on('click', (e) => {
  const privilegeName = /** @type {string} */ (e.target.dataset.privilege);
  const privilegeType = /** @type {string} */ (e.target.dataset.type);
  const user = PrivilegesView.getAddPrivilegeToUserUser();
  const privilegeValue = prepareValueField(
    PrivilegesView.getAddPrivilegeToUserValue(),
    PrivilegesView.getAddPrivilegeToUserValueTextarea(),
    privilegeType
  );

  const addPrivilegeToUserCancel = PrivilegesView.addPrivilegeToUserCancel(
    addPrivilegeToUserModal
  );
  addPrivilegeToUserCancel.off('.noginModal');
  addPrivilegeToUserCancel.on('click.noginModal', () => {
    addPrivilegeToUserModal.modal('hide');
  });
  addPrivilegeToUserModal.modal('show');

  const addPrivilegeToUserSubmit = PrivilegesView.addPrivilegeToUserSubmit(
    addPrivilegeToUserModal
  );
  addPrivilegeToUserSubmit.off('.noginModal');
  addPrivilegeToUserSubmit.on('click.noginModal', async () => {
    try {
      // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
      // if (user.validity.tooShort) {
      if (user.value.length < tooShort) {
        user.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          addPrivilegeToUserForm[0]
        ).reportValidity();
        return;
      }
      if (!validatePrivilegeJSON(privilegeValue, privilegeType)) {
        /** @type {HTMLFormElement} */ (
          addPrivilegeToUserForm[0]
        ).reportValidity();
        return;
      }
      await addPrivilegeToUser(
        user.value,
        privilegeName,
        privilegeType === 'number'
          ? Number(privilegeValue.value)
          : privilegeValue.value
      );
    } catch (er) {
      addPrivilegeToUserModal.modal('hide');
      const err = /** @type {AjaxPostError} */ (er);
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
  const privilegeToAdd = /** @type {string} */ (e.target.dataset.privilege);
  const privilegeType = /** @type {string} */ (e.target.dataset.type);
  const groupName = PrivilegesView.getAddPrivilegeToGroupGroup();
  const privilegeValue = prepareValueField(
    PrivilegesView.getAddPrivilegeToGroupValue(),
    PrivilegesView.getAddPrivilegeToGroupValueTextarea(),
    privilegeType
  );

  const addPrivilegeToGroupCancel = PrivilegesView.addPrivilegeToGroupCancel(
    addPrivilegeToGroupModal
  );

  addPrivilegeToGroupCancel.off('.noginModal');
  addPrivilegeToGroupCancel.on('click.noginModal', () => {
    addPrivilegeToGroupModal.modal('hide');
  });
  addPrivilegeToGroupModal.modal('show');

  const addPrivilegeToGroupSubmit = PrivilegesView.addPrivilegeToGroupSubmit(
    addPrivilegeToGroupModal
  );
  addPrivilegeToGroupSubmit.off('.noginModal');
  addPrivilegeToGroupSubmit.on('click.noginModal', async () => {
    try {
      // todo[cypress@>=17.0.0]: Restore if Cypress reports this correctly.
      // if (groupName.validity.tooShort) {
      if (groupName.value.length < tooShort) {
        groupName.setCustomValidity(
          PrivilegesView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          addPrivilegeToGroupForm[0]
        ).reportValidity();
        return;
      }
      if (!validatePrivilegeJSON(privilegeValue, privilegeType)) {
        /** @type {HTMLFormElement} */ (
          addPrivilegeToGroupForm[0]
        ).reportValidity();
        return;
      }
      await addPrivilegeToGroup(
        groupName.value,
        privilegeToAdd,
        privilegeType === 'number'
          ? Number(privilegeValue.value)
          : privilegeValue.value
      );
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

const removePrivilegeFromUserConfirmDialog =
  PrivilegesView.setRemovePrivilegeFromUser();
PrivilegesView.getRemovePrivilegeFromUser().on('click', (e) => {
  const userID = /** @type {string} */ (e.target.dataset.user);
  const privilegeName = /** @type {string} */ (e.target.dataset.privilege);
  ConfirmDialog.getSubmit(
    removePrivilegeFromUserConfirmDialog
  ).on('click', async () => {
    try {
      await removePrivilegeFromUser(userID, privilegeName);
    } catch (er) {
      const err = /** @type {AjaxPostError} */ (er);
      showLockedErrorAlert({message: err.text});
    }
  });
  removePrivilegeFromUserConfirmDialog.modal('show');
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
 * @param {string} privilegeName
 * @returns {Promise<void>}
 */
async function removePrivilegeFromGroup (groupName, privilegeName) {
  removePrivilegeFromGroupConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {
    verb: 'removePrivilegeFromGroup', groupName, privilegeName
  });
  showLockedAlertReload({type: 'privilegeRemovedFromGroup'});
}

/**
 * @param {string} privilegeToCreate
 * @param {string} description
 * @param {string} type
 * @param {boolean} userVarying
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function createPrivilege (
  privilegeToCreate, description, type, userVarying
) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'createPrivilege',
    privilegeName: privilegeToCreate,
    description,
    type,
    userVarying
  });
  createPrivilegeModal.modal('hide');
  showLockedAlertReload({type: 'privilegeCreated'});
}

/**
 * @param {string} privilegeName
 * @param {string} newPrivilegeName
 * @param {string} description
 * @param {string} type
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function editPrivilege (
  privilegeName, newPrivilegeName, description, type
) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'editPrivilege', privilegeName, newPrivilegeName, description, type
  });
  editPrivilegeModal.modal('hide');
  showLockedAlertReload({type: 'privilegeEdited'});
}

/**
 * @param {string} groupName
 * @param {string} privilegeName
 * @param {string|number} value
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function addPrivilegeToGroup (groupName, privilegeName, value) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'addPrivilegeToGroup', groupName, privilegeName, value
  });
  addPrivilegeToGroupModal.modal('hide');
  showLockedAlertReload({type: 'privilegeAddedToGroup'});
}

/**
 * @param {string} userID
 * @param {string} privilegeName
 * @param {string|number} value
 * @returns {Promise<void>}
 */
async function addPrivilegeToUser (userID, privilegeName, value) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'addPrivilegeToUser', userID, privilegeName, value
  });
  addPrivilegeToUserModal.modal('hide');
  showLockedAlertReload({type: 'privilegeAddedToUser'});
}

/**
 * @param {string} userID
 * @param {string} privilegeName
 * @returns {Promise<void>}
 */
async function removePrivilegeFromUser (userID, privilegeName) {
  removePrivilegeFromUserConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {
    verb: 'removePrivilegeFromUser', userID, privilegeName
  });
  showLockedAlertReload({type: 'privilegeRemovedFromUser'});
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
 *   "privilegeRemovedFromGroup"|"privilegeAddedToGroup"|
 *   "privilegeRemovedFromUser"|"privilegeAddedToUser"} cfg.type
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
    // eslint-disable-next-line unicorn/no-invalid-argument-count -- Ok
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
    // eslint-disable-next-line unicorn/no-invalid-argument-count -- Ok
    location.reload(true);
  };
  PrivilegesView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

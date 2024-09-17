/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import '../polyfills/Error.js';
import '../polyfills/console.js';

import ConfirmDialog from '../views/utilities/ConfirmDialog.js';
import GroupsView from '../views/groups.js';

/**
 * @typedef {Error & {
 *   text: string,
 *   responseText: string,
 *   statusText?: string
 * }} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

const createGroupButton = GroupsView.getCreateGroupButton();
const createGroupModal = GroupsView.createGroupModal();
const createGroupForm = GroupsView.createGroupForm(
  createGroupModal
);

createGroupForm.on('submit', function (e) {
  e.preventDefault();
});
createGroupButton.on('click', () => {
  const createGroupCancel = GroupsView.createGroupCancel(
    createGroupModal
  );

  createGroupCancel.on('click', () => {
    createGroupModal.modal('hide');
  });
  createGroupModal.modal('show');

  const createGroupSubmit = GroupsView.createGroupSubmit(
    createGroupModal
  );
  createGroupSubmit.on('click', async () => {
    try {
      const groupToCreate = GroupsView.getCreateGroupName();
      if (groupToCreate.validity.tooShort) {
        groupToCreate.setCustomValidity(
          GroupsView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (createGroupForm[0]).reportValidity();
        return;
      }
      await createGroup(groupToCreate.value);
    } catch (er) {
      createGroupModal.modal('hide');
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

const renameGroupButton = GroupsView.getRenameGroupButton();
const renameGroupModal = GroupsView.renameGroupModal();
const renameGroupForm = GroupsView.renameGroupForm(
  renameGroupModal
);

renameGroupForm.on('submit', function (e) {
  e.preventDefault();
});
renameGroupButton.on('click', (e) => {
  const groupName = /** @type {string} */ (e.target.dataset.group);
  const groupToRename = GroupsView.getRenameGroupName();

  const renameGroupCancel = GroupsView.renameGroupCancel(
    renameGroupModal
  );

  renameGroupCancel.on('click', () => {
    renameGroupModal.modal('hide');
  });
  renameGroupModal.modal('show');
  groupToRename.value = groupName;

  const renameGroupSubmit = GroupsView.renameGroupSubmit(
    renameGroupModal
  );
  renameGroupSubmit.on('click', async () => {
    try {
      if (groupToRename.validity.tooShort) {
        groupToRename.setCustomValidity(
          GroupsView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (renameGroupForm[0]).reportValidity();
        return;
      }
      const newGroupName = groupToRename.value;
      await renameGroup(groupName, newGroupName);
    } catch (er) {
      renameGroupModal.modal('hide');
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

const addUserToGroupButton = GroupsView.getAddUserToGroupButton();
const addUserToGroupModal = GroupsView.addUserToGroupModal();
const addUserToGroupForm = GroupsView.addUserToGroupForm(
  addUserToGroupModal
);

addUserToGroupForm.on('submit', function (e) {
  e.preventDefault();
});
addUserToGroupButton.on('click', (e) => {
  const groupName = /** @type {string} */ (e.target.dataset.group);
  const userToAdd = GroupsView.getAddUserToGroupName();

  const addUserToGroupCancel = GroupsView.addUserToGroupCancel(
    addUserToGroupModal
  );

  addUserToGroupCancel.on('click', () => {
    addUserToGroupModal.modal('hide');
  });
  addUserToGroupModal.modal('show');

  const addUserToGroupSubmit = GroupsView.addUserToGroupSubmit(
    addUserToGroupModal
  );
  addUserToGroupSubmit.on('click', async () => {
    try {
      if (userToAdd.validity.tooShort) {
        userToAdd.setCustomValidity(
          GroupsView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (addUserToGroupForm[0]).reportValidity();
        return;
      }
      const userID = userToAdd.value;
      await addUserToGroup(groupName, userID);
    } catch (er) {
      addUserToGroupModal.modal('hide');
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

const addPrivilegeToGroupButton = GroupsView.getAddPrivilegeToGroupButton();
const addPrivilegeToGroupModal = GroupsView.addPrivilegeToGroupModal();
const addPrivilegeToGroupForm = GroupsView.addPrivilegeToGroupForm(
  addPrivilegeToGroupModal
);

addPrivilegeToGroupForm.on('submit', function (e) {
  e.preventDefault();
});
addPrivilegeToGroupButton.on('click', (e) => {
  const privilegeToAdd = GroupsView.getAddPrivilegeToGroupGroup();
  const groupName = /** @type {string} */ (e.target.dataset.group);

  const addPrivilegeToGroupCancel = GroupsView.addPrivilegeToGroupCancel(
    addPrivilegeToGroupModal
  );

  addPrivilegeToGroupCancel.on('click', () => {
    addPrivilegeToGroupModal.modal('hide');
  });
  addPrivilegeToGroupModal.modal('show');

  const addPrivilegeToGroupSubmit = GroupsView.addPrivilegeToGroupSubmit(
    addPrivilegeToGroupModal
  );
  addPrivilegeToGroupSubmit.on('click', async () => {
    try {
      if (privilegeToAdd.validity.tooShort) {
        privilegeToAdd.setCustomValidity(
          GroupsView.errorMessages.name.PleaseEnterName
        );
        /** @type {HTMLFormElement} */ (
          addPrivilegeToGroupForm[0]
        ).reportValidity();
        return;
      }
      await addPrivilegeToGroup(groupName, privilegeToAdd.value);
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

/**
 * @param {string} groupName
 * @param {string} privilegeName
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function addPrivilegeToGroup (groupName, privilegeName) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'addPrivilegeToGroup', groupName, privilegeName
  });
  addPrivilegeToGroupModal.modal('hide');
  showLockedAlertReload({type: 'privilegeAddedToGroup'});
}

const removePrivilegeFromGroupConfirmDialog =
  GroupsView.setRemovePrivilegeFromGroup();
GroupsView.getRemovePrivilegeFromGroup().on('click', (e) => {
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

/** @type {string} */
let group;

/** @type {import('../views/utilities/AlertDialog.js').JQueryWithModal} */
let deleteGroupConfirmDialog;
GroupsView.getDeleteGroups().on('click', (e) => {
  // eslint-disable-next-line prefer-destructuring -- TS
  group = /** @type {string} */ (e.target.dataset.group);

  // handle group deletion
  deleteGroupConfirmDialog = GroupsView.setDeleteGroup(group);
  ConfirmDialog.getSubmit(
    deleteGroupConfirmDialog
  ).on('click', async () => {
    try {
      await deleteGroup();
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
  deleteGroupConfirmDialog.modal('show');
});

const removeUserFromGroupConfirmDialog = GroupsView.setRemoveUserFromGroup();
GroupsView.getRemoveUserFromGroup().on('click', (e) => {
  const groupName = /** @type {string} */ (e.target.dataset.group);
  const userID = /** @type {string} */ (e.target.dataset.user);
  ConfirmDialog.getSubmit(
    removeUserFromGroupConfirmDialog
  ).on('click', async () => {
    try {
      await removeUserFromGroup(groupName, userID);
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
  removeUserFromGroupConfirmDialog.modal('show');
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
 * @param {string} userID
 * @returns {Promise<void>}
 */
async function removeUserFromGroup (groupName, userID) {
  removeUserFromGroupConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {
    verb: 'removeUserFromGroup', groupName, userID
  });
  showLockedAlertReload({type: 'userRemovedFromGroup'});
}

/**
 * @param {string} groupToCreate
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function createGroup (groupToCreate) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'createGroup', groupName: groupToCreate
  });
  createGroupModal.modal('hide');
  showLockedAlertReload({type: 'groupCreated'});
}

/**
 * @param {string} groupName
 * @param {string} newGroupName
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function renameGroup (groupName, newGroupName) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'renameGroup', groupName, newGroupName
  });
  renameGroupModal.modal('hide');
  showLockedAlertReload({type: 'groupRenamed'});
}

/**
 * @param {string} groupName
 * @param {string} userID
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function addUserToGroup (groupName, userID) {
  await post(Nogin.Routes.accessAPI, {
    verb: 'addUserToGroup', groupName, userID
  });
  addUserToGroupModal.modal('hide');
  showLockedAlertReload({type: 'userAddedToGroup'});
}

/**
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function deleteGroup () {
  deleteGroupConfirmDialog.modal('hide');
  await post(Nogin.Routes.accessAPI, {verb: 'deleteGroup', groupName: group});
  showLockedAlertReload({type: 'groupDeleted'});
}

/**
 * @param {object} cfg
 * @param {"groupCreated"|"groupDeleted"|"groupRenamed"|
 *   "userRemovedFromGroup"|"userAddedToGroup"|"privilegeAddedToGroup"|
 *   "privilegeRemovedFromGroup"} cfg.type
 * @returns {void}
 */
function showLockedAlertReload ({type}) {
  const lockedAlertDialog = GroupsView.onShowLockedAlert({
    type,
    group
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  GroupsView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

/**
 * @param {object} cfg
 * @param {"ErrorLoggingOut"|"SessionLost"|"ProblemDispatchingLink"|
 *   "FailureSubmittingGroupInfo"} [cfg.type]
 * @param {string} [cfg.message]
 * @returns {void}
*/
function showLockedErrorAlert ({type, message}) {
  const lockedAlertDialog = GroupsView.onShowLockedErrorAlert({
    type, message, group
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  GroupsView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}



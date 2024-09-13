/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

import '../polyfills/Error.js';
import '../polyfills/console.js';

import ConfirmDialog from '../views/utilities/ConfirmDialog.js';
import UsersView from '../views/users.js';

/**
 * @typedef {Error & {
 *   text: string,
 *   responseText: string,
 *   statusText?: string
 * }} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

/** @type {{user: string}} */
const info = {user: ''};

const deleteAllAccountsConfirmDialog = UsersView.setDeleteAllAccounts();
UsersView.getDeleteAllAccounts().on('click', () => {
  ConfirmDialog.getSubmit(
    deleteAllAccountsConfirmDialog
  ).on('click', async () => {
    try {
      await deleteAllAccounts();
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
  deleteAllAccountsConfirmDialog.modal('show');
});

/** @type {import('../views/utilities/AlertDialog.js').JQueryWithModal} */
let deleteAccountConfirmDialog;
UsersView.getDeleteAccounts().on('click', (e) => {
  info.user = /** @type {string} */ (e.target.dataset.user);

  // handle account deletion
  deleteAccountConfirmDialog = UsersView.setDeleteAccount(info);
  ConfirmDialog.getSubmit(
    deleteAccountConfirmDialog
  ).on('click', async () => {
    try {
      await deleteAccount();
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
  deleteAccountConfirmDialog.modal('show');
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
 * @returns {Promise<void>}
 */
async function deleteAllAccounts () {
  deleteAllAccountsConfirmDialog.modal('hide');
  await post(Nogin.Routes.reset, {user: info.user});
  showLockedAlertRedirect({type: 'allUserAccountsDeleted'});
}

/**
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function deleteAccount () {
  deleteAccountConfirmDialog.modal('hide');
  await post(Nogin.Routes.delete, {user: info.user});
  showLockedAlertReload({type: 'userAccountDeleted'});
}

/**
 * @param {object} cfg
 * @param {"userAccountDeleted"} cfg.type
 * @returns {void}
 */
function showLockedAlertReload ({type}) {
  const lockedAlertDialog = UsersView.onShowLockedAlert({
    type,
    user: info.user
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  UsersView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

/**
 * @param {object} cfg
 * @param {"allUserAccountsDeleted"} cfg.type
 * @returns {void}
 */
function showLockedAlertRedirect ({type}) {
  const lockedAlertDialog = UsersView.onShowLockedAlert({type});
  lockedAlertDialog.modal('show');
  const redirectToRoot = () => {
    Nogin.redirect('root');
  };
  UsersView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', redirectToRoot);
  setTimeout(redirectToRoot, 3000);
}

/**
 * @param {object} cfg
 * @param {"ErrorLoggingOut"|"SessionLost"|"ProblemDispatchingLink"|
 *   "FailureSubmittingUserInfo"} [cfg.type]
 * @param {string} [cfg.message]
 * @returns {void}
*/
function showLockedErrorAlert ({type, message}) {
  const lockedAlertDialog = UsersView.onShowLockedErrorAlert({
    type, message, user: info.user
  });
  lockedAlertDialog.modal('show');
  const refresh = () => {
    // @ts-expect-error Ok
    location.reload(true);
  };
  UsersView.getLockedAlertButton(
    lockedAlertDialog
  ).on('click', refresh);
  setTimeout(refresh, 3000);
}

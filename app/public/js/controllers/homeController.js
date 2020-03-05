/* globals $, _, AccountValidator, ajaxFormClientSideValidate, HomeView */
'use strict';

(() => {
// User name field
const name = HomeView.getName();
name.focus();

// Disable user field
const user = HomeView.getUser();
user.attr('disabled', 'disabled');

// handle account deletion
const deleteAccountConfirmDialog = HomeView.setDeleteAccount();
HomeView.getDeleteAccountSubmit(deleteAccountConfirmDialog).click(async () => {
  try {
    await deleteAccount();
  } catch (err) {
    // Log just in case not internationalized
    console.error(_('ErrorFormat', {
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

const logoutButton = HomeView.getLogoutButton();
// handle user logout
logoutButton.click(async () => {
  try {
    await attemptLogout();
  } catch (err) {
    // Log in case actual error not internationalized
    console.error(_('ErrorFormat', {
      text: err.text,
      statusText:
        // istanbul ignore next
        err.statusText ||
        ''
    }));
    showLockedErrorAlert({type: 'ErrorLoggingOut', redirect: false});
  }
});

// confirm account deletion
const accountForm = HomeView.setAccountSettings();
HomeView.getDeleteAccountAction(accountForm).click(() => {
  deleteAccountConfirmDialog.modal('show');
});
setupValidationSubmission();

/**
 * @returns {void}
 */
function setupValidationSubmission () {
  const av = new AccountValidator();
  ajaxFormClientSideValidate(accountForm, {
    validate () {
      av.validateForm();
    },
    beforeSubmit (formData, jqForm, options) {
      // Push the disabled username field onto the form data array
      formData.push({
        name: 'user', value: user.val()
      });
      return true;
    },
    success (responseText, status, xhr, $form) {
      if (status === 'success') {
        onUpdateSuccess();
      }
    },
    error (e) {
      switch (e.responseText) {
      case 'email-taken':
        av.showInvalidEmail();
        break;
      case 'username-taken':
        av.showInvalidUserName();
        break;
      default:
        break;
      }
    }
  });
}

/**
 * @returns {void}
 */
function onUpdateSuccess () {
  const accountUpdatedAlertDialog = HomeView.onAccountUpdated();
  accountUpdatedAlertDialog.modal('show');
  HomeView.getAccountUpdatedButton(accountUpdatedAlertDialog).off('click');
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
function post (url) {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    $.ajax(url, {type: 'post'}).done(resolve).fail(
      (jqXHR /* , textStatus, errorThrown */) => {
        const err = new Error();
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
async function deleteAccount () {
  deleteAccountConfirmDialog.modal('hide');
  await post('/delete');
  showLockedAlert({type: 'accountDeleted'});
}

/**
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function attemptLogout () {
  await post('/logout');
  showLockedAlert({type: 'loggedOut'});
}

/**
 * @param {PlainObject} cfg
 * @param {"accountDeleted"|"loggedOut"} cfg.type
 * @returns {void}
 */
function showLockedAlert ({type}) {
  const lockedAlertDialog = HomeView.onShowLockedAlert({type});
  lockedAlertDialog.modal('show');
  const redirectToRoot = () => {
    location.href = '/';
  };
  HomeView.getLockedAlertButton(lockedAlertDialog).click(redirectToRoot);
  setTimeout(redirectToRoot, 3000);
}

/**
 * @param {PlainObject} cfg
 * @param {string} cfg.message
 * @param {boolean} [cfg.redirect=true]
 * @returns {void}
*/
function showLockedErrorAlert ({message, redirect = true}) {
  const lockedAlertDialog = HomeView.onShowLockedErrorAlert({message});
  lockedAlertDialog.modal('show');
  if (redirect) {
    const redirectToRoot = () => {
      location.href = '/';
    };
    HomeView.getLockedAlertButton(lockedAlertDialog).click(redirectToRoot);
    setTimeout(redirectToRoot, 3000);
  }
}
})();

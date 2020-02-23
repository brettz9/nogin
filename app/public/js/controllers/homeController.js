/* globals _, AccountValidator, ajaxFormClientSideValidate, HomeView */
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
    console.error(_('ErrorFormat', {
      text: err.text,
      statusText: err.statusText
    }));
  }
});

const logoutButton = HomeView.getLogoutButton();
// handle user logout
logoutButton.click(async () => {
  try {
    await attemptLogout();
  } catch (err) {
    console.error(_('ErrorFormat', {
      text: err.text,
      statusText: err.statusText
    }));
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
 * @param {Response} resp
 * @throws {Error}
 * @returns {void}
 */
async function checkErrors (resp) {
  if (!resp.ok) {
    const err = new Error();
    err.text = await resp.text();
    err.responseText = resp.statusText;
    throw err;
  }
}

/**
 * @returns {void}
 */
async function deleteAccount () {
  deleteAccountConfirmDialog.modal('hide');
  const resp = await fetch('/delete', {
    method: 'POST'
  });
  await checkErrors(resp);
  showLockedAlert('accountDeleted');
}

/**
 * @returns {void}
 */
async function attemptLogout () {
  const resp = await fetch('/logout', {
    method: 'POST'
  });
  await checkErrors(resp);
  showLockedAlert('loggedOut');
}

/**
 * @param {"accountDeleted"|"loggedOut"} type
 * @returns {void}
 */
function showLockedAlert (type) {
  const lockedAlertDialog = HomeView.onShowLockedAlert(type);
  lockedAlertDialog.modal('show');
  const redirectToRoot = () => {
    location.href = '/';
  };
  HomeView.getLockedAlertButton(lockedAlertDialog).click(redirectToRoot);
  setTimeout(redirectToRoot, 3000);
}
})();

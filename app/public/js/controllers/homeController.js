/* globals $, Nogin */

import '../polyfills/Error.js';
import '../polyfills/console.js';

import ajaxFormClientSideValidate from
  '../utilities/ajaxFormClientSideValidate.js';

import ConfirmDialog from '../views/utilities/ConfirmDialog.js';
import HomeView from '../views/home.js';
import AccountValidator from '../form-validators/AccountValidator.js';

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

// User name field
const name = HomeView.getName();
name.focus();

// Disable user field
const user = HomeView.getUser();
user.attr('disabled', 'disabled');

// handle account deletion
const deleteAccountConfirmDialog = HomeView.setDeleteAccount();
ConfirmDialog.getAccountSubmit(deleteAccountConfirmDialog).click(async () => {
  try {
    await deleteAccount();
  } catch (err) {
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

const logoutButton = HomeView.getLogoutButton();
// handle user logout
logoutButton.click(async () => {
  try {
    await attemptLogout();
  } catch (err) {
    // Log in case actual error not internationalized
    console.error(Nogin._('ErrorFormat', {
      text: err.text,
      statusText:
        // istanbul ignore next
        err.statusText ||
        ''
    }));
    showLockedErrorAlert({type: 'ErrorLoggingOut'});
  }
});

// confirm account deletion
const accountForm = HomeView.setAccountSettings();
HomeView.getDeleteAccountAction(accountForm).click(() => {
  deleteAccountConfirmDialog.modal('show');
});
setupValidationSubmission();

/**
 * @returns {boolean}
 */
function emailHasChanged () {
  const email = HomeView.getEmail();
  return email[0].value !== email[0].defaultValue;
}

/**
 * @returns {void}
 */
function setupValidationSubmission () {
  let confirmed = false;
  const av = new AccountValidator();
  accountForm[0].addEventListener('submit', (e) => {
    const submissionOkToContinue = confirmed ||
      !emailHasChanged();
    if (submissionOkToContinue) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const emailChangeConfirmDialog = HomeView.onShowConfirmation({
      type: 'AppearsChangingEmail'
    });
    emailChangeConfirmDialog.modal('show');
    ConfirmDialog.getAccountSubmit(emailChangeConfirmDialog).click(() => {
      confirmed = true;
      accountForm.submit();
      emailChangeConfirmDialog.modal('hide');
    });
  }, true);
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
      // "nocontent" (204), "notmodified" (304), "parseerror" (JSON or XML)
      // istanbul ignore else
      if (status === 'success') {
        onUpdateSuccess();
      }
      confirmed = false; // Allow resubmission
    },
    error (e) {
      confirmed = false; // Allow resubmission
      switch (e.responseText) {
      case 'email-taken':
        av.showInvalidEmail();
        break;
      case 'session-lost': {
        showLockedErrorAlert({type: 'SessionLost'});
        break;
      } case 'problem-dispatching-link': {
        showLockedErrorAlert({type: 'ProblemDispatchingLink'});
        break;
      } default:
        HomeView.onShowLockedErrorAlert({type: 'FailureSubmittingUserInfo'});
        break;
      }
    }
  });
}

/**
 * @returns {void}
 */
function onUpdateSuccess () {
  const accountUpdatedAlertDialog = emailHasChanged()
    ? HomeView.onAccountUpdatedButNotYetEmail()
    : HomeView.onAccountUpdated();
  accountUpdatedAlertDialog.modal('show');
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
function post (url) {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    $.ajax(url, {
      type: 'post',
      headers: {
        'X-XSRF-Token': xsrfCookie
      }
    }).done(resolve).fail(
      (jqXHR /* , textStatus, errorThrown */) => {
        const err = new Error('Ajax POST error');
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
  await post(Nogin.Routes.delete);
  showLockedAlert({type: 'accountDeleted'});
}

/**
 * @throws {Error}
 * @returns {Promise<void>}
 */
async function attemptLogout () {
  await post(Nogin.Routes.logout);
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
    Nogin.redirect('root');
  };
  HomeView.getLockedAlertButton(lockedAlertDialog).click(redirectToRoot);
  setTimeout(redirectToRoot, 3000);
}

/**
 * @param {PlainObject} cfg
 * @param {"ErrorLoggingOut"} cfg.type
 * @param {string} cfg.message
 * @returns {void}
*/
function showLockedErrorAlert ({type, message}) {
  const lockedAlertDialog = HomeView.onShowLockedErrorAlert({type, message});
  lockedAlertDialog.modal('show');
  const redirectToRoot = () => {
    Nogin.redirect('root');
  };
  HomeView.getLockedAlertButton(lockedAlertDialog).click(redirectToRoot);
  setTimeout(redirectToRoot, 3000);
}

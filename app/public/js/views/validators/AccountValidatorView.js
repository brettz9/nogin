/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */

const {_} = Nogin;

/**
 * @typedef {object} AccountInfoElements
 * @property {HTMLInputElement} name
 * @property {HTMLInputElement} email
 * @property {HTMLInputElement} user
 * @property {HTMLInputElement} pass
 * @property {HTMLInputElement} passConfirm
 */

const AccountValidatorView = {
  /**
   * @returns {HTMLFormElement}
   */
  getForm () {
    return /** @type {HTMLFormElement} */ ($('[data-name=account-form]')[0]);
  },

  /**
   * @returns {JQuery}
   */
  getUserId () {
    return $('#userId');
  },

  /**
   * @returns {AccountInfoElements}
   */
  getFormFields () {
    return {
      name: /** @type {HTMLInputElement} */ ($('[data-name="name"]')[0]),
      email: /** @type {HTMLInputElement} */ ($('[data-name="email"]')[0]),
      user: /** @type {HTMLInputElement} */ ($('[data-name="user"]')[0]),
      pass: /** @type {HTMLInputElement} */ ($('[data-name="pass"]')[0]),
      passConfirm: $('[data-name="pass-confirm"]') &&
      /** @type {HTMLInputElement} */ ($('[data-name="pass-confirm"]')[0])
    };
  },

  /**
   * @type {{[key: string]: {[key: string]: string}}}
   */
  errorMessages: {
    name: {
      PleaseEnterName: /** @type {string} */ (_('PleaseEnterName'))
    },
    email: {
      emailAddressAlreadyInUse: /** @type {string} */ (
        _('emailAddressAlreadyInUse')
      ),
      PleaseEnterValidEmail: /** @type {string} */ (_('PleaseEnterValidEmail'))
    },
    user: {
      userNameAlreadyInUse: /** @type {string} */ (_('userNameAlreadyInUse')),
      PleaseChooseUserName: /** @type {string} */ (_('PleaseChooseUserName'))
    },
    pass: {
      PasswordMinimumLength: /** @type {string} */ (_('PasswordMinimumLength')),
      PasswordsDontMatch: /** @type {string} */ (_('PasswordsDontMatch'))
    }
  }
};

export default AccountValidatorView;

/* globals $, Nogin */

const {_} = Nogin;

/**
* @typedef {PlainObject} AccountInfoElements
* @property {external:jQuery} name
* @property {external:jQuery} email
* @property {external:jQuery} user
* @property {external:jQuery} pass
*/

const AccountValidatorView = {
  /**
   * @returns {HTMLFormElement}
   */
  getForm () {
    return $('[data-name=account-form]')[0];
  },

  /**
   * @returns {external:jQuery}
   */
  getUserId () {
    return $('#userId');
  },

  /**
   * @returns {AccountInfoElements}
   */
  getFormFields () {
    return {
      name: $('[data-name="name"]')[0],
      email: $('[data-name="email"]')[0],
      user: $('[data-name="user"]')[0],
      pass: $('[data-name="pass"]')[0],
      passConfirm: $('[data-name="pass-confirm"]') &&
        $('[data-name="pass-confirm"]')[0]
    };
  },

  /**
   * @type {PlainObject<string,PlainObject<string,string>>}
   */
  errorMessages: {
    name: {
      PleaseEnterName: _('PleaseEnterName')
    },
    email: {
      emailAddressAlreadyInUse: _('emailAddressAlreadyInUse'),
      PleaseEnterValidEmail: _('PleaseEnterValidEmail')
    },
    user: {
      userNameAlreadyInUse: _('userNameAlreadyInUse'),
      PleaseChooseUserName: _('PleaseChooseUserName')
    },
    pass: {
      PasswordMinimumLength: _('PasswordMinimumLength'),
      PasswordsDontMatch: _('PasswordsDontMatch')
    }
  }
};

export default AccountValidatorView;

/* globals $, Nogin */

const LoginView = {
  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getInputForInitialFocus () {
    return $('input:text:visible:first');
  },
  /**
   * @returns {JQuery} `HTMLDivElement`
   */
  getLoginModal () {
    return $('#login');
  },

  /**
   * @returns {import('../views/utilities/AlertDialog.js').
   *   JQueryWithModal} `HTMLDivElement`
   */
  retrievePasswordModal () {
    const retrievePasswordModal =
      /**
       * @type {import('../views/utilities/AlertDialog.js').
       *   JQueryWithModal}
       */ (
        $('#retrieve-password')
      );
    retrievePasswordModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return retrievePasswordModal;
  },

  /**
   * @param {JQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm} `HTMLFormElement`
   */
  retrievePasswordForm (retrievePasswordModal) {
    return (
      /**
       * @type {import('../utilities/ajaxFormClientSideValidate.js').
       * JQueryWithAjaxForm}
       */
      (retrievePasswordModal.find('#retrieve-password-form'))
    );
  },

  /**
   * @returns {import('../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm
   * } `HTMLFormElement`
   */
  getLoginForm () {
    return (
      /**
       * @type {import('../utilities/ajaxFormClientSideValidate.js').
       *   JQueryWithAjaxForm}
       */ ($('[data-name=login] form'))
    );
  },

  /**
   * @param {JQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  retrievePasswordSubmit (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name=retrieve-password-submit]');
  },

  /**
   * @param {JQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {JQuery} `HTMLButtonElement`
   */
  retrievePasswordCancel (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name=retrieve-password-cancel]');
  },

  /**
   * @param {JQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {JQuery} `HTMLInputElement`
   */
  retrieveLostPasswordEmail (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name="email"]');
  },

  /**
   * @param {JQuery} loginModal `HTMLDivElement`
   * @returns {JQuery} `HTMLInputElement`
   */
  getLostPasswordUsername (loginModal) {
    return loginModal.find('[data-name="user"]');
  },

  /**
   * @param {JQuery} loginModal
   * @returns {JQuery} `HTMLDivElement`
   */
  getForgotPassword (loginModal) {
    return loginModal.find('[data-name="forgot-password"]');
  },

  /**
  * @param {JQuery} loginModal
  * @returns {JQuery} `HTMLButtonElement`
  */
  getRememberMeButton (loginModal) {
    return loginModal.find('button.remember-me');
  },

  /**
  * @param {JQuery} loginModal
  * @returns {boolean}
  */
  isRememberMeChecked (loginModal) {
    return this.getRememberMeButton(loginModal).find('span').hasClass(
      'fa-check-square'
    );
  },

  /**
  * @param {JQuery} retrievePasswordModal `HTMLDivElement`
  * @returns {JQuery}
  */
  setRetrievePasswordCancel (retrievePasswordModal) {
    return this.retrievePasswordCancel(retrievePasswordModal).text(
      /** @type {string} */ (Nogin._('Cancel'))
    );
  },

  /**
  * @param {JQuery} loginModal
  * @returns {void}
  */
  toggleCheckSquare (loginModal) {
    const span = this.getRememberMeButton(loginModal).find('span');
    // todo[cypress@>=14.0.0]: class checking: remove this disabling of
    //   istanbul to see if fixed
    // istanbul ignore if
    if (span.hasClass('fa-minus-square')) {
      span.removeClass('fa-minus-square').
        addClass('fa-check-square');
    } else {
      span.addClass('fa-minus-square').
        removeClass('fa-check-square');
    }
  },

  /**
   * @param {JQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {void}
   */
  switchConfirmToAlert (retrievePasswordModal) {
    this.retrievePasswordCancel(retrievePasswordModal).text('OK');
  }
};

export default LoginView;

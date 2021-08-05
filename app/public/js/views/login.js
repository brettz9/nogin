/* globals $, Nogin */

const LoginView = {
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  getInputForInitialFocus () {
    return $('input:text:visible:first');
  },
  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  getLoginModal () {
    return $('#login');
  },

  /**
   * @returns {external:jQuery} `HTMLDivElement`
   */
  retrievePasswordModal () {
    const retrievePasswordModal = $('#retrieve-password');
    retrievePasswordModal.modal({
      show: false, keyboard: true, backdrop: true
    });
    return retrievePasswordModal;
  },

  /**
   * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {external:jQuery} `HTMLFormElement`
   */
  retrievePasswordForm (retrievePasswordModal) {
    return retrievePasswordModal.find('#retrieve-password-form');
  },

  /**
   * @returns {external:jQuery} `HTMLFormElement`
   */
  getLoginForm () {
    return $('[data-name=login] form');
  },

  /**
   * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  retrievePasswordSubmit (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name=retrieve-password-submit]');
  },

  /**
   * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {external:jQuery} `HTMLButtonElement`
   */
  retrievePasswordCancel (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name=retrieve-password-cancel]');
  },

  /**
   * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {external:jQuery} `HTMLInputElement`
   */
  retrieveLostPasswordEmail (retrievePasswordModal) {
    return retrievePasswordModal.find('[data-name="email"]');
  },

  /**
   * @param {external:jQuery} loginModal `HTMLDivElement`
   * @returns {external:jQuery} `HTMLInputElement`
   */
  getLostPasswordUsername (loginModal) {
    return loginModal.find('[data-name="user"]');
  },

  /**
   * @param {external:jQuery} loginModal
   * @returns {external:jQuery} `HTMLDivElement`
   */
  getForgotPassword (loginModal) {
    return loginModal.find('[data-name="forgot-password"]');
  },

  /**
  * @param {external:jQuery} loginModal
  * @returns {external:jQuery} `HTMLButtonElement`
  */
  getRememberMeButton (loginModal) {
    return loginModal.find('button.remember-me');
  },

  /**
  * @param {external:jQuery} loginModal
  * @returns {boolean}
  */
  isRememberMeChecked (loginModal) {
    return this.getRememberMeButton(loginModal).find('span').hasClass(
      'fa-check-square'
    );
  },

  /**
  * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
  * @returns {void}
  */
  setRetrievePasswordCancel (retrievePasswordModal) {
    return this.retrievePasswordCancel(retrievePasswordModal).text(
      Nogin._('Cancel')
    );
  },

  /**
  * @param {external:jQuery} loginModal
  * @returns {void}
  */
  toggleCheckSquare (loginModal) {
    const span = this.getRememberMeButton(loginModal).find('span');
    // todo[cypress@>9.0.0]: class checking: remove this disabling of
    //   istanbul to see if fixed
    // istanbul ignore if
    if (span.hasClass('fa-minus-square')) {
      span.removeClass('fa-minus-square')
        .addClass('fa-check-square');
    } else {
      span.addClass('fa-minus-square')
        .removeClass('fa-check-square');
    }
  },

  /**
   * @param {external:jQuery} retrievePasswordModal `HTMLDivElement`
   * @returns {void}
   */
  switchConfirmToAlert (retrievePasswordModal) {
    this.retrievePasswordCancel(retrievePasswordModal).text('OK');
  }
};

export default LoginView;

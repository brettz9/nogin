/* globals $ */

/**
 * @typedef {JQuery & {
 *   modal: (showOrHide: "show"|"hide"|{
 *     show: boolean,
 *     keyboard: boolean,
 *     backdrop: boolean|"static"
 *   }) => JQueryWithModal
 * }} JQueryWithModal
 */

const AlertDialog = {
  /**
   * @param {object} cfg
   * @param {string} cfg.heading
   * @param {Element|string} cfg.body
   * @param {boolean} cfg.keyboard
   * @param {boolean|"static"} cfg.backdrop
   * @returns {JQueryWithModal} `HTMLDivElement`
   */
  populate ({
    heading,
    body,
    keyboard,
    backdrop
  }) {
    const modal = /** @type {JQueryWithModal} */ (
      $('[data-name=modal-alert]')).modal({
      show: false, keyboard, backdrop
    });
    $('[data-name=modal-alert] .modal-header [data-name=modal-title]').text(
      heading
    );
    $('[data-name=modal-alert] [data-name=modal-body] p').empty().append(body);
    $('[data-name=modal-alert] button').on('click', (e) => {
      e.preventDefault();
      modal.modal('hide');
    });
    return modal;
  }
};

export default AlertDialog;

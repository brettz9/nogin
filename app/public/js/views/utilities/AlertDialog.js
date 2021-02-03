/* globals $ */

const AlertDialog = {
  /**
   * @param {PlainObject} cfg
   * @param {string} cfg.heading
   * @param {external:jQuery} cfg.body
   * @param {boolean} cfg.keyboard
   * @param {boolean|"static"} cfg.backdrop
   * @returns {external:jQuery} `HTMLDivElement`
   */
  populate ({
    heading,
    body,
    keyboard,
    backdrop
  }) {
    const modal = $('[data-name=modal-alert]').modal({
      show: false, keyboard, backdrop
    });
    $('[data-name=modal-alert] .modal-header [data-name=modal-title]').text(
      heading
    );
    $('[data-name=modal-alert] [data-name=modal-body] p').empty().append(body);
    $('[data-name=modal-alert] button').click((e) => {
      e.preventDefault();
      modal.modal('hide');
    });
    return modal;
  }
};

export default AlertDialog;

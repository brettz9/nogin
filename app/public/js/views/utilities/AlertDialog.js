/* globals $ */
'use strict';

window.AlertDialog = {
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
    $('[data-name=modal-alert]').modal({
      show: false, keyboard, backdrop
    });
    $('[data-name=modal-alert] .modal-header [data-name=modal-title]').text(
      heading
    );
    $('[data-name=modal-alert] [data-name=modal-body] p').empty().append(body);
    return $('[data-name=modal-alert]');
  },

  /**
   * @param {string} msg
   */
  addSuccess (msg) {
    const alrt = $('[data-name=modal-alert]');
    alrt.attr('class', 'alert alert-success');
    alrt.text(msg);
  },

  /**
   * @param {string} msg
   */
  showDanger (msg) {
    const alrt = $('[data-name=modal-alert]');
    alrt.attr('class', 'alert alert-danger');
    alrt.text(msg);
  }
};

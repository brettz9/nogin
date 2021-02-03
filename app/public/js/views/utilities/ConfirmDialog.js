/* globals $ */

const ConfirmDialog = {
  populate ({
    type,
    header,
    body,
    cancel,
    submit
  }) {
    const baseSel = `[data-confirm-type="${type}"][data-name=modal-confirm]`;
    $(baseSel).modal({
      show: false, keyboard: true, backdrop: true
    });
    $(`${baseSel} .modal-header [data-name=modal-title]`).text(
      header
    );
    $(`${baseSel} [data-name=modal-body] p`).empty().append(
      body
    );
    $(`${baseSel} .cancel`).text(cancel).click(() => {
      $(baseSel).modal('hide');
    });
    $(`${baseSel} .submit`).text(submit);
    return $(baseSel);
  },

  /**
   * @param {external:jQuery} confirmDialog
   * @returns {external:jQuery}
   */
  getAccountSubmit (confirmDialog) {
    return confirmDialog.find('.submit');
  }
};

export default ConfirmDialog;

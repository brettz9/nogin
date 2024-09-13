/* globals $ -- `$` is jQuery not ESM */

const ConfirmDialog = {
  /**
   * @param {{
   *   type: string,
   *   header: string,
   *   body: string|Element,
   *   cancel: string,
   *   submit: string
   * }} cfg
   * @returns {import('./AlertDialog.js').JQueryWithModal}
   */
  populate ({
    type,
    header,
    body,
    cancel,
    submit
  }) {
    const baseSel = `[data-confirm-type="${type}"][data-name=modal-confirm]`;
    /** @type {import('./AlertDialog.js').JQueryWithModal} */ (
      $(baseSel)).modal({
      show: false, keyboard: true, backdrop: true
    });
    $(`${baseSel} .modal-header [data-name=modal-title]`).text(
      header
    );
    $(`${baseSel} [data-name=modal-body] p`).empty().append(
      body
    );
    $(`${baseSel} .cancel`).text(cancel).on('click', () => {
      /** @type {import('./AlertDialog.js').JQueryWithModal} */ (
        $(baseSel)
      ).modal('hide');
    });
    $(`${baseSel} .submit`).text(submit);
    return /** @type {import('./AlertDialog.js').JQueryWithModal} */ (
      $(baseSel)
    );
  },

  /**
   * @param {JQuery} confirmDialog
   * @returns {JQuery}
   */
  getSubmit (confirmDialog) {
    return confirmDialog.find('.submit');
  }
};

export default ConfirmDialog;

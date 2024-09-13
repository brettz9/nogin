export default ConfirmDialog;
declare namespace ConfirmDialog {
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
    function populate({ type, header, body, cancel, submit }: {
        type: string;
        header: string;
        body: string | Element;
        cancel: string;
        submit: string;
    }): import("./AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} confirmDialog
     * @returns {JQuery}
     */
    function getSubmit(confirmDialog: JQuery): JQuery;
}
//# sourceMappingURL=ConfirmDialog.d.ts.map
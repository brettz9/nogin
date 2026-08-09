declare const ConfirmDialog: {
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
    populate({ type, header, body, cancel, submit }: {
        type: string;
        header: string;
        body: string | Element;
        cancel: string;
        submit: string;
    }): import('./AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} confirmDialog
     * @returns {JQuery}
     */
    getSubmit(confirmDialog: JQuery): JQuery;
};
export default ConfirmDialog;
//# sourceMappingURL=ConfirmDialog.d.ts.map
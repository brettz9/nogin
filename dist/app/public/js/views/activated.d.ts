export default ActivatedView;
declare namespace ActivatedView {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    function accountActivated(): JQuery & {
        modal: (showOrHide: "show" | "hide") => void;
    };
    /**
     * @param {JQuery} accountFailedActivationAlertDialog
     *  `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getOKButton(accountFailedActivationAlertDialog: JQuery): JQuery;
}
//# sourceMappingURL=activated.d.ts.map
export default ActivationFailedView;
declare namespace ActivationFailedView {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    function accountFailedActivation(): JQuery & {
        modal: (showOrHide: "show" | "hide") => void;
    };
    /**
     * @param {JQuery} accountActivatedAlertDialog `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getOKButton(accountActivatedAlertDialog: JQuery): JQuery;
}
//# sourceMappingURL=activation-failed.d.ts.map
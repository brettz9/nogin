export default ActivationFailedView;
declare namespace ActivationFailedView {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    function accountFailedActivation(): JQuery<HTMLElement> & {
        modal: (showOrHide: "hide" | "show") => void;
    };
    /**
     * @param {JQuery} accountActivatedAlertDialog `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getOKButton(accountActivatedAlertDialog: JQuery<HTMLElement>): JQuery<HTMLElement>;
}
//# sourceMappingURL=activation-failed.d.ts.map
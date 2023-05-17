export default ActivatedView;
declare namespace ActivatedView {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    function accountActivated(): JQuery<HTMLElement> & {
        modal: (showOrHide: "hide" | "show") => void;
    };
    /**
     * @param {JQuery} accountFailedActivationAlertDialog
     *  `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getOKButton(accountFailedActivationAlertDialog: JQuery<HTMLElement>): JQuery<HTMLElement>;
}
//# sourceMappingURL=activated.d.ts.map
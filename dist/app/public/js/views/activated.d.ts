declare const ActivatedView: {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    accountActivated(): JQuery & {
        modal: (showOrHide: "show" | "hide") => void;
    };
    /**
     * @param {JQuery} accountFailedActivationAlertDialog
     *  `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    getOKButton(accountFailedActivationAlertDialog: JQuery): JQuery;
};
export default ActivatedView;
//# sourceMappingURL=activated.d.ts.map
declare const ActivationFailedView: {
    /**
     * @returns {JQuery & {
     *   modal: (showOrHide: "show"|"hide") => void
     * }} `HTMLDivElement`
     */
    accountFailedActivation(): JQuery & {
        modal: (showOrHide: "show" | "hide") => void;
    };
    /**
     * @param {JQuery} accountActivatedAlertDialog `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    getOKButton(accountActivatedAlertDialog: JQuery): JQuery;
};
export default ActivationFailedView;
//# sourceMappingURL=activation-failed.d.ts.map
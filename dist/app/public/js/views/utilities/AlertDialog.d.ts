export default AlertDialog;
export type JQueryWithModal = JQuery & {
    modal: (showOrHide: "show" | "hide" | {
        show: boolean;
        keyboard: boolean;
        backdrop: boolean | "static";
    }) => JQueryWithModal;
};
declare namespace AlertDialog {
    /**
     * @param {object} cfg
     * @param {string} cfg.heading
     * @param {Element|string} cfg.body
     * @param {boolean} cfg.keyboard
     * @param {boolean|"static"} cfg.backdrop
     * @returns {JQueryWithModal} `HTMLDivElement`
     */
    function populate({ heading, body, keyboard, backdrop }: {
        heading: string;
        body: Element | string;
        keyboard: boolean;
        backdrop: boolean | "static";
    }): JQueryWithModal;
}
//# sourceMappingURL=AlertDialog.d.ts.map
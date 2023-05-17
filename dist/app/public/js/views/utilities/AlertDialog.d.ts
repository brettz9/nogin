export default AlertDialog;
export type JQueryWithModal = JQuery<HTMLElement> & {
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
        body: string | Element;
        keyboard: boolean;
        backdrop: boolean | "static";
    }): JQueryWithModal;
}
//# sourceMappingURL=AlertDialog.d.ts.map
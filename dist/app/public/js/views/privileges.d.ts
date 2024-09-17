export default PrivilegesView;
declare namespace PrivilegesView {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getDeletePrivileges(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getRemovePrivilegeFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function createPrivilegeModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function editPrivilegeModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function addPrivilegeToGroupModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function createPrivilegeForm(createPrivilegeModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
    *   JQueryWithAjaxForm} `HTMLFormElement`
    */
    function editPrivilegeForm(editPrivilegeModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function addPrivilegeToGroupForm(addPrivilegeToGroupModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function createPrivilegeSubmit(createPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addPrivilegeToGroupSubmit(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function editPrivilegeSubmit(editPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function createPrivilegeCancel(createPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addPrivilegeToGroupCancel(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function editPrivilegeCancel(editPrivilegeModal: JQuery): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getCreatePrivilegeButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getEditPrivilegeButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getAddPrivilegeToGroupButton(): JQuery;
    /**
     * @returns {HTMLInputElement}
     */
    function getCreatePrivilegeName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getCreatePrivilegeDescription(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getEditPrivilegeDescription(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getAddPrivilegeToGroupGroup(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getEditPrivilege(): HTMLInputElement;
    /**
     * @param {string} privilege
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setDeletePrivilege(privilege: string): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setRemovePrivilegeFromGroup(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"privilegeCreated"|"privilegeDeleted"|"privilegeEdited"|
     *   "privilegeRemovedFromGroup"|"privilegeAddedToGroup"} cfg.type
     * @param {string} [cfg.privilege]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedAlert({ type, privilege }: {
        type: "privilegeCreated" | "privilegeDeleted" | "privilegeEdited" | "privilegeRemovedFromGroup" | "privilegeAddedToGroup";
        privilege?: string | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.privilege
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingPrivilegeInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedErrorAlert({ type, privilege, message }: {
        privilege: string;
        message?: string | undefined;
        type?: "ErrorLoggingOut" | "SessionLost" | "ProblemDispatchingLink" | "FailureSubmittingPrivilegeInfo" | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    let errorMessages: {
        [key: string]: {
            [key: string]: string;
        };
    };
}
//# sourceMappingURL=privileges.d.ts.map
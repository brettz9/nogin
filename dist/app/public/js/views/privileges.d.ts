declare const PrivilegesView: {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getDeletePrivileges(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getRemovePrivilegeFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    createPrivilegeModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    editPrivilegeModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    addPrivilegeToGroupModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    createPrivilegeForm(createPrivilegeModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
    *   JQueryWithAjaxForm} `HTMLFormElement`
    */
    editPrivilegeForm(editPrivilegeModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    addPrivilegeToGroupForm(addPrivilegeToGroupModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    createPrivilegeSubmit(createPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addPrivilegeToGroupSubmit(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    editPrivilegeSubmit(editPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} createPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    createPrivilegeCancel(createPrivilegeModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addPrivilegeToGroupCancel(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} editPrivilegeModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    editPrivilegeCancel(editPrivilegeModal: JQuery): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getCreatePrivilegeButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getEditPrivilegeButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getAddPrivilegeToGroupButton(): JQuery;
    /**
     * @returns {HTMLInputElement}
     */
    getCreatePrivilegeName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getCreatePrivilegeDescription(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getEditPrivilegeDescription(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getAddPrivilegeToGroupGroup(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getEditPrivilege(): HTMLInputElement;
    /**
     * @param {string} privilege
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setDeletePrivilege(privilege: string): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setRemovePrivilegeFromGroup(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"privilegeCreated"|"privilegeDeleted"|"privilegeEdited"|
     *   "privilegeRemovedFromGroup"|"privilegeAddedToGroup"} cfg.type
     * @param {string} [cfg.privilege]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedAlert({ type, privilege }: {
        type: "privilegeCreated" | "privilegeDeleted" | "privilegeEdited" | "privilegeRemovedFromGroup" | "privilegeAddedToGroup";
        privilege?: string;
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.privilege
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingPrivilegeInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedErrorAlert({ type, privilege, message }: {
        privilege: string;
        message?: string;
        type?: "ErrorLoggingOut" | "FailureSubmittingPrivilegeInfo" | "SessionLost" | "ProblemDispatchingLink";
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @type {{[key: string]: {[key: string]: string}}}
     */
    errorMessages: {
        [key: string]: {
            [key: string]: string;
        };
    };
};
export default PrivilegesView;
//# sourceMappingURL=privileges.d.ts.map
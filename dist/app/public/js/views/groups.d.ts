declare const GroupsView: {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getDeleteGroups(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getRemoveUserFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getAddPrivilegeToGroupButton(): JQuery;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    addPrivilegeToGroupModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    addPrivilegeToGroupForm(addPrivilegeToGroupModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @returns {HTMLInputElement}
     */
    getAddPrivilegeToGroupGroup(): HTMLInputElement;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addPrivilegeToGroupCancel(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addPrivilegeToGroupSubmit(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    createGroupModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    renameGroupModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    addUserToGroupModal(): import('../views/utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    createGroupForm(createGroupModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
    *   JQueryWithAjaxForm} `HTMLFormElement`
    */
    renameGroupForm(renameGroupModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    addUserToGroupForm(addUserToGroupModal: JQuery): import('../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    createGroupSubmit(createGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addUserToGroupSubmit(addUserToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    renameGroupSubmit(renameGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    createGroupCancel(createGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    addUserToGroupCancel(addUserToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    renameGroupCancel(renameGroupModal: JQuery): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getCreateGroupButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getRenameGroupButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    getAddUserToGroupButton(): JQuery;
    /**
     * @returns {HTMLInputElement}
     */
    getCreateGroupName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getAddUserToGroupName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    getRenameGroupName(): HTMLInputElement;
    /**
     * @param {string} group
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setDeleteGroup(group: string): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    setRemoveUserFromGroup(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    getRemovePrivilegeFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    setRemovePrivilegeFromGroup(): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"groupCreated"|"groupDeleted"|"groupRenamed"|
     *   "userRemovedFromGroup"|"userAddedToGroup"|
     *   "privilegeAddedToGroup"|"privilegeRemovedFromGroup"} cfg.type
     * @param {string} [cfg.group]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedAlert({ type, group }: {
        type: "groupCreated" | "groupDeleted" | "groupRenamed" | "userRemovedFromGroup" | "userAddedToGroup" | "privilegeAddedToGroup" | "privilegeRemovedFromGroup";
        group?: string;
    }): import('./utilities/AlertDialog.js').JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.group
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingGroupInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    onShowLockedErrorAlert({ type, group, message }: {
        group: string;
        message?: string;
        type?: "ErrorLoggingOut" | "FailureSubmittingGroupInfo" | "SessionLost" | "ProblemDispatchingLink";
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
export default GroupsView;
//# sourceMappingURL=groups.d.ts.map
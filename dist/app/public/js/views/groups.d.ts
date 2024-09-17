export default GroupsView;
declare namespace GroupsView {
    /**
     * @param {JQuery} lockedAlertDialog
     * @returns {JQuery} `HTMLButtonElement`
     */
    function getLockedAlertButton(lockedAlertDialog: JQuery): JQuery;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getDeleteGroups(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getRemoveUserFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getAddPrivilegeToGroupButton(): JQuery;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function addPrivilegeToGroupModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function addPrivilegeToGroupForm(addPrivilegeToGroupModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @returns {HTMLInputElement}
     */
    function getAddPrivilegeToGroupGroup(): HTMLInputElement;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addPrivilegeToGroupCancel(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addPrivilegeToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addPrivilegeToGroupSubmit(addPrivilegeToGroupModal: JQuery): JQuery;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function createGroupModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function renameGroupModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('../views/utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function addUserToGroupModal(): import("../views/utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function createGroupForm(createGroupModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
    *   JQueryWithAjaxForm} `HTMLFormElement`
    */
    function renameGroupForm(renameGroupModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {import('../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm} `HTMLFormElement`
     */
    function addUserToGroupForm(addUserToGroupModal: JQuery): import("../utilities/ajaxFormClientSideValidate.js").JQueryWithAjaxForm;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function createGroupSubmit(createGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addUserToGroupSubmit(addUserToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function renameGroupSubmit(renameGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} createGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function createGroupCancel(createGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} addUserToGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function addUserToGroupCancel(addUserToGroupModal: JQuery): JQuery;
    /**
     * @param {JQuery} renameGroupModal `HTMLDivElement`
     * @returns {JQuery} `HTMLButtonElement`
     */
    function renameGroupCancel(renameGroupModal: JQuery): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getCreateGroupButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getRenameGroupButton(): JQuery;
    /**
     * @returns {JQuery} `HTMLDivElement`
     */
    function getAddUserToGroupButton(): JQuery;
    /**
     * @returns {HTMLInputElement}
     */
    function getCreateGroupName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getAddUserToGroupName(): HTMLInputElement;
    /**
     * @returns {HTMLInputElement}
     */
    function getRenameGroupName(): HTMLInputElement;
    /**
     * @param {string} group
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setDeleteGroup(group: string): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {import('./utilities/AlertDialog.js').
    *   JQueryWithModal} `HTMLDivElement`
    */
    function setRemoveUserFromGroup(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @returns {JQuery<HTMLElement>}
     */
    function getRemovePrivilegeFromGroup(): JQuery<HTMLElement>;
    /**
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function setRemovePrivilegeFromGroup(): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {"groupCreated"|"groupDeleted"|"groupRenamed"|
     *   "userRemovedFromGroup"|"userAddedToGroup"|
     *   "privilegeAddedToGroup"|"privilegeRemovedFromGroup"} cfg.type
     * @param {string} [cfg.group]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedAlert({ type, group }: {
        type: "groupCreated" | "groupDeleted" | "groupRenamed" | "userRemovedFromGroup" | "userAddedToGroup" | "privilegeAddedToGroup" | "privilegeRemovedFromGroup";
        group?: string | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    /**
     * @param {object} cfg
     * @param {string} cfg.group
     * @param {string} [cfg.message]
     * @param {"ErrorLoggingOut"|"FailureSubmittingGroupInfo"|
     * "SessionLost"|"ProblemDispatchingLink"} [cfg.type]
     * @returns {import('./utilities/AlertDialog.js').
     *   JQueryWithModal} `HTMLDivElement`
     */
    function onShowLockedErrorAlert({ type, group, message }: {
        group: string;
        message?: string | undefined;
        type?: "ErrorLoggingOut" | "FailureSubmittingGroupInfo" | "SessionLost" | "ProblemDispatchingLink" | undefined;
    }): import("./utilities/AlertDialog.js").JQueryWithModal;
    let errorMessages: {
        [key: string]: {
            [key: string]: string;
        };
    };
}
//# sourceMappingURL=groups.d.ts.map
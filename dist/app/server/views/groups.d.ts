export default groups;
/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   hasEditGroupAccess: boolean,
*   hasAddUserToGroupAccess: boolean,
*   hasRemoveUserFromGroupAccess: boolean,
*   hasAddPrivilegeToGroupAccess: boolean,
*   hasRemovePrivilegeFromGroupAccess: boolean,
*   hasReadPrivilegeAccess: boolean,
*   hasReadUsersAccess: boolean,
*   groupsInfo: {
*     groupName: string,
*     usersInfo: {user: string, _id: string}[],
*     privileges: import('../modules/account-manager.js').PrivilegeInfo[]
*     builtin: boolean
*   }[],
*   users: string[],
*   privileges: string[]
* }} cfg
*/
declare function groups({ _, layout, hasEditGroupAccess, hasAddUserToGroupAccess, hasRemoveUserFromGroupAccess, hasAddPrivilegeToGroupAccess, hasRemovePrivilegeFromGroupAccess, hasReadPrivilegeAccess, hasReadUsersAccess, groupsInfo, users, privileges }: {
    _: import("intl-dom").I18NCallback;
    layout: import("../routeUtils.js").LayoutCallback;
    hasEditGroupAccess: boolean;
    hasAddUserToGroupAccess: boolean;
    hasRemoveUserFromGroupAccess: boolean;
    hasAddPrivilegeToGroupAccess: boolean;
    hasRemovePrivilegeFromGroupAccess: boolean;
    hasReadPrivilegeAccess: boolean;
    hasReadUsersAccess: boolean;
    groupsInfo: {
        groupName: string;
        usersInfo: {
            user: string;
            _id: string;
        }[];
        privileges: import("../modules/account-manager.js").PrivilegeInfo[];
        builtin: boolean;
    }[];
    users: string[];
    privileges: string[];
}): Promise<[import("jamilih").JamilihDoc]>;
//# sourceMappingURL=groups.d.ts.map
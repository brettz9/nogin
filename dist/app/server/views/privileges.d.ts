/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   hasEditPrivilegeAccess: boolean,
 *   hasAddPrivilegeToGroupAccess: boolean,
 *   hasRemovePrivilegeFromGroupAccess: boolean,
 *   hasReadGroupAccess: boolean,
 *   hasReadUsersAccess: boolean,
 *   privilegesInfo: {
 *     privilegeName: string,
 *     description: string,
 *     type: import('../modules/account-manager.js').PrivilegeType,
 *     userVarying: boolean,
 *     builtin: boolean,
 *     usersInfo: {user: string}[],
 *     groupsInfo: {
 *       groupName: string,
 *       builtin: boolean,
 *       usersInfo: {
 *         user: string,
 *         _id: string
 *       }[]
 *     }[]
 *   }[],
 *   groups: string[],
 *   users: string[]
 * }} cfg
 */
declare const privileges: ({ _, layout, hasEditPrivilegeAccess, hasAddPrivilegeToGroupAccess, hasRemovePrivilegeFromGroupAccess, hasReadGroupAccess, hasReadUsersAccess, privilegesInfo, groups, users }: {
    _: import('intl-dom').I18NCallback;
    layout: import('../routeUtils.js').LayoutCallback;
    hasEditPrivilegeAccess: boolean;
    hasAddPrivilegeToGroupAccess: boolean;
    hasRemovePrivilegeFromGroupAccess: boolean;
    hasReadGroupAccess: boolean;
    hasReadUsersAccess: boolean;
    privilegesInfo: {
        privilegeName: string;
        description: string;
        type: import('../modules/account-manager.js').PrivilegeType;
        userVarying: boolean;
        builtin: boolean;
        usersInfo: {
            user: string;
        }[];
        groupsInfo: {
            groupName: string;
            builtin: boolean;
            usersInfo: {
                user: string;
                _id: string;
            }[];
        }[];
    }[];
    groups: string[];
    users: string[];
}) => Promise<[import("jamilih").JamilihDoc]>;
export default privileges;
//# sourceMappingURL=privileges.d.ts.map
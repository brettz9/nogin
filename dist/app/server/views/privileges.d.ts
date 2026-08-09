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
 *     builtin: boolean,
 *     groupsInfo: {
 *       groupName: string,
 *       builtin: boolean,
 *       usersInfo: {
 *         user: string,
 *         _id: string
 *       }[]
 *     }[]
 *   }[],
 *   groups: string[]
 * }} cfg
 */
declare const privileges: ({ _, layout, hasEditPrivilegeAccess, hasAddPrivilegeToGroupAccess, hasRemovePrivilegeFromGroupAccess, hasReadGroupAccess, hasReadUsersAccess, privilegesInfo, groups }: {
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
        builtin: boolean;
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
}) => Promise<[import("jamilih").JamilihDoc]>;
export default privileges;
//# sourceMappingURL=privileges.d.ts.map
/**
 * @file Low-level operations on user accounts and groups.
 */
export declare const builtInGroups: Set<string>;
export type AccountInfo = {
    /**
     * Auto-set
     */
    _id?: string;
    id?: string;
    user: string;
    name: string;
    email: string;
    country: string;
    /**
     * Will be overwritten with hash
     */
    pass: string;
    /**
     * Auto-generated version.
     */
    passVer?: number;
    /**
     * Auto-generated timestamp.
     */
    date?: number;
    /**
     * Auto-set
     */
    activated?: boolean;
    /**
     * Auto-set
     */
    activationCode?: string;
    unactivatedEmail?: string;
    /**
     * Timestamp
     */
    activationRequestDate?: number;
    /**
     * Auto-set
     */
    cookie?: string;
    /**
     * Auto-set
     */
    ip?: string;
    /**
     * Auto-set and unset
     */
    passKey?: string;
    privilegeIDs?: (string | PrivilegeAssignment)[];
    /**
     * Additional, expiring
     * group memberships (e.g., from paid offers), separate from the single
     * permanent group a user belongs to via `GroupInfo.userIDs`.
     */
    groupMemberships?: GroupMembership[];
};
export type GroupMembership = {
    groupName: string;
    /**
     * Timestamp after which the membership lapses
     */
    expiresAt: number;
};
export type AccountInfoFilter = {
    user?: any;
    _id?: any;
    name?: any;
    email?: any;
    country?: any;
    pass?: any;
    passVer?: any;
    /**
     * Timestamp
     */
    date?: any;
    activated?: any;
    activationCode?: any;
    unactivatedEmail?: any;
    /**
     * Timestamp
     */
    activationRequestDate?: any;
};
export type PrivilegeType = "boolean" | "string" | "number" | "array" | "object";
export type PrivilegeValue = string | number | unknown[] | {
    [key: string]: unknown;
};
export type PrivilegeAssignment = {
    privilegeName: string;
    value: PrivilegeValue;
    /**
     * Timestamp after which the assignment no
     * longer applies; absent means permanent. Boolean privileges with an expiry
     * are stored in this object form (with `value: true`).
     */
    expiresAt?: number;
};
/**
 * @typedef {object} AccountInfo
 * @property {string} [_id] Auto-set
 * @property {string} [id]
 * @property {string} user
 * @property {string} name
 * @property {string} email
 * @property {string} country
 * @property {string} pass Will be overwritten with hash
 * @property {number} [passVer] Auto-generated version.
 * @property {number} [date] Auto-generated timestamp.
 * @property {boolean} [activated] Auto-set
 * @property {string} [activationCode] Auto-set
 * @property {string} [unactivatedEmail]
 * @property {number} [activationRequestDate] Timestamp
 * @property {string} [cookie] Auto-set
 * @property {string} [ip] Auto-set
 * @property {string} [passKey] Auto-set and unset
 * @property {(string|PrivilegeAssignment)[]} [privilegeIDs]
 * @property {GroupMembership[]} [groupMemberships] Additional, expiring
 *   group memberships (e.g., from paid offers), separate from the single
 *   permanent group a user belongs to via `GroupInfo.userIDs`.
 */
/**
 * @typedef {object} GroupMembership
 * @property {string} groupName
 * @property {number} expiresAt Timestamp after which the membership lapses
 */
/**
 * @typedef {object} AccountInfoFilter
 * @property {Object<"$in",string[]>} [user]
 * @property {Object<"$in",string[]>} [_id]
 * @property {Object<"$in",string[]>} [name]
 * @property {Object<"$in",string[]>} [email]
 * @property {Object<"$in",string[]>} [country]
 * @property {Object<"$in",string[]>} [pass]
 * @property {Object<"$in",number[]>} [passVer]
 * @property {Object<"$in",number[]>} [date] Timestamp
 * @property {Object<"$in",boolean[]>} [activated]
 * @property {Object<"$in",string[]>} [activationCode]
 * @property {Object<"$in",string[]>} [unactivatedEmail]
 * @property {Object<"$in",number[]>} [activationRequestDate] Timestamp
 */
/**
 * @typedef {"boolean"|"string"|"number"|"array"|"object"} PrivilegeType
 */
/**
 * @typedef {string|number|unknown[]|{[key: string]: unknown}} PrivilegeValue
 */
/**
 * @typedef {object} PrivilegeAssignment
 * @property {string} privilegeName
 * @property {PrivilegeValue} value
 * @property {number} [expiresAt] Timestamp after which the assignment no
 *   longer applies; absent means permanent. Boolean privileges with an expiry
 *   are stored in this object form (with `value: true`).
 */
/**
 * @param {string|PrivilegeAssignment} assignment
 * @param {number} [now]
 * @returns {boolean}
 */
export declare const isExpiredAssignment: (assignment: string | PrivilegeAssignment, now?: number) => boolean;
/**
 * Checks whether `value` is a valid assignment value for the given non-boolean
 * privilege `type`. Array and object privileges accept any parsed JSON of the
 * matching kind.
 * @param {PrivilegeType} type
 * @param {unknown} value
 * @returns {boolean}
 */
export declare const isValidPrivilegeValue: (type: PrivilegeType, value: unknown) => boolean;
export type GroupInfo = {
    /**
     * Auto-set
     */
    _id?: string;
    groupName: string;
    privilegeIDs: (string | PrivilegeAssignment)[];
    userIDs: string[];
    builtin: boolean;
    /**
     * Auto-generated timestamp
     */
    date: number;
};
export type GroupInfoFilter = {
    group: {
        $in: string[];
    };
};
export type PrivilegeInfo = {
    /**
     * Auto-set
     */
    _id?: string;
    privilegeName: string;
    description: string;
    /**
     * Defaults to `boolean`
     */
    type?: PrivilegeType;
    /**
     * Defaults to `false`
     */
    userVarying?: boolean;
    /**
     * Present on an effective typed assignment
     */
    value?: PrivilegeValue;
    builtin: boolean;
    /**
     * Auto-generated timestamp
     */
    date: number;
};
export type ChangedEmailHandler = (acct: Partial<AccountInfo>, user: string) => void;
/**
 * Manages accounts.
 */
declare class AccountManager {
    adapter: import("./db-adapters/MongoDB.js").MongoDB;
    /**
     * @param {AccountInfo} newData
     * @returns {Promise<string>}
     */
    static getAccountHash(newData: AccountInfo): Promise<string>;
    /** @type {import('mongodb').Collection|undefined} */
    accounts: import('mongodb').Collection | undefined;
    /** @type {import('mongodb').Collection<GroupInfo>|undefined} */
    groups: import('mongodb').Collection<GroupInfo> | undefined;
    /** @type {import('mongodb').Collection<PrivilegeInfo>|undefined} */
    privileges: import('mongodb').Collection<PrivilegeInfo> | undefined;
    /**
     * @param {"mongodb"} adapter
     * @param {import('./db-abstraction.js').DBConfigObject} config
     */
    constructor(adapter: "mongodb", config: import('./db-abstraction.js').DBConfigObject);
    /**
     * @returns {Promise<AccountManager>}
     */
    connect(): Promise<AccountManager>;
    /**
     * Currently only in use by the CLI.
     * @returns {Promise<void>}
     */
    listIndexes(): Promise<void>;
    /**
     * @returns {Promise<import('mongodb').BulkWriteResult|void>}
     */
    addDefaultGroups(): Promise<import('mongodb').BulkWriteResult | void>;
    /**
     * @returns {Promise<import('mongodb').BulkWriteResult|void>}
     */
    addDefaultPrivileges(): Promise<import('mongodb').BulkWriteResult | void>;
    /**
     * @param {string} user
     * @param {string} pass The hashed password
     * @returns {Promise<Partial<AccountInfo>|null>}
     */
    autoLogin(user: string, pass: string): Promise<Partial<AccountInfo> | null>;
    /**
     * Checks whether an account with the given `user` currently exists and
     * is activated (the same condition `autoLogin`/`manualLogin` require).
     * Used to detect a session that has outlived a usable account, e.g.,
     * the account was deleted or deactivated while a session remained
     * active.
     * @param {string} user
     * @returns {Promise<boolean>}
     */
    activatedAccountExists(user: string): Promise<boolean>;
    /**
     * @param {AccountInfoFilter} acctInfo
     * @returns {Promise<Partial<AccountInfo>[]>}
     */
    getRecords(acctInfo: AccountInfoFilter): Promise<Partial<AccountInfo>[]>;
    /**
     * @returns {Promise<GroupInfo[]>}
     */
    getAllGroups(): Promise<GroupInfo[]>;
    /**
     * @returns {Promise<PrivilegeInfo[]>}
     */
    getAllPrivileges(): Promise<PrivilegeInfo[]>;
    /**
     * @param {string} user
     * @param {string} pass The raw password
     * @returns {Promise<Partial<AccountInfo>>}
     */
    manualLogin(user: string, pass: string): Promise<Partial<AccountInfo>>;
    /**
     * @param {string} user
     * @param {string} ipAddress
     * @returns {Promise<string>} The cookie uuid
     */
    generateLoginKey(user: string, ipAddress: string): Promise<string>;
    /**
     * @param {string} cookie
     * @param {string} ipAddress
     * @returns {Promise<Partial<AccountInfo>|null>}
     */
    validateLoginKey(cookie: string, ipAddress: string): Promise<Partial<AccountInfo> | null>;
    /**
     * @param {string} email
     * @param {string} ipAddress
     * @returns {Promise<Partial<AccountInfo>>}
     */
    generatePasswordKey(email: string, ipAddress: string): Promise<Partial<AccountInfo>>;
    /**
     * @param {string} passKey
     * @param {string} ipAddress
     * @returns {Promise<Partial<AccountInfo>|null>}
     */
    validatePasswordKey(passKey: string, ipAddress: string): Promise<Partial<AccountInfo> | null>;
    /**
     * @param {AccountInfo} newData
     * @param {{
     *   allowCustomPassVer?: boolean
     * }} [allowCustomPassVer]
     * @returns {Promise<AccountInfo & {
     *   activationCode: string
     * }>}
     * @todo Would ideally check for multiple errors to report back all issues
     *   at once.
     */
    addNewAccount(newData: AccountInfo, { allowCustomPassVer }?: {
        allowCustomPassVer?: boolean;
    }): Promise<AccountInfo & {
        activationCode: string;
    }>;
    /**
     * @param {Partial<GroupInfo>} data
     * @returns {Promise<GroupInfo>}
     */
    addNewGroup(data: Partial<GroupInfo>): Promise<GroupInfo>;
    /**
     * @param {string} userID
     * @returns {Promise<string|void>}
     */
    getGroupForUser(userID: string): Promise<string | void>;
    /**
     * @param {Partial<GroupInfo> & {newGroupName: string}} data
     * @returns {Promise<void>}
     */
    renameGroup(data: Partial<GroupInfo> & {
        newGroupName: string;
    }): Promise<void>;
    /**
     * Adds an expiring membership in `groupName` without altering the user's
     * permanent group. Never shortens an existing active membership.
     * @param {{userID: string, groupName: string, expiresAt: number}} data
     * @returns {Promise<void>}
     */
    grantGroupMembershipUntil(data: {
        userID: string;
        groupName: string;
        expiresAt: number;
    }): Promise<void>;
    /**
     * @param {{userID: string, groupName: string}} data
     * @returns {Promise<void>}
     */
    removeGroupMembershipFromUser(data: {
        userID: string;
        groupName: string;
    }): Promise<void>;
    /**
     * Privileges from the user's active expiring group memberships. Memberships
     * in groups that no longer exist are ignored.
     * @param {string} userID
     * @returns {Promise<PrivilegeInfo[]>}
     */
    getPrivilegesForTimedGroups(userID: string): Promise<PrivilegeInfo[]>;
    /**
     * @param {Partial<GroupInfo> & {userID: string}} data
     * @returns {Promise<void>}
     */
    addUserToGroup(data: Partial<GroupInfo> & {
        userID: string;
    }): Promise<void>;
    /**
     * @param {Partial<GroupInfo> & {userID: string}} data
     * @returns {Promise<void>}
     */
    removeUserFromGroup(data: Partial<GroupInfo> & {
        userID: string;
    }): Promise<void>;
    /**
     * @param {Partial<PrivilegeInfo>} data
     * @returns {Promise<PrivilegeInfo>}
     */
    addNewPrivilege(data: Partial<PrivilegeInfo>): Promise<PrivilegeInfo>;
    /**
     * @param {string} privilege
     * @returns {Promise<void>}
     */
    removePrivilegeIDFromGroup(privilege: string): Promise<void>;
    /**
     * @param {string} privilege
     * @returns {Promise<void>}
     */
    removePrivilegeIDFromUsers(privilege: string): Promise<void>;
    /**
     * @param {Partial<GroupInfo> & {
     *   privilegeName: string,
     *   value?: PrivilegeValue
     * }} data
     * @returns {Promise<void>}
     */
    addPrivilegeToGroup(data: Partial<GroupInfo> & {
        privilegeName: string;
        value?: PrivilegeValue;
    }): Promise<void>;
    /**
     * @param {Partial<GroupInfo> & {privilegeName: string}} data
     * @returns {Promise<void>}
     */
    removePrivilegeFromGroup(data: Partial<GroupInfo> & {
        privilegeName: string;
    }): Promise<void>;
    /**
     * @param {string} privilegeName
     * @returns {Promise<Partial<PrivilegeInfo>|null|undefined>}
     */
    getPrivilege(privilegeName: string): Promise<Partial<PrivilegeInfo> | null | undefined>;
    /**
     * @param {string} groupName
     * @returns {Promise<PrivilegeInfo[]>}
     */
    getPrivilegesForGroup(groupName: string): Promise<PrivilegeInfo[]>;
    /**
     * @param {{
     *   userID: string,
     *   privilegeName: string,
     *   value?: PrivilegeValue,
     *   expiresAt?: number
     * }} data
     * @returns {Promise<void>}
     */
    addPrivilegeToUser(data: {
        userID: string;
        privilegeName: string;
        value?: PrivilegeValue;
        expiresAt?: number;
    }): Promise<void>;
    /**
     * Grants a user privilege until `expiresAt`, but never shortens an existing
     * grant (including a permanent one).
     * @param {{
     *   userID: string,
     *   privilegeName: string,
     *   expiresAt: number,
     *   value?: PrivilegeValue
     * }} data
     * @returns {Promise<void>}
     */
    grantPrivilegeUntil(data: {
        userID: string;
        privilegeName: string;
        expiresAt: number;
        value?: PrivilegeValue;
    }): Promise<void>;
    /**
     * Removes expired assignments from users and groups. Housekeeping only,
     * as reads already ignore expired assignments.
     * @param {number} [now]
     * @returns {Promise<void>}
     */
    pruneExpiredPrivileges(now?: number): Promise<void>;
    /**
     * @param {{userID: string, privilegeName: string}} data
     * @returns {Promise<void>}
     */
    removePrivilegeFromUser(data: {
        userID: string;
        privilegeName: string;
    }): Promise<void>;
    /**
     * @param {string} userID
     * @returns {Promise<PrivilegeInfo[]>}
     */
    getPrivilegesForUser(userID: string): Promise<PrivilegeInfo[]>;
    /**
     * @param {string} activationCode
     * @returns {Promise<import('mongodb').UpdateResult|
     *   import('mongodb').Document>}
     */
    activateAccount(activationCode: string): Promise<import('mongodb').UpdateResult | import('mongodb').Document>;
    /**
     * @callback ChangedEmailHandler
     * @param {Partial<AccountInfo>} acct
     * @param {string} user Since not provided on `acct`
     * @returns {void}
     */
    /**
     * @param {Partial<AccountInfo> & {
     *   user: string
     * }} newData
     * @param {object} cfg
     * @param {boolean} [cfg.forceUpdate]
     * @param {ChangedEmailHandler} [cfg.changedEmailHandler]
     * @returns {Promise<
     *   import('mongodb').WithId<import('mongodb').Document>
     * >}
     */
    updateAccount(newData: Partial<AccountInfo> & {
        user: string;
    }, { forceUpdate, changedEmailHandler }: {
        forceUpdate?: boolean;
        changedEmailHandler?: ChangedEmailHandler;
    }): Promise<import('mongodb').WithId<import('mongodb').Document>>;
    /**
     * @param {string} passKey
     * @param {string} newPass
     * @returns {Promise<import('mongodb').WithId<
     *   import('mongodb').Document
     * > | null>}
     */
    updatePassword(passKey: string, newPass: string): Promise<import('mongodb').WithId<import('mongodb').Document> | null>;
    /**
     * @returns {Promise<Partial<AccountInfo>[]>}
     */
    getAllRecords(): Promise<Partial<AccountInfo>[]>;
    /**
     * @param {string} id
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAccountById(id: string): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
    /**
     * @param {string} groupName
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteGroupByGroupName(groupName: string): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
    /**
     * @param {string} userID
     * @returns {Promise<void>}
     */
    removeUserIDFromGroup(userID: string): Promise<void>;
    /**
     * @param {string} privilegeName
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deletePrivilegeByPrivilegeName(privilegeName: string): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
    /**
     * @param {Partial<PrivilegeInfo> & {newPrivilegeName: string}} data
     * @returns {Promise<void>}
     */
    editPrivilege(data: Partial<PrivilegeInfo> & {
        newPrivilegeName: string;
    }): Promise<void>;
    /**
     * @param {AccountInfoFilter} acctInfo
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAccounts(acctInfo: AccountInfoFilter): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
    /**
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAllAccounts(): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
    /**
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAllGroups(): Promise<import('./db-abstraction.js').DeleteWriteOpResult>;
}
export default AccountManager;
//# sourceMappingURL=account-manager.d.ts.map
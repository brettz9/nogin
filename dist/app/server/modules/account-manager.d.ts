export default AccountManager;
export type AccountInfo = {
    /**
     * Auto-set
     */
    _id?: string | undefined;
    id?: string | undefined;
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
    passVer?: number | undefined;
    /**
     * Auto-generated timestamp.
     */
    date?: number | undefined;
    /**
     * Auto-set
     */
    activated?: boolean | undefined;
    /**
     * Auto-set
     */
    activationCode?: string | undefined;
    unactivatedEmail?: string | undefined;
    /**
     * Timestamp
     */
    activationRequestDate?: number | undefined;
    /**
     * Auto-set
     */
    cookie?: string | undefined;
    /**
     * Auto-set
     */
    ip?: string | undefined;
    /**
     * Auto-set and unset
     */
    passKey?: string | undefined;
};
export type AccountInfoFilter = {
    user: any;
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
/**
 * Manages accounts.
 */
declare class AccountManager {
    /**
     * @param {AccountInfo} newData
     * @returns {Promise<string>}
     */
    static getAccountHash(newData: AccountInfo): Promise<string>;
    /**
     * @param {"mongodb"} adapter
     * @param {import('./db-abstraction.js').DBConfigObject} config
     */
    constructor(adapter: "mongodb", config: import("./db-abstraction.js").DBConfigObject);
    adapter: import("./db-adapters/MongoDB.js").default;
    /**
     * @returns {Promise<AccountManager>}
     */
    connect(): Promise<AccountManager>;
    accounts: import("mongodb").Collection<import("mongodb").Document> | undefined;
    /**
     * Currently only in use by the CLI.
     * @returns {Promise<void>}
     */
    listIndexes(): Promise<void>;
    /**
     * @param {string} user
     * @param {string} pass The hashed password
     * @returns {Promise<Partial<AccountInfo>|null>}
     */
    autoLogin(user: string, pass: string): Promise<Partial<AccountInfo> | null>;
    /**
     * @param {AccountInfoFilter} acctInfo
     * @returns {Promise<Partial<AccountInfo>[]>}
     */
    getRecords(acctInfo: AccountInfoFilter): Promise<Partial<AccountInfo>[]>;
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
     * @todo Would ideally check for multiple erros to report back all issues
     *   at once.
     */
    addNewAccount(newData: AccountInfo, { allowCustomPassVer }?: {
        allowCustomPassVer?: boolean;
    } | undefined): Promise<AccountInfo & {
        activationCode: string;
    }>;
    /**
     * @param {string} activationCode
     * @returns {Promise<import('mongodb').UpdateResult|
     *   import('mongodb').Document>}
     */
    activateAccount(activationCode: string): Promise<import("mongodb").UpdateResult | import("mongodb").Document>;
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
        forceUpdate?: boolean | undefined;
        changedEmailHandler?: ((acct: Partial<AccountInfo>, user: string) => void) | undefined;
    }): Promise<import("mongodb").WithId<import("mongodb").Document>>;
    /**
     * @param {string} passKey
     * @param {string} newPass
     * @returns {Promise<import('mongodb').WithId<any> | null>}
     */
    updatePassword(passKey: string, newPass: string): Promise<import("mongodb").WithId<any> | null>;
    /**
     * @returns {Promise<Partial<AccountInfo>[]>}
     */
    getAllRecords(): Promise<Partial<AccountInfo>[]>;
    /**
     * @param {string} id
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAccountById(id: string): Promise<import("./db-abstraction.js").DeleteWriteOpResult>;
    /**
     * @param {AccountInfoFilter} acctInfo
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAccounts(acctInfo: AccountInfoFilter): Promise<import("./db-abstraction.js").DeleteWriteOpResult>;
    /**
     * @returns {Promise<import('./db-abstraction.js').DeleteWriteOpResult>}
     */
    deleteAllAccounts(): Promise<import("./db-abstraction.js").DeleteWriteOpResult>;
}
//# sourceMappingURL=account-manager.d.ts.map
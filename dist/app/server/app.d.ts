/**
 * These are a subset of the CLI options.
 */
export type RouteConfigFromOptions = {
    loggerLocale: string;
    NL_EMAIL_USER: string;
    NL_EMAIL_PASS: string;
    NL_EMAIL_HOST: string;
    NL_EMAIL_FROM: string;
    NS_EMAIL_TIMEOUT: number;
    NL_SITE_URL: string;
    cwd: string;
    localesBasePath: string;
    postLoginRedirectPath: string;
    customRoute: string[];
    rootUser: string[];
    crossDomainJSRedirects: boolean;
    composeResetPasswordEmailView: string;
    composeActivationEmailView: string;
    requireName: boolean;
    router: string;
    fallback: string;
    useESM: boolean;
    noPolyfill: boolean;
    injectHTML: string;
    countryCodes: string;
    favicon: string;
    stylesheet: string;
    noBuiltinStylesheets: boolean;
    userJS: string;
    userJSModule: string;
    localScripts: boolean;
    fromText: string;
    fromURL: string;
    SERVE_COVERAGE: boolean;
    disableXSRF: boolean;
    csurfOptions: string;
};
export type RouteConfig = RouteConfigFromOptions & {
    log: import("./modules/getLogger.js").Logger;
    DB_URL: string;
    opts: import("./optionDefinitions.js").MainOptionDefinitions;
    dbOpts: import("./modules/db-factory.js").DbOptions;
    triggerCoverage: boolean;
};
/**
 * @param {Partial<import('./optionDefinitions.js').
 *   MainOptionDefinitions>
 * } options
 * @returns {Promise<void>}
 */
export function createServer(options: Partial<import("./optionDefinitions.js").MainOptionDefinitions>): Promise<void>;
//# sourceMappingURL=app.d.ts.map
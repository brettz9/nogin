export type MainOptionDefinitions = {
    loggerLocale: string;
    noLogging: boolean;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    NL_EMAIL_USER: string;
    NL_EMAIL_PASS: string;
    NL_EMAIL_HOST: string;
    NL_EMAIL_FROM: string;
    NS_EMAIL_TIMEOUT: number;
    NL_SITE_URL: string;
    NL_RESEND_FROM?: string;
    NL_RESEND_PASS?: string;
    NL_STRIPE_SECRET?: string;
    NL_STRIPE_PUBLISHABLE?: string;
    NL_STRIPE_WEBHOOK_SECRET?: string;
    PORT: number;
    secret: string;
    cwd: string;
    JS_DIR: string;
    localesBasePath: string;
    postLoginRedirectPath: string;
    customRoute: string[];
    crossDomainJSRedirects: boolean;
    composeResetPasswordEmailView: string;
    composeActivationEmailView: string;
    composePurchaseReceiptEmailView: string;
    requireName: boolean;
    staticDir: string[];
    middleware: string[];
    router: string;
    fallback: string;
    useESM: boolean;
    noPolyfill: boolean;
    injectHTML: string;
    config: string | null;
    countryCodes: string | string[];
    adapter: string;
    favicon: string;
    stylesheet: string;
    noBuiltinStylesheets: boolean;
    userJS: string;
    userJSModule: string;
    localScripts: boolean;
    fromText: string;
    fromURL: string;
    SERVE_COVERAGE: boolean;
    RATE_LIMIT: number;
    NL_PRUNE_INTERVAL: number;
    disableRateLimit: boolean;
    disableXSRF: boolean;
    noHelmet: boolean;
    noHostValidation: boolean;
    helmetOptions: string | {
        noSniff: boolean;
    };
    csurfOptions: string;
    sessionCookieOptions: string | {
        genid: () => number;
    };
    sessionOptions: string | {
        name: string;
        secret: string;
    };
    transferLimit: string;
    rootUser: string[];
    signupAgreement?: string | {
        [locale: string]: string;
    };
};
/** @type {import('command-line-usage').OptionDefinition[]} */
declare const optionDefinitions: import('command-line-usage').OptionDefinition[];
/**
 * @type {[
 *   import('command-line-usage').Content,
 *   import('command-line-usage').OptionList
 * ]}
 */
declare const cliSections: [import('command-line-usage').Content, import('command-line-usage').OptionList];
export { optionDefinitions as definitions, cliSections as sections };
//# sourceMappingURL=optionDefinitions.d.ts.map
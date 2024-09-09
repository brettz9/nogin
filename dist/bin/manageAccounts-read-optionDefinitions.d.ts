export type ReadOptionDefinitions = import("./common-definitions.js").CommonDefinitions & import("./db-definitions.js").DbDefinitions & {
    user?: string[];
    name?: string[];
    email?: string[];
    country?: string[];
    pass?: string[];
    passVer?: number[];
    date?: number[];
    activated?: boolean[];
    activationCode?: string[];
    unactivatedEmail?: string[];
    activationRequestDate?: number[];
    passKey?: string[];
    ip?: string[];
    cookie?: string[];
    _id?: string[];
};
/**
 * @typedef {import('./common-definitions.js').CommonDefinitions &
 *   import('./db-definitions.js').DbDefinitions & {
 *   user?: string[],
 *   name?: string[],
 *   email?: string[],
 *   country?: string[],
 *   pass?: string[],
 *   passVer?: number[],
 *   date?: number[],
 *   activated?: boolean[],
 *   activationCode?: string[],
 *   unactivatedEmail?: string[],
 *   activationRequestDate?: number[],
 *   passKey?: string[],
 *   ip?: string[],
 *   cookie?: string[],
 *   _id?: string[],
 * }} ReadOptionDefinitions
 */
/**
 * @type {import('command-line-usage').
 *   OptionDefinition[]}
 */
declare const optionDefinitions: import("command-line-usage").OptionDefinition[];
declare const cliSections: ({
    content: string;
    optionList?: undefined;
} | {
    optionList: import("command-line-usage").OptionDefinition[];
    content?: undefined;
})[];
export { optionDefinitions as definitions, cliSections as sections };
//# sourceMappingURL=manageAccounts-read-optionDefinitions.d.ts.map
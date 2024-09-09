export type AddOptionDefinitions = import("./common-definitions.js").CommonDefinitions & import("./db-definitions.js").DbDefinitions & {
    cwd?: string;
    userFile?: string[];
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
 *   cwd?: string,
 *   userFile?: string[],
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
 * }} AddOptionDefinitions
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
//# sourceMappingURL=manageAccounts-add-optionDefinitions.d.ts.map
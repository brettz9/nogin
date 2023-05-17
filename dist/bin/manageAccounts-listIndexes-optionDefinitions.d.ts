export type ListIndexesDefinitions = import('./common-definitions.js').CommonDefinitions & import('./db-definitions.js').DbDefinitions;
/**
 * @typedef {import('./common-definitions.js').CommonDefinitions &
 *   import('./db-definitions.js').DbDefinitions
 * } ListIndexesDefinitions
 */
/**
 * @type {import('command-line-usage').
 *   OptionDefinition[]}
 */
declare const optionDefinitions: import('command-line-usage').OptionDefinition[];
declare const cliSections: ({
    content: string;
    optionList?: undefined;
} | {
    optionList: import("command-line-usage").OptionDefinition[];
    content?: undefined;
})[];
export { optionDefinitions as definitions, cliSections as sections };
//# sourceMappingURL=manageAccounts-listIndexes-optionDefinitions.d.ts.map
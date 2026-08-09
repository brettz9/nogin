export type CommonDefinitions = {
    loggerLocale?: string;
    noLogging?: boolean;
};
/**
 * @typedef {{
 *   loggerLocale?: string,
 *   noLogging?: boolean
 * }} CommonDefinitions
 */
declare const commonDefinitions: ({
    name: string;
    type: StringConstructor;
    description: string;
    typeLabel: string;
    alias?: undefined;
} | {
    typeLabel?: undefined;
    name: string;
    alias: string;
    type: BooleanConstructor;
    description: string;
})[];
export default commonDefinitions;
//# sourceMappingURL=common-definitions.d.ts.map
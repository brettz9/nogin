export default commonDefinitions;
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
    name: string;
    alias: string;
    type: BooleanConstructor;
    description: string;
    typeLabel?: undefined;
})[];
//# sourceMappingURL=common-definitions.d.ts.map
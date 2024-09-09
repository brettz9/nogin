export default getLogger;
export type LoggerOptions = {
    loggerLocale?: string | undefined;
    noLogging?: boolean | undefined;
    errorLog?: boolean | undefined;
};
/**
 * `key`
 * `substitutions` - Values for substitution. Defaults to `{}`
 * `other` - Other items to log, e.g., errors.
 */
export type Logger = ((key: string, substitutions?: ({
    [x: string]: (string | Element | number);
}) | null, ...other: (string | object)[]) => string | null) & {
    _: import("../modules/email-dispatcher.js").Internationalizer;
};
/**
* @typedef {object} LoggerOptions
* @property {string} [loggerLocale="en-US"]
* @property {boolean} [noLogging=false]
* @property {boolean} [errorLog=false]
*/
/**
 * `key`
 * `substitutions` - Values for substitution. Defaults to `{}`
 * `other` - Other items to log, e.g., errors.
 * @typedef {((
 *   key: string,
 *   substitutions?: (Object<string,(string|Element|number)>)|null,
 *   ...other: (string|object)[]
 * ) => string|null) & {
 *   _: import('../modules/email-dispatcher.js').Internationalizer
 * }} Logger
 */
/**
 * @param {LoggerOptions} options
 * @returns {Promise<Logger>}
 */
declare function getLogger(options: LoggerOptions): Promise<Logger>;
//# sourceMappingURL=getLogger.d.ts.map
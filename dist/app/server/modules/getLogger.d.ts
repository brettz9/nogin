export type LoggerOptions = {
    loggerLocale?: string;
    noLogging?: boolean;
    errorLog?: boolean;
};
export type Logger = ((key: string, substitutions?: {
    [key: string]: string | Element | number;
} | null, ...other: (string | object)[]) => string | null) & {
    _: import('../modules/email-dispatcher.js').Internationalizer;
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
 *   substitutions?: {[key: string]: string|Element|number}|null,
 *   ...other: (string|object)[]
 * ) => string|null) & {
 *   _: import('../modules/email-dispatcher.js').Internationalizer
 * }} Logger
 */
/**
 * @param {LoggerOptions} options
 * @returns {Promise<Logger>}
 */
declare const getLogger: (options: LoggerOptions) => Promise<Logger>;
export default getLogger;
//# sourceMappingURL=getLogger.d.ts.map
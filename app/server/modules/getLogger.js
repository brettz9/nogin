import {i18n} from './i18n.js';

const setI18n = i18n();

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
const getLogger = async (options) => {
  const _ = await setI18n({
    // @ts-expect-error Why can't this match the `string[]` overload?
    acceptsLanguages () {
      return [options.loggerLocale || 'en-US'];
    }
  });

  /**
   * @type {Logger}
   */
  const logger = (
    key,
    substitutions = {},
    ...other
  ) => {
    if (options.noLogging) {
      return null;
    }
    if (options.errorLog) {
      console.error(_(key, substitutions), ...other);
    } else {
      console.log(_(key, substitutions), ...other);
    }
    return key;
  };
  logger._ = _;

  return logger;
};

export default getLogger;

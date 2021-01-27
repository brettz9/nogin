'use strict';

const {i18n} = require('./i18n.js');

const setI18n = i18n();

/**
* @typedef {PlainObject} LoggerOptions
* @property {string} [loggerLocale="en-US"]
* @property {boolean} [noLogging=false]
* @property {boolean} [errorLog=false]
*/

/**
 * @param {LoggerOptions} options
 * @returns {Promise<Logger>}
 */
const getLogger = async (options) => {
  const _ = await setI18n({
    acceptsLanguages: () => [options.loggerLocale || 'en-US']
  });
  /**
   * @callback Logger
   * @param {string} key
   * @param {PlainObject<string,(string|Element)>} [substitutions={}] Values for
   *  substitution
   * @param {...(string|PlainObject)} other Other items to log, e.g., errors
   * @returns {string|null}
   */

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

module.exports = getLogger;

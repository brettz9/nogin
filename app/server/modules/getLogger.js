'use strict';

const setI18n = require('./i18n.js')();

const getLogger = async (options) => {
  const _ = await setI18n({
    acceptsLanguages: () => options.loggerLocale || 'en-US'
  });
  /**
   *
   * @param {string} key
   * @param {PlainObject<string,(string|Element)>} [substitutions={}] Values for
   *  substitution
   * @param {...(string|PlainObject)} other Other items to log, e.g., errors
   * @returns {string|null}
   */
  const logger = (
    key,
    // istanbul ignore next
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

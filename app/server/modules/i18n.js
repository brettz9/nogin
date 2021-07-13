'use strict';

const {readdirSync} = require('fs');
const {join} = require('path');
const {JSDOM} = require('jsdom');
const {i18n, getMatchingLocale, setFetch, setDocument} = require('intl-dom');
const fileFetch = require('file-fetch'); // For `intl-dom`
const rtlDetect = require('rtl-detect');

setFetch(fileFetch);
setDocument((new JSDOM()).window.document);

const localeMaps = {};
const availableLocales = readdirSync(join(__dirname, '../_locales'));

/**
 * @typedef {PlainObject} LanguageDirection
 * @property {string} lang
 * @property {"ltr"|"rtl"} dir
 */

/**
 * @function LanguageDirectionSetter
 * @param {Internationalizer} _
 * @returns {LanguageDirection}
 */
exports.getLangDir = function (_) {
  const lang = _.resolvedLocale;
  // Don't bother to make default of "ltr" explicit
  const dir = rtlDetect.isRtlLang() ? rtlDetect.getLangDir(lang) : undefined;
  return {
    dir,
    lang
  };
};

exports.i18n = function (localesBasePath = join(__dirname, '../')) {
  return async function (req, res, next = () => { /**/ }) {
    // To reduce memory leaks with our `Map` (which avoids repeated file system
    //   checks), we limit number of locales here, filtering among our existing
    //   locales (even though our i18n can handle bad locales)
    const locales = req.acceptsLanguages().map((locale) => {
      return getMatchingLocale({locale, locales: availableLocales});
    }).filter((locale) => locale);

    const langKey = JSON.stringify(locales);
    let _;
    if (!localeMaps[localesBasePath]) {
      localeMaps[localesBasePath] = new Map();
    }
    if (localeMaps[localesBasePath].has(langKey)) {
      _ = localeMaps[localesBasePath].get(langKey);
    } else {
      // Todo: Set this on req and genuinely use as middleware
      _ = await i18n({
        // Detects locale from `req.headers['accept-language']` and
        //   requires appropriate i18n file; this is for Express;
        //   for non-Express, could use https://github.com/florrain/locale
        locales,
        localesBasePath
      });
      localeMaps[localesBasePath].set(langKey, _);
    }

    // Todo: Detect template requested from `req.url`
    // See https://expressjs.com/en/guide/using-template-engines.html
    // and https://expressjs.com/en/advanced/developing-template-engines.html

    next();

    // Return so business logic can use as well
    return _;
  };
};

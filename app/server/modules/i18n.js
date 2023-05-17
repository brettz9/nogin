import 'intl-locale-textinfo-polyfill';
import {readdirSync} from 'fs';
import {join} from 'path';
import {JSDOM} from 'jsdom';
import {i18n as intl, getMatchingLocale, setFetch, setDocument} from 'intl-dom';
import fileFetch from 'file-fetch'; // For `intl-dom`
import getDirname from './getDirname.js';

const __dirname = getDirname(import.meta.url);

setFetch(fileFetch);
setDocument((new JSDOM()).window.document);

/**
 * @type {{
 *   [key: string]: Map<string, import('intl-dom').I18NCallback<string>>
 * }}
 */
const localeMaps = {};
const availableLocales = readdirSync(join(__dirname, '../_locales'));

/**
 * @typedef {object} LanguageDirection
 * @property {string} lang
 * @property {"ltr"|"rtl"|undefined} dir
 */

/**
 * @callback LanguageDirectionSetter
 * @param {import('./email-dispatcher.js').Internationalizer} _
 * @returns {LanguageDirection}
 */

/** @type {LanguageDirectionSetter} */
const getLangDir = function (_) {
  // Todo: Add `resolvedDirection` to `intl-dom` so can grab that instead here
  const lang = _.resolvedLocale;
  const {direction} = new Intl.Locale(lang).textInfo;
  // Don't bother to make default of "ltr" explicit
  const dir = direction === 'rtl' ? direction : undefined;
  return {
    dir,
    lang
  };
};

const i18n = function (localesBasePath = join(__dirname, '../')) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} [_res]
   * @param {import('express').NextFunction} [next]
   * @returns {Promise<import('intl-dom').I18NCallback<string>>}
   */
  return async function (req, _res, next = () => { /**/ }) {
    // To reduce memory leaks with our `Map` (which avoids repeated file system
    //   checks), we limit number of locales here, filtering among our existing
    //   locales (even though our i18n can handle bad locales)
    const locales = /** @type {string[]} */ (
      req.acceptsLanguages().map((locale) => {
        return getMatchingLocale({locale, locales: availableLocales});
      }).filter(Boolean)
    );

    const langKey = JSON.stringify(locales);
    let _;
    if (!localeMaps[localesBasePath]) {
      localeMaps[localesBasePath] = new Map();
    }
    if (localeMaps[localesBasePath].has(langKey)) {
      _ = /** @type {import('intl-dom').I18NCallback<string>} */ (
        localeMaps[localesBasePath].get(langKey)
      );
    } else {
      // Todo: Set this on req and genuinely use as middleware
      _ = /** @type {import('intl-dom').I18NCallback<string>} */ (await intl({
        // Detects locale from `req.headers['accept-language']` and
        //   requires appropriate i18n file; this is for Express;
        //   for non-Express, could use https://github.com/florrain/locale
        locales,
        localesBasePath
      }));
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

export {getLangDir, i18n};

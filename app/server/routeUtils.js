'use strict';

const {readdirSync, readFileSync} = require('fs');
const {join} = require('path');

const layoutView = require('./views/layout.js');

const checkLocaleRoutes = () => {
  /**
   * Ensure locales do not use reserved patterns nor have duplicate
   * names (which could cause circular redirecting).
   */
  const localePath = join(__dirname, '../_locales');
  const availableLocales = readdirSync(localePath);
  availableLocales.forEach((locale) => {
    const {body} = JSON.parse(readFileSync(join(localePath, locale), 'utf8'));
    const messages = [];
    Object.entries(body).forEach(([key, {message}]) => {
      if (!key.startsWith('route_')) {
        return;
      }
      if (messages.includes(message)) {
        throw new Error(
          'Localized route paths must be distinct within a locale'
        );
      }
      if ([
        '/__coverage__',
        '/_lang'
      ].includes(message)) {
        throw new Error(
          `Localized routes must not use reserved routes (${message})`
        );
      }
      if (!(/\/[^./]*$)/u).test(message)) {
        throw new Error(
          'Localized routes must have an initial slash but no dots ' +
            'or slashes afterward.'
        );
      }
      messages.push(message);
    });
  });
};

/**
* @callback LayoutCallback
* @param {PlainObject} templateArgs
* @returns {JamilihArray}
*/

/**
* @typedef {PlainObject} TitleWithLayoutCallback
* @property {Internationalizer} _
* @property {string} title
* @property {LayoutCallback} layout
*/

/**
* @typedef {PlainObject} LayoutAndTitleArgs
* @property {Internationalizer} _
* @property {string} title
* @property {string} template The template name (made available to
* `injectHTML` so it can vary the generated HTML per template).
* @property {string} error
*/

/**
 * @param {PlainObject} config
 */
const layoutAndTitleGetter = (config) => {
  const {
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    injectHTML,
    localScripts,
    triggerCoverage
  } = config;
  /**
   * @param {LayoutAndTitleArgs} businessLogicArgs
   * @returns {TitleWithLayoutCallback}
   */
  return (businessLogicArgs) => {
    const {_, title} = businessLogicArgs;
    return {
      _,
      title,
      layout (templateArgs) {
        const cfg = {
          // Though should be trusted anyways, do not let template
          //   arguments override.
          ...templateArgs,
          triggerCoverage,
          favicon,
          stylesheet,
          noBuiltinStylesheets,
          userJS,
          userJSModule,
          localScripts,
          ...businessLogicArgs
        };
        return layoutView(
          cfg,
          // eslint-disable-next-line global-require, import/no-dynamic-require
          injectHTML ? require(injectHTML)(cfg) : {}
        );
      }
    };
  };
};

exports.checkLocaleRoutes = checkLocaleRoutes;
exports.layoutAndTitleGetter = layoutAndTitleGetter;

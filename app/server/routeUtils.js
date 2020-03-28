'use strict';

const {readdirSync} = require('fs');
const {join} = require('path');

const layoutView = require('./views/layout.js');
const i18n = require('./modules/i18n.js');

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

const checkLocaleRoutes = async (getRoutes, localesBasePath) => {
  /**
   * Ensure locales do not use reserved patterns nor have duplicate
   * names (which could cause circular redirecting).
   */
  const localePath = join(process.cwd(), localesBasePath, '_locales');
  const availableLocales = readdirSync(localePath);
  const setI18n = i18n(localesBasePath);

  await Promise.all(
    availableLocales.map(async (locale) => {
      const _ = await setI18n({
        acceptsLanguages: () => [locale]
      });
      const routes = getRoutes(_);

      const messages = [];
      Object.entries(routes).forEach(([key, message]) => {
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
        if (!(/^\/[^./]*$/u).test(message)) {
          throw new Error(
            'Localized routes must have an initial slash but no dots ' +
              'or slashes afterward.'
          );
        }
        messages.push(message);
      });
    })
  );
};

/**
* @typedef {"root"|"logout"|"home"|"signup"|"activation"|"lostPassword"|
* "resetPassword"|"users"|"delete"|"reset"|"coverage"} Route
*/

/**
* @typedef {string} Path
*/

/**
* @typedef {Object<Route, Path>} Routes
*/

const routeMap = new Map();

/**
 * @param {string[]} customRoutes Equal-separated locale=route=path
 * @returns {RouteGetter}
 */
function routeGetter (customRoutes) {
  /**
   * Keyed by locale, then by route, and set to a path.
   * @typedef {Object<string, Object<string, string>>} CustomRouteObject
  */
  /**
   * @type {CustomRouteObject}
   */
  const customRoutesObj = customRoutes.reduce((routes, routeInfo) => {
    const [locale, route, path] = routeInfo.split('=');
    if (!routes[locale]) {
      routes[locale] = {};
    }
    routes[locale][route] = path;
    return routes;
  }, {});

  /**
   * @callback RouteGetter
   * @param {Internationalizer} _
   * @returns {Routes}
   */

  /**
   * @type {RouteGetter}
   */
  return function getRoutes (_) {
    if (routeMap.has(_.resolvedLocale)) {
      return routeMap.get(_.resolvedLocale);
    }
    const routeObj = [
      'root', 'logout', 'home', 'signup', 'activation',
      'lostPassword', 'resetPassword', 'users', 'delete',
      'reset', 'coverage'
    ].reduce((o, route) => {
      o[route] = (
        customRoutesObj[_.resolvedLocale] &&
        customRoutesObj[_.resolvedLocale][route]
      ) || _(`route_${route}`);
      return o;
    }, {});
    routeMap.set(_.resolvedLocale, routeObj);
    return routeObj;
  };
}

exports.layoutAndTitleGetter = layoutAndTitleGetter;
exports.checkLocaleRoutes = checkLocaleRoutes;
exports.routeGetter = routeGetter;

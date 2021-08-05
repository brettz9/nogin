'use strict';

const {readdirSync} = require('fs');
const {join} = require('path');

const layoutView = require('./views/layout.js');
const {i18n, getLangDir} = require('./modules/i18n.js');
const integrityMap = require('./integrityMap.json');

const headProps = ['headPre', 'headPost'];
const bodyProps = ['bodyPre', 'bodyPost'];

/**
 * @param {string} elem
 * @param {string} content
 * @returns {string}
 */
function wrap (elem, content) {
  return `<${elem}>${content}</${elem}>`;
}

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
 * @param {Jamilih} jml
 */
const layoutAndTitleGetter = (config, jml) => {
  const {
    favicon,
    stylesheet,
    noBuiltinStylesheets,
    userJS,
    userJSModule,
    injectHTML,
    localScripts,
    triggerCoverage,
    noPolyfill,
    useESM
  } = config;

  // Has SHAs at https://code.jquery.com/ ;
  //  see also https://jquery.com/download/
  // todo[jquery@>3.6.0]: Update SHA (and path(s) if necessary)

  // See https://github.com/jquery-form/form for CDN SHA
  // todo: Update SHA (and path(s) if necessary) for jquery-form

  // Todo[bootstrap@>5.1.0]: Update SHA (and path(s) if necessary) for
  //   bootstrap css (including RTL), bootstrap js, and @popperjs/core
  // @popperjs/core is a bootstrap dep.; see
  //   https://github.com/twbs/bootstrap/blob/main/config.yml
  // Get src/integrity at https://github.com/twbs/bootstrap/blob/main/config.yml

  // Todo: If keeping, add badge to a demo and make enableable (off
  //   by default) with option
  // todo[github-fork-ribbon-css@>0.2.3]: Update SHA (and path(s) if necessary)

  const securitySourceAttributes = (type, name) => {
    const base = integrityMap[type].find(({name: nm}) => {
      return name === nm;
    });
    const baseObj = {
      [type === 'link' ? 'href' : 'src']:
        base[localScripts ? 'local' : 'remote'],
      crossorigin: 'anonymous'
    };
    if (localScripts && base.noLocalIntegrity) {
      return baseObj;
    }
    return {
      ...baseObj,
      integrity: base.integrity
    };
  };

  /**
   * @param {LayoutAndTitleArgs} businessLogicArgs
   * @returns {TitleWithLayoutCallback}
   */
  return (businessLogicArgs) => {
    const {_, title} = businessLogicArgs;
    const langDir = getLangDir(_);
    const isRtl = Boolean(langDir.dir);
    return {
      _,
      langDir,
      title,
      layout (templateArgs) {
        const cfg = {
          // Though should be trusted anyways, do not let template
          //   arguments override.
          ...templateArgs,
          langDir,
          isRtl,
          triggerCoverage,
          favicon,
          stylesheet,
          noBuiltinStylesheets,
          userJS,
          userJSModule,
          localScripts,
          securitySourceAttributes,
          noPolyfill,
          useESM,
          ...businessLogicArgs
        };

        // eslint-disable-next-line max-len
        // eslint-disable-next-line node/global-require, import/no-dynamic-require
        const injectedHTML = injectHTML ? require(injectHTML)(cfg) : {};
        if (injectHTML) {
          Object.entries(injectedHTML).forEach(([prop, val]) => {
            const type = headProps.includes(prop) ? 'head' : 'body';
            let container = val;
            if (typeof val === 'string') {
              container = jml.toJML(
                wrap(type, val)
              ).$document.childNodes[0][2];
              container = type === 'head'
                // <head|body>:first-child > *
                ? container[0][1]
                : container[1][1];
            }
            injectedHTML[prop] = container;
          });
        }
        [...headProps, ...bodyProps].forEach((prop) => {
          injectedHTML[prop] = injectedHTML[prop] || [''];
        });

        return layoutView(
          cfg,
          injectedHTML
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
  const localePath = join(localesBasePath, '_locales');
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
        if (key.startsWith('safe_')) {
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
 * @param {string[]} customRoute Equal-separated locale=route=path
 * @returns {RouteGetter}
 */
function routeGetter (customRoute) {
  /**
   * Keyed by locale, then by route, and set to a path.
   * @typedef {Object<string, Object<string, string>>} CustomRouteObject
  */
  /**
   * @type {CustomRouteObject}
   */
  const customRoutesObj = customRoute.reduce((routes, routeInfo) => {
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
      const i18nRoute = _(`route_${route}`);
      o[route] = (
        customRoutesObj[_.resolvedLocale] &&
        customRoutesObj[_.resolvedLocale][route]
      ) || i18nRoute;

      // Add a safe route (since only `customRoutes` should allow URLs)
      //  so if Firefox 2 is detected, client can redirect to that with
      //  location.assign() (since `location.href` not supported).
      o['safe_' + route] = i18nRoute;
      return o;
    }, {});
    routeMap.set(_.resolvedLocale, routeObj);
    return routeObj;
  };
}

exports.layoutAndTitleGetter = layoutAndTitleGetter;
exports.checkLocaleRoutes = checkLocaleRoutes;
exports.routeGetter = routeGetter;

import {readdir, readFile} from 'fs/promises';
import {join} from 'path';

import layoutView from './views/layout.js';
import {i18n, getLangDir} from './modules/i18n.js';

/**
 * @typedef {string} Path
 */
/**
 * @typedef {Record<Route, Path>} Routes
 */
/**
 * @callback RouteGetter
 * @param {import('./modules/email-dispatcher.js').Internationalizer} _
 * @returns {Routes}
 */

/**
 * @callback SecuritySourceAttributes
 * @param {"link"|"script"} type
 * @param {string} name
 * @returns {{
 *   crossorigin: string,
 *   integrity?: string
 * }}
 */

/**
 * @typedef {{
 *   name: string,
 *   local: string,
 *   integrity: string,
 *   remote: string,
 * }} LinkScript
 */

/**
 * @typedef {{
 *   link: (LinkScript & {
 *     noLocalIntegrity?: boolean
 *   })[],
 *   script: (LinkScript & {
 *     global: string
 *   })[]
 * }} IntegrityMap
 */

/** @type {IntegrityMap} */
const integrityMap = JSON.parse(
  // @ts-expect-error It's ok
  await readFile(new URL('integrityMap.json', import.meta.url))
);

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
 * @typedef {{
 *   content: import('jamilih').JamilihChildren,
 *   scripts?: ([string, import('jamilih').JamilihAttributes])[],
 * }} TemplateArgs
 */

/**
 * @typedef {(
 *   templateArgs: TemplateArgs
 * ) => Promise<[import('jamilih').JamilihDoc]>} LayoutCallback
 */

/**
 * @typedef {{
 *   _: import('./modules/email-dispatcher.js').Internationalizer,
 *   title: string,
 *   layout: LayoutCallback,
 *   langDir: import('../server/modules/i18n.js').LanguageDirection
 * }} TitleWithLayoutCallback
 */

/**
 * `template` - The template name (made available to
 * `injectHTML` so it can vary the generated HTML per template).
 * @typedef {{
 *   _: import('./modules/email-dispatcher.js').Internationalizer
 *   title: string,
 *   template: string
 *   error?: string,
 *   csrfToken?: string
 * }} LayoutAndTitleArgs
 */

/**
 * @callback LayoutAndTitleGetter
 * @param {LayoutAndTitleArgs} businessLogicArgs
 * @returns {TitleWithLayoutCallback}
 */

/**
 * @param {import('./app.js').RouteConfig} config
 * @param {import('jamilih').jml} jml
 * @returns {LayoutAndTitleGetter}
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
  // todo[jquery@>3.7.1]: Update SHA (and path(s) if necessary)

  // See https://github.com/jquery-form/form for CDN SHA
  // todo: Update SHA (and path(s) if necessary) for jquery-form

  // todo[@fortawesome/fontawesome-free@>6.6.0]: Update SHA (and path(s)
  //   if necessary)

  // Todo[bootstrap@>5.3.3]: Update SHA (and path(s) if necessary) for
  //   bootstrap css (including RTL), bootstrap js, and @popperjs/core
  // @popperjs/core is a bootstrap dep.; see
  //   https://github.com/twbs/bootstrap/blob/main/hugo.yml
  // Get src/integrity at https://github.com/twbs/bootstrap/blob/main/hugo.yml

  // Todo: If keeping, add badge to a demo and make enableable (off
  //   by default) with option
  // todo[github-fork-ribbon-css@>0.2.3]: Update SHA (and path(s) if necessary)

  /** @type {SecuritySourceAttributes} */
  const securitySourceAttributes = (type, name) => {
    const base =
    /**
     * @type {(LinkScript & {
     *   noLocalIntegrity?: boolean | undefined;
     * }) | (LinkScript & {
     *   global: string;
     * })}
     */
    (integrityMap[type].find(
      /**
       * @param {{
       *   name: string
       * }} cfg
       * @returns {boolean}
       */
      ({name: nm}) => {
        return name === nm;
      }
    ));
    const baseObj = {
      [type === 'link' ? 'href' : 'src']:
        base[localScripts ? 'local' : 'remote'],
      crossorigin: 'anonymous'
    };
    if (localScripts && 'noLocalIntegrity' in base && base.noLocalIntegrity) {
      return baseObj;
    }
    return {
      ...baseObj,
      integrity: base.integrity
    };
  };

  /** @type {LayoutAndTitleGetter} */
  return (businessLogicArgs) => {
    const {_, title} = businessLogicArgs;
    const langDir = getLangDir(_);
    const isRtl = Boolean(langDir.dir);

    return {
      _,
      langDir,
      title,
      async layout (templateArgs) {
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

        const injectedHTML = injectHTML
          // // eslint-disable-next-line no-unsanitized/method --- User path
          ? (await import(injectHTML)).default(cfg)
          : {};
        if (injectHTML) {
          Object.entries(injectedHTML).forEach(([prop, val]) => {
            const type = headProps.includes(prop) ? 'head' : 'body';
            let container = val;
            if (typeof val === 'string') {
              container = /** @type {import('jamilih').JamilihArray} */ (
                /** @type {import('jamilih').JamilihChildType[]} */
                (/** @type {import('jamilih').JamilihDoc} */ (
                  jml.toJML(
                    wrap(type, val)
                  )
                ).$document.childNodes)[0]
              )[2];
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

/**
 * @param {RouteGetter} getRoutes
 * @param {string} localesBasePath
 * @returns {Promise<void>}
 */
const checkLocaleRoutes = async (getRoutes, localesBasePath) => {
  /**
   * Ensure locales do not use reserved patterns nor have duplicate
   * names (which could cause circular redirecting).
   */
  const localePath = join(localesBasePath, '_locales');
  const availableLocales = await readdir(localePath);
  const setI18n = i18n(localesBasePath);

  await Promise.all(
    availableLocales.map(async (locale) => {
      const _ = await setI18n({
        // @ts-expect-error Why not using empty overload?
        acceptsLanguages: () => [locale]
      });
      const routes = getRoutes(_);

      /** @type {string[]} */
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
 * @typedef {"activation"|"lostPassword"|
 *   "resetPassword"|"users"|"delete"|"reset"|"coverage"|"accessAPI"|
 *   "groups"|"privileges"|"signup"|"root"|"home"} Route
 */

const routeMap = new Map();

/**
 * @param {string[]} customRoute Equal-separated locale=route=path
 * @returns {RouteGetter}
 */
function routeGetter (customRoute) {
  /**
   * Keyed by locale, then by route, and set to a path.
   * @typedef {{[key: string]: {[key: string]: string}}} CustomRouteObject
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
  }, /** @type {CustomRouteObject} */ ({}));

  /**
   * @type {RouteGetter}
   */
  return function getRoutes (_) {
    if (routeMap.has(_.resolvedLocale)) {
      return routeMap.get(_.resolvedLocale);
    }
    const routeObj = /** @type {Route[]} */ ([
      'root', 'logout', 'home', 'signup', 'activation',
      'lostPassword', 'resetPassword', 'users', 'delete',
      'reset', 'coverage', 'accessAPI', `groups`, 'privileges'
    ]).reduce((o, route) => {
      const i18nRoute = _(`route_${route}`);
      o[route] = (
        customRoutesObj[_.resolvedLocale] &&
        customRoutesObj[_.resolvedLocale][route]
      ) || i18nRoute;

      /* eslint-disable jsdoc/valid-types -- Bug */
      // Add a safe route (since only `customRoutes` should allow URLs)
      //  so if Firefox 2 is detected, client can redirect to that with
      //  location.assign() (since `location.href` not supported).
      o[/** @type {`safe_${Route}`} */ ('safe_' + route)] = i18nRoute;
      return o;
    }, /** @type {Record<Route|`safe_${Route}`, string>} */ ({}));
    /* eslint-enable jsdoc/valid-types -- Bug */
    routeMap.set(_.resolvedLocale, routeObj);
    return routeObj;
  };
}

export {layoutAndTitleGetter, checkLocaleRoutes, routeGetter};

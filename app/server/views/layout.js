/**
 * @todo change `content` and `scripts` to `JamilihDocumentFragmentContent[]`
 *   once jamilih updated
 * @param {import('../routeUtils.js').LayoutAndTitleArgs &
 *   import('../routeUtils.js').TemplateArgs & {
 *   langDir: import('../modules/i18n.js').LanguageDirection,
 *   isRtl: boolean,
 *   triggerCoverage: boolean,
 *   favicon: string,
 *   stylesheet: string,
 *   noBuiltinStylesheets: boolean,
 *   userJS: string,
 *   userJSModule: string,
 *   localScripts: boolean,
 *   securitySourceAttributes:
 *     import('../routeUtils.js').SecuritySourceAttributes
 *   noPolyfill: boolean,
 *   useESM: boolean,
 * }} cfg
 * @param {{
 *   headPre: import('jamilih').JamilihArray[],
 *   headPost: import('jamilih').JamilihArray[],
 *   bodyPre: import('jamilih').JamilihArray[],
 *   bodyPost: import('jamilih').JamilihArray[]
 * }} injectedHTML
 * @returns {[import('jamilih').JamilihDoc]}
 */
const layout = ({
  // _,
  langDir, isRtl, content, scripts, title,
  favicon, stylesheet, noBuiltinStylesheets, userJS, userJSModule,
  noPolyfill, useESM, csrfToken,
  error,
  triggerCoverage, securitySourceAttributes
}, injectedHTML) => {
  return [{$document: {
    childNodes: [
      {$DOCTYPE: {name: 'html'}},
      /** @type {import('jamilih').JamilihArray} */
      (['html', langDir, [
        ['head', [
          // eslint-disable-next-line @stylistic/max-len -- Long
          // eslint-disable-next-line unicorn/text-encoding-identifier-case -- Required with hyphen
          ['meta', {charset: 'utf-8'}],
          ...(csrfToken
            ? [
              ['meta', {
                name: 'csrf-token',
                content: csrfToken
              }]
            ]
            : ['']
          ),
          ['title', [title]],
          ...injectedHTML.headPre,
          ['link', {
            rel: 'shortcut icon', type: 'image/x-icon',
            href: favicon || 'data:image/x-icon;,'
          }],
          ...(noBuiltinStylesheets
            ? ['']
            : [
              ['link', {
                rel: 'stylesheet',
                ...securitySourceAttributes(
                  'link', '@fortawesome/fontawesome-free'
                )
              }],
              ['link', {
                rel: 'stylesheet',
                ...securitySourceAttributes(
                  'link', '@fortawesome/fontawesome-free/solid'
                )
              }],
              ['link', {
                rel: 'stylesheet',
                ...securitySourceAttributes(
                  'link',
                  isRtl ? 'bootstrap-rtl' : 'bootstrap'
                )
              }],
              ['link', {rel: 'stylesheet', href: '/css/style.css'}],
              ['link', {
                rel: 'stylesheet',
                ...securitySourceAttributes('link', 'github-fork-ribbon-css')
              }]
            ]),

          stylesheet ? ['link', {rel: 'stylesheet', href: stylesheet}] : '',

          error
            // Use this so that client-side code can add the error to
            //   a dialog, etc.
            ? ['script', [
              'window.NoginInitialErrorGlobal = ' + JSON.stringify(error)
            ]]
            : '',

          ['script', {
            ...securitySourceAttributes('script', 'jquery'),
            defer: 'defer'
          }],
          ['script', {
            ...securitySourceAttributes('script', '@popperjs/core'),
            defer: 'defer'
          }],
          ['script', {
            ...securitySourceAttributes('script', 'bootstrap'),
            defer: 'defer'
          }],
          ['script', {
            ...securitySourceAttributes('script', 'jquery-form-plus'),
            defer: 'defer'
          }],
          /*
          ['script', {
            src: '/node_modules/jamilih/dist/jml.js'
          }],
          */
          // While we could import this within `_lang`, we'd need a separate
          //   build for each locale
          ['script', {
            src: '/node_modules/intl-dom/dist/index.umd.min.js'
          }],
          // We don't roll this up as it is both locale-dependent and
          //   CLI-flag-dependent
          ['script', {
            src: '/_lang'
          }],
          triggerCoverage && !scripts
            // Need this to set `__coverage__` for those pages which
            //  otherwise wouldn't get an instrumented script file,
            //  e.g., 404 and users
            // See https://github.com/cypress-io/code-coverage#instrument-your-application
            ? ['script', {
              src: '/js/controllers/emptyController.js'
            }]
            : '',
          noPolyfill
            // We will avoid even with `useESM` (which doesn't have an
            //  equivalent version) as that is mostly for testing and
            //  shouldn't need it
            ? ''
            : ['script', {
              src: '/js/polyfills/polyfills.iife.min.js'
            }],
          {'#': scripts
            ? (useESM
              ? scripts.map(([
                tag,
                atts
              ]) => {
                // Currently all scripts are controllers
                // istanbul ignore else
                if (
                  typeof atts.src === 'string' &&
                  atts.src.endsWith('Controller.iife.min.js')
                ) {
                  delete atts.defer;
                  atts.src = atts.src.replace(
                    /Controller\.iife\.min\.js$/u,
                    'Controller.js'
                  );
                  atts.type = 'module';
                }
                return [tag, atts];
              })
              : scripts)
            : []
          },
          userJS
            ? ['script', {
              src: userJS
            }]
            : '',
          userJSModule
            ? ['script', {
              type: 'module',
              src: userJSModule
            }]
            : '',
          ...injectedHTML.headPost
        ]],
        ['body', [
          ...injectedHTML.bodyPre,
          {'#': content},
          ...injectedHTML.bodyPost
        ]]
      ]])
    ]
  }}];
};

export default layout;

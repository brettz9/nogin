/* eslint-disable max-len */
'use strict';

module.exports = ({
  _, langDir, isRtl, content, scripts, title,
  favicon, stylesheet, noBuiltinStylesheets, userJS, userJSModule,
  noPolyfill, useESM, csrfToken,
  error,
  triggerCoverage, securitySourceAttributes
}, injectedHTML) => {
  return [{$document: {
    childNodes: [
      {$DOCTYPE: {name: 'html'}},
      ['html', langDir, [
        ['head', [
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
                ...securitySourceAttributes('link', '@fortawesome/fontawesome-free')
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
            // Use this so that client-side code can add the error to a dialog, etc.
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
            ...securitySourceAttributes('script', 'jquery-form'),
            defer: 'defer'
          }],
          /*
          ['script', {
            src: '/node_modules/jamilih/dist/jml.js'
          }],
          */
          // While we could import this within `_lang`, we'd need a separate build
          //   for each locale
          ['script', {
            src: '/node_modules/intl-dom/dist/index.umd.min.js'
          }],
          // We don't roll this up as it is both locale-dependent and CLI-flag-dependent
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
            // We will avoid even with `useESM` (which doesn't have an equivalent
            //  version) as that is mostly for testing and shouldn't need it
            ? ''
            : ['script', {
              src: '/js/polyfills/polyfills.iife.min.js'
            }],
          {'#': scripts
            ? (useESM
              ? scripts.map(([tag, atts]) => {
                // Currently all scripts are controllers
                // istanbul ignore else
                if (atts.src.endsWith('Controller.iife.min.js')) {
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
      ]]
    ]
  }}];
};

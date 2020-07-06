/* eslint-disable max-len */
'use strict';

module.exports = ({
  _, content, scripts, title, localScripts,
  favicon, stylesheet, noBuiltinStylesheets, userJS, userJSModule,
  noPolyfill, useESM,
  error,
  triggerCoverage
}, injectedHTML) => {
  return [{$document: {
    $DOCTYPE: {name: 'html'},
    head: [
      ['title', [title]],
      ...(injectedHTML.headPre || ['']),
      ['link', {
        rel: 'shortcut icon', type: 'image/x-icon',
        href: favicon || 'data:image/x-icon;,'
      }],
      ...(noBuiltinStylesheets
        ? ['']
        : [
          // todo[font-awesome@>4.7.0]: Update SHA (and path(s) if necessary)
          ['link', {
            href: localScripts
              ? '/node_modules/font-awesome/css/font-awesome.min.css'
              : 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
            rel: 'stylesheet',
            integrity: 'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN',
            crossorigin: 'anonymous'
          }],
          ['link', {
            rel: 'stylesheet',
            href: localScripts
              ? '/node_modules/bootstrap/dist/css/bootstrap.min.css'
              : 'https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css',
            integrity: 'sha384-r4NyP46KrjDleawBgD5tp8Y7UzmLA05oM1iAEQ17CSuDqnUK2+k9luXQOfXJCJ4I',
            crossorigin: 'anonymous'
          }],
          ['link', {rel: 'stylesheet', href: '/css/style.css'}],
          // Todo: If keeping, add badge to a demo and make enableable (off
          //   by default) with option
          // todo[github-fork-ribbon-css@>0.2.3]: Update SHA (and path(s) if necessary)
          ['link', {
            rel: 'stylesheet',
            href: localScripts
              // No minified version in distribution; filed
              //  https://github.com/simonwhitaker/github-fork-ribbon-css/issues/70
              ? '/node_modules/github-fork-ribbon-css/gh-fork-ribbon.css'
              : 'https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css',
            integrity: localScripts ? null : 'sha256-PVObJvYe7iXCSBcVkQUFvkV9TQGFh5J/ga8WHkLqHAo=',
            crossorigin: 'anonymous'
          }]
        ]),

      stylesheet ? ['link', {rel: 'stylesheet', href: stylesheet}] : '',

      error
        // Use this so that client-side code can add the error to a dialog, etc.
        ? ['script', [
          'window.NoginInitialErrorGlobal = ' + JSON.stringify(error)
        ]]
        : '',

      // Has SHAs at https://code.jquery.com/ ;
      //  see also https://jquery.com/download/
      // todo[jquery@>3.5.1]: Update SHA (and path(s) if necessary)
      ['script', {
        src: localScripts
          ? '/node_modules/jquery/dist/jquery.min.js'
          : 'https://code.jquery.com/jquery-3.5.1.min.js',
        integrity: 'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      // Popper is a bootstrap dep.; see https://github.com/twbs/bootstrap/blob/main/config.yml
      // Get src/integrity at https://github.com/twbs/bootstrap/blob/main/config.yml

      // Todo[bootstrap@>5.0.0-alpha1]: Update SHA (and path(s) if necessary) for
      //   bootstrap css, bootstrap js, and popper.js
      ['script', {
        src: localScripts
          ? '/node_modules/popper.js/dist/umd/popper.min.js'
          : 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
        integrity: 'sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      ['script', {
        src: localScripts
          ? '/node_modules/bootstrap/dist/js/bootstrap.min.js'
          : 'https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js',
        integrity: 'sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      // See https://github.com/jquery-form/form for CDN SHA
      // todo[jquery-form@>4.3.0]: Update SHA (and path(s) if necessary)
      ['script', {
        src: localScripts
          ? '/node_modules/jquery-form/dist/jquery.form.min.js'
          : 'https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.3.0/jquery.form.min.js',
        integrity: 'sha384-qlmct0AOBiA2VPZkMY3+2WqkHtIQ9lSdAsAn5RUJD/3vA5MKDgSGcdmIv4ycVxyn',
        crossorigin: 'anonymous',
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
      ...(injectedHTML.headPost || [''])
    ],
    body: [
      ...(injectedHTML.bodyPre || ['']),
      {'#': content},
      ...(injectedHTML.bodyPost || [''])
    ]
  }}];
};

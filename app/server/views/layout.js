/* eslint-disable max-len */
'use strict';

module.exports = ({
  _, content, scripts, title, localScripts,
  favicon, stylesheet, noBuiltinStylesheets, userJS, userJSModule,
  includePolyfill, useESM,
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
              : 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
            integrity: 'sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T',
            crossorigin: 'anonymous'
          }],
          ['link', {rel: 'stylesheet', href: '/css/style.css'}],
          // Todo: If keeping, add badge to a demo and make enableable (off
          //   by default) with option
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
          'window.NodeLoginInitialErrorGlobal = ' + JSON.stringify(error)
        ]]
        : '',

      ['script', {
        src: localScripts
          ? '/node_modules/jquery/dist/jquery.min.js'
          : 'https://code.jquery.com/jquery-3.4.1.min.js',
        integrity: 'sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      // Popper is a boostrap dep.; see https://github.com/twbs/bootstrap/blob/master/config.yml#L75
      // Get src/integrity at https://github.com/twbs/bootstrap/blob/master/config.yml
      ['script', {
        src: localScripts
          ? '/node_modules/popper.js/dist/umd/popper.min.js'
          : 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js',
        integrity: 'sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      ['script', {
        src: localScripts
          ? '/node_modules/bootstrap/dist/js/bootstrap.min.js'
          : 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
        integrity: 'sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM',
        crossorigin: 'anonymous',
        defer: 'defer'
      }],
      ['script', {
        src: localScripts
          ? '/node_modules/jquery-form/dist/jquery.form.min.js'
          : 'https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js',
        integrity: 'sha384-FzT3vTVGXqf7wRfy8k4BiyzvbNfeYjK+frTVqZeNDFl8woCbF0CYG6g2fMEFFo/i',
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
      includePolyfill
        // We will currently skip even with `useESM` as that is mostly for
        //  testing and shouldn't need it
        ? ['script', {
          src: '/js/polyfills/polyfills.iife.min.js'
        }]
        : '',
      {'#': scripts
        ? (useESM
          ? scripts.map((script) => {
            // Currently all scripts are controllers
            // istanbul ignore else
            if (script.src.endsWith('Controller.iife.min.js')) {
              delete script.defer;
              script.src = script.src.replace(
                /Controller\.iife\.min\.js$/u,
                'Controller.js'
              );
              script.type = 'module';
            }
            return script;
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

'use strict';

const {i18n} = require('intl-dom');
const walk = require('pug-walk');
const fileFetch = require('file-fetch');

global.fetch = fileFetch; // For `intl-dom`

module.exports = function (scoped = false) {
  return async function (req, res, next = () => { /**/ }) {
    // Todo: Support more locales!

    const _ = await i18n({
      // Detects locale from `req.headers['accept-language']` and
      //   requires appropriate i18n file; this is for Express;
      //   for non-Express, could use https://github.com/florrain/locale
      locales: req.acceptsLanguages(),
      localesBasePath: 'app/server'
    });
    res.locals.plugins = [{
      // Todo: Make layout title configurable instead?
      // Todo: i18nize country names (account and print pages);
      //   format for date on print page
      // Todo: How to get AST of attributes for, e.g., internationalizing
      //   aria-label and such?
      // Other available methods:
      // preLex, postLex, preParse, postParse, preLoad, postLoad,
      //  preFilters, postFilters, preLink, postLink, preCodeGen, postCodeGen
      postParse (ast /* , postParseOptions */) {
        // `postParseOptions` has functions (resolve, read, lex, parse) and
        //  strings (filename, src; basedir? (currently undefined))
        return walk(ast, (node /* , replace */) => {
          // `replace` may be an array if parent is block and when parent is
          //  Include and node is an IncludeFilter: https://github.com/pugjs/pug/tree/master/packages/pug-walk#walkast-before-after-options
          // Can replace more than just `val` if needed:
          // replace({type: 'Text', val: 'bar', line: node.line});
          /*
          // Todo: To allow processing dynamic content passed in at run-time,
          //   we could check for `_(#{dynamicVarName})` by checking for
          1. `_(` with `node.type` 'Text'
          2. `node.val` ("dynamicVarName" here) `node.type` 'Code'
              (`node.mustEscape` will indicate whether this is `#{}` or `!{}`);
              see https://pugjs.org/language/interpolation.html
          1. `)` with `node.type` 'Text'

          console.log('type', node.type);
          if (node.type === 'Code') {
            console.log('node', node);
          }
          */
          if (node.type === 'Text') {
            let templateName;
            if (scoped) {
              const {filename} = node;
              const fn = filename.match(/(?<templateName>[^/]*?)\.pug/u);
              ({templateName} = (fn && fn.groups) || {});
            }
            // Todo: We could parse object options specified (as text) within
            //  templates, e.g., after a comma
            node.val = node.val.replace(/_\((?<key>[^)]*)\)/u, (n0, key) => {
              return _(scoped && templateName ? `${templateName}.${key}` : key);
            });
          }
        });
      }
    }];
    next();
  };
};

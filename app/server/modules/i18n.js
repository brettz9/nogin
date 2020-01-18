'use strict';

const {JSDOM} = require('jsdom');
const {i18n} = require('intl-dom');
global.fetch = require('file-fetch'); // For `intl-dom`

global.document = (new JSDOM()).window.document;

module.exports = function () {
  return async function (req, res, next = () => { /**/ }) {
    const _ = await i18n({
      // Detects locale from `req.headers['accept-language']` and
      //   requires appropriate i18n file; this is for Express;
      //   for non-Express, could use https://github.com/florrain/locale
      locales: req.acceptsLanguages(),
      localesBasePath: 'app/server'
    });

    // Todo: Detect template requested from `req.url`
    // See https://expressjs.com/en/guide/using-template-engines.html
    // and https://expressjs.com/en/advanced/developing-template-engines.html

    next();

    // Return so business logic can use as well
    return _;
  };
};

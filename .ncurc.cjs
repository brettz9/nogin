'use strict';

module.exports = {
  reject: [
    // Until `mocha-multi-reporters` supports Mocha 12:
    //   https://github.com/stanleyhlng/mocha-multi-reporters/issues/111
    'mocha',

    // Fixing version of `file-fetch` to allow working with jsdom-overwritten
    //   global `URL`s as needed in typeson-registry (intl-dom?)
    'file-fetch'

    // Todo[bootstrap@>5.3.8]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/main/config.yml
    // '@popperjs/core'
  ]
};

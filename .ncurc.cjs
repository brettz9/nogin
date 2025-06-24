'use strict';

module.exports = {
  reject: [
    // Fixing version of `file-fetch` to allow working with jsdom-overwritten
    //   global `URL`s as needed in typeson-registry
    'file-fetch'

    // Todo[bootstrap@>5.3.7]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/main/config.yml
    // '@popperjs/core'
  ]
};

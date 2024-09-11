'use strict';

module.exports = {
  reject: [
    // Fixing version of `file-fetch` to allow working with jsdom-overwritten
    //   global `URL`s as needed in typeson-registry
    'file-fetch'

    // Todo[bootstrap@>5.3.3]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/master/config.yml
    // '@popperjs/core'
  ]
};

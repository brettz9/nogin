'use strict';

module.exports = {
  reject: [
    // Lock in any npm packages here
    // Todo[bootstrap@>5.0.0-beta1]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/master/config.yml
    '@popperjs/core',

    // Todo[husky@>=5.5]: Check for license
    'husky'
  ]
};

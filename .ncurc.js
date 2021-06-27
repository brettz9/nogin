'use strict';

module.exports = {
  reject: [
    // Lock in any npm packages here

    // Switch when ready to transition to ESM
    'command-line-basics',
    'es-file-traverse',

    // Todo[bootstrap@>5.0.2]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/master/config.yml
    '@popperjs/core'
  ]
};

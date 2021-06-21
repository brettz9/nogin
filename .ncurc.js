'use strict';

module.exports = {
  reject: [
    // Switch when ready to transition to ESM
    'command-line-basics',
    'es-file-traverse',
    // Lock in any npm packages here
    // Todo[bootstrap@>5.0.1]: Update only if bootstrap updates the
    //  version; see https://github.com/twbs/bootstrap/blob/master/config.yml
    '@popperjs/core'
  ]
};

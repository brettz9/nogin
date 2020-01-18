'use strict';

module.exports = {
  // Whitelist all for checking besides `peer` which indicates
  //   somewhat older versions of `eslint` we still support even
  //   while our devDeps point to a more recent version
  dep: 'prod,dev,optional,bundle',
  reject: [
    // Todo[bootstrap@>4.4.1]: See if updated for css, js, and popper.js at https://github.com/twbs/bootstrap/blob/master/config.yml
    'bootstrap',
    'popper.js'
  ]
};

'use strict';

module.exports = {
  reject: [
    // Todo[bootstrap@>5.0.0-beta1]: beta1 wasn't at https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-beta1/css/bootstrap.min.css
    // Even 4.5.3 wasn't on the CDN

    // Lock in any npm packages here
    // Todo[bootstrap@>5.0.0-alpha1]: Update if bootstrap updates the version;
    //  see https://github.com/twbs/bootstrap/blob/master/config.yml
    'popper.js'
  ]
};

'use strict';

module.exports = function (app, opts) {
  app.get('/dynamic-route', function () {
    console.log('got a dynamic route');
    console.log('got options, e.g.,', opts.userJS);
  });
};

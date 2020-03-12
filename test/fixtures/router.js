'use strict';

module.exports = function (app, opts) {
  app.get('/dynamic-route', function (req, res) {
    res.end(
      `got a dynamic route with options, e.g., ${opts.userJS}`
    );
  });
};

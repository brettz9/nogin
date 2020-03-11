'use strict';
module.exports = function (opts) {
  return function (req, res, next) {
    console.log('gets options, e.g.,', opts.favicon);
    console.log('req.url', req.url);
    next();
  };
};

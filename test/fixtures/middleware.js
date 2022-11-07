const middleware = function (opts) {
  return function (req, res, next) {
    // Testing wasn't picking up logging, so we'll set headers
    res.header('x-middleware-gets-options', opts.favicon);
    res.header('x-middleware-gets-req', req.url);
    next();
  };
};

export default middleware;

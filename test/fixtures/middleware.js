/**
 * @param {{
 *   favicon: string
 * }} opts
 */
const middleware = function (opts) {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return function (req, res, next) {
    // Testing wasn't picking up logging, so we'll set headers
    res.header('x-middleware-gets-options', opts.favicon);
    res.header('x-middleware-gets-req', req.url);
    next();
  };
};

export default middleware;

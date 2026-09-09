/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {() => void} next
 * @param {{userJS: string}} opts
 * @returns {void}
 */
function fallback (req, res, next, opts) {
  if (req.path === '/') {
    res.type('html');
    res.end('custom logged-in root');
    return;
  }
  if (req.path === '/fallback-route') {
    res.end(`got a fallback route with options, e.g., ${opts.userJS}`);
    return;
  }
  next();
}

export default fallback;

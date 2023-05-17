/**
 * @param {import('express').Application} app
 * @param {{userJS: string}} opts
 * @returns {void}
 */
function router (app, opts) {
  app.get('/dynamic-route', function (req, res) {
    res.end(
      `got a dynamic route with options, e.g., ${opts.userJS}`
    );
  });
}

export default router;

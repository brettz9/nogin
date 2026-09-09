/**
 * @param {import('express').Application} app
 * @param {{userJS: string}} opts
 * @returns {void}
 */
function router (app, opts) {
  app.get('/dynamic-route', async function (req, res) {
    const hasReadUsers = await req.hasPrivilege('nogin.read-users');
    res.end(
      `got a dynamic route with options, e.g., ${opts.userJS}; ` +
      `has read-users: ${hasReadUsers}`
    );
  });
}

export default router;

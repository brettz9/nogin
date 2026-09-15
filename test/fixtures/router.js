/**
 * @param {import('express').Application} app
 * @param {{userJS: string}} opts
 * @returns {void}
 */
function router (app, opts) {
  app.get('/dynamic-route', async function (req, res) {
    const hasReadUsers = await req.hasPrivilege('nogin.read-users');
    const readUsersValue = await req.getPrivilegeValue('nogin.read-users');
    const {root, privs} = await req.getPrivileges();
    res.end(
      `got a dynamic route with options, e.g., ${opts.userJS}; ` +
      `has read-users: ${hasReadUsers}; ` +
      `read-users value: ${readUsersValue}; ` +
      `root: ${root}; ` +
      `has read-users key: ${Object.hasOwn(privs, 'nogin.read-users')}`
    );
  });
}

export default router;

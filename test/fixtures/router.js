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

    if (!req.session.user) {
      req.session.user = {};
    }
    req.session.user.user = 'testRoot';

    const readUsersValueRoot = await req.getPrivilegeValue('nogin.read-users');
    res.end(
      `got a dynamic route with options, e.g., ${opts.userJS}; ` +
      `has read-users: ${hasReadUsers}; ` +
      `read-users value: ${readUsersValue}; ` +
      `read-users value root: ${readUsersValueRoot}; ` +
      `root: ${root}; ` +
      `has read-users key: ${Object.hasOwn(privs, 'nogin.read-users')}`
    );
  });
}

export default router;

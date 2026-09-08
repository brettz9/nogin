/**
 *
 */
export async function getPrivileges () {
  return await (await fetch({
    url: '/_privs?format=json',
    method: 'GET'
  })).json();
}

/**
 * @param {string} priv
 */
export async function hasPrivilege (priv) {
  const {privs, root} = await getPrivileges();
  return root
    ? true
    : Object.prototype.hasOwnProperty.call(privs, priv);
}

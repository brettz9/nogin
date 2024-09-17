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
  const privs = await getPrivileges();
  return privs === true ? true : privs.includes(priv);
}

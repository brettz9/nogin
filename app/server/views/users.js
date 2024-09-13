/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   accounts: import('../routeList.js').UserAccount[]
*   hasDeleteUsersAccess: boolean
* }} cfg
*/
const users = ({_, layout, accounts, hasDeleteUsersAccess}) => {
  return layout({
    content: [
      ['div', {
        class: 'container users',
        'data-name': 'users',
        role: 'main'
      }, [
        ['h1', [
          _('Users')
        ]],
        ['table', {class: 'table table-bordered table-striped'}, [
          ['thead', {class: 'thead-dark'}, [
            ['tr', [
              ['th', {class: 'users number'}, [_('NumberAbbreviated')]],
              ['th', {class: 'users name'}, [_('Name')]],
              ['th', {class: 'users username'}, [_('Username')]],
              ['th', {class: 'users location'}, [_('Location')]],
              ['th', [_('AccountCreated')]],
              hasDeleteUsersAccess ? ['th', [_('delete')]] : ''
            ]]
          ]],
          ['tbody', /** @type {import('jamilih').JamilihChildren} */ (
            accounts.map((
              {name, user, country, date}, i
            ) => {
              return ['tr', [
                ['td', {class: 'users number'}, [i + 1]],
                ['td', [name]],
                ['td', [user]],
                ['td', [country]],
                ['td', [date]],
                hasDeleteUsersAccess
                  ? ['td', [
                    ['button', {
                      class: 'deleteAccount'
                    }, ['x']]
                  ]]
                  : ''
              ]];
            })
          )]
        ]]
      ]]
    ]
  });
};

export default users;

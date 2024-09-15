import alert from './modals/alert.js';
import confirm from './modals/confirm.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   accounts: (import('../routeList.js').UserAccount & {
 *      groupInfo: {
 *     group: string,
 *     privileges:
 *       import('../modules/account-manager.js').PrivilegeInfo[]
 *   }})[]
 *   hasDeleteUsersAccess: boolean,
 *   hasReadGroupsAccess: boolean
 * }} cfg
 */
const users = ({
  _, layout, accounts, hasDeleteUsersAccess, hasReadGroupsAccess
}) => {
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
              hasReadGroupsAccess
                ? ['th', {class: 'users group'}, [_('Group')]]
                : '',
              ['th', {class: 'users location'}, [_('Location')]],
              ['th', [_('AccountCreated')]],
              hasDeleteUsersAccess ? ['th', [_('delete')]] : ''
            ]]
          ]],
          ['tbody', /** @type {import('jamilih').JamilihChildren} */ (
            accounts.map((
              {name, user, groupInfo: {group, privileges}, country, date}, i
            ) => {
              return ['tr', [
                ['td', {class: 'users number'}, [i + 1]],
                ['td', [name]],
                ['td', [user]],
                hasReadGroupsAccess
                  ? ['td', {
                    title: privileges.map(({privilegeName}) => {
                      return privilegeName;
                    }).join(', ')
                  }, [group]]
                  : '',
                ['td', [country]],
                ['td', [date]],
                hasDeleteUsersAccess
                  ? ['td', [
                    ['button', {
                      class: 'deleteAccount',
                      'data-user': user
                    }, ['x']]
                  ]]
                  : ''
              ]];
            })
          )]
        ]],
        ['br'],
        ['button', {class: 'deleteAllAccounts btn btn-danger focus'}, [
          _('deleteAllAccounts')
        ]],
        alert({_}),
        confirm({_, type: 'deleteAccount'}),
        confirm({_, type: 'deleteAllAccounts'})
      ]]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/usersController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default users;

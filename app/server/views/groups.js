import alert from './modals/alert.js';
import confirm from './modals/confirm.js';
import singleInputForm from './modals/single-input-form.js';

/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   hasEditGroupAccess: boolean,
*   hasAddUserToGroupAccess: boolean,
*   hasRemoveUserFromGroupAccess: boolean,
*   hasAddPrivilegeToGroupAccess: boolean,
*   hasRemovePrivilegeFromGroupAccess: boolean,
*   hasReadPrivilegeAccess: boolean,
*   hasReadUsersAccess: boolean,
*   groupsInfo: {
*     groupName: string,
*     usersInfo: {user: string, _id: string}[],
*     privileges: import('../modules/account-manager.js').PrivilegeInfo[]
*     builtin: boolean
*   }[],
*   users: string[],
*   privileges: string[]
* }} cfg
*/
const groups = ({
  _, layout,
  hasEditGroupAccess,
  hasAddUserToGroupAccess,
  hasRemoveUserFromGroupAccess,
  hasAddPrivilegeToGroupAccess,
  hasRemovePrivilegeFromGroupAccess,
  hasReadPrivilegeAccess,
  hasReadUsersAccess,
  groupsInfo, users, privileges
}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ['h1', [
          _('groups')
        ]],
        ['table', {class: 'table table-bordered table-striped'}, [
          ['thead', {class: 'thead-dark'}, [
            ['tr', [
              ['th', {class: 'groups number'}, [_('NumberAbbreviated')]],
              ['th', {class: 'groups group'}, [_('Group')]],
              hasRemovePrivilegeFromGroupAccess || hasReadPrivilegeAccess
                ? ['th', {class: 'groups privileges'}, [_('Privileges')]]
                : '',
              hasAddPrivilegeToGroupAccess
                ? ['th', {class: 'groups addPrivilegeToGroup'}, [
                  _('addPrivilegeToGroup')
                ]]
                : '',
              hasReadUsersAccess || hasRemoveUserFromGroupAccess
                ? ['th', {class: 'groups users'}, [_('Users')]]
                : '',
              hasAddUserToGroupAccess
                ? ['th', {
                  class: 'groups addUserToGroup'
                }, [_('addUserToGroup')]]
                : '',
              hasEditGroupAccess
                ? ['th', {class: 'groups rename'}, [_('EditGroupName')]]
                : '',
              hasEditGroupAccess ? ['th', [_('delete')]] : ''
            ]]
          ]],
          ['tbody', /** @type {import('jamilih').JamilihChildren} */ (
            groupsInfo.map((
              {groupName, usersInfo, privileges: privs, builtin}, i
            ) => {
              return ['tr', [
                ['td', {class: 'groups group'}, [i + 1]],
                ['td', [
                  builtin
                    ? ['span', [
                      ['b', [groupName]],
                      ' ',
                      ['i', [_('builtin')]]
                    ]]
                    : groupName
                ]],
                hasRemovePrivilegeFromGroupAccess
                  ? ['td', privs.map(({privilegeName}) => {
                    return ['button', {
                      class: 'removePrivilegeFromGroup',
                      'data-privilege': privilegeName,
                      'data-group': groupName
                    }, [
                      `${privilegeName} ☒`
                    ]];
                  })]
                  : hasReadPrivilegeAccess
                    ? ['td', privs.map(({privilegeName}) => {
                      return ['span', [
                        privilegeName
                      ]];
                    })]
                    : '',
                hasAddPrivilegeToGroupAccess
                  ? ['td', [
                    ['button', {
                      class: 'addPrivilegeToGroup btn btn-primary',
                      'data-group': groupName
                    }, ['+']]
                  ]]
                  : '',
                ...builtin
                  ? [
                    hasReadUsersAccess || hasRemoveUserFromGroupAccess
                      ? ['td']
                      : '',
                    hasAddUserToGroupAccess ? ['td'] : '',
                    hasEditGroupAccess ? ['td'] : '',
                    hasEditGroupAccess ? ['td'] : ''
                  ]
                  : [
                    hasRemoveUserFromGroupAccess
                      ? ['td', usersInfo.filter(Boolean).map(({user}) => {
                        return ['button', {
                          class: 'removeUserFromGroup',
                          'data-user': user,
                          'data-group': groupName
                        }, [
                          `${user} ☒`
                        ]];
                      })]
                      : hasReadUsersAccess
                        ? ['td', usersInfo.filter(Boolean).map(({user}) => {
                          return ['span', [user]];
                        })]
                        : '',
                    hasAddUserToGroupAccess
                      ? ['td', [
                        ['button', {
                          class: 'addUserToGroup btn btn-primary',
                          'data-group': groupName
                        }, ['+']]
                      ]]
                      : '',
                    hasEditGroupAccess
                      ? ['td', [
                        ['button', {
                          class: 'renameGroup', 'data-group': groupName
                        }, ['e']]
                      ]]
                      : '',
                    hasEditGroupAccess
                      ? ['td', [
                        ['button', {
                          class: 'deleteGroup',
                          'data-group': groupName
                        }, ['x']]
                      ]]
                      : ''
                  ]
              ]];
            })
          )]
        ]],
        ['br'],
        ['button', {class: 'createGroup btn btn-primary focus'}, [
          _('createGroup')
        ]],
        alert({_}),
        confirm({_, type: 'deleteGroup'}),
        confirm({_, type: 'removeUserFromGroup'}),
        confirm({_, type: 'removePrivilegeFromGroup'}),
        singleInputForm({
          _, type: 'createGroup', inputDirections: 'PleaseInputGroupToCreate'
        }),
        singleInputForm({
          _, type: 'renameGroup', inputDirections: 'PleaseInputGroupToRename'
        }),
        singleInputForm({
          _, type: 'addUserToGroup',
          inputDirections: 'PleaseInputUserToAddToGroup',
          autocomplete: users
        }),
        singleInputForm({
          _, type: 'addPrivilegeToGroup',
          inputDirections: 'PleaseInputPrivilegeToAddToGroup',
          autocomplete: privileges
        })
      ]]
    ],
    scripts: [
      ['script', {
        // src: '/js/controllers/groupsController.js', type: 'module'
        src: '/js/controllers/groupsController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default groups;

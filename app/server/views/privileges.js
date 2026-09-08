import alert from './modals/alert.js';
import confirm from './modals/confirm.js';
import singleInputForm from './modals/single-input-form.js';
import doubleInputForm from './modals/double-input-form.js';
import privilegeValueFields from './modals/privilege-value-fields.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   hasEditPrivilegeAccess: boolean,
 *   hasAddPrivilegeToGroupAccess: boolean,
 *   hasRemovePrivilegeFromGroupAccess: boolean,
 *   hasReadGroupAccess: boolean,
 *   hasReadUsersAccess: boolean,
 *   privilegesInfo: {
 *     privilegeName: string,
 *     description: string,
 *     type: import('../modules/account-manager.js').PrivilegeType,
 *     userVarying: boolean,
 *     builtin: boolean,
 *     usersInfo: {user: string}[],
 *     groupsInfo: {
 *       groupName: string,
 *       builtin: boolean,
 *       usersInfo: {
 *         user: string,
 *         _id: string
 *       }[]
 *     }[]
 *   }[],
 *   groups: string[],
 *   users: string[]
 * }} cfg
 */
const privileges = ({
  _, layout,
  hasEditPrivilegeAccess, hasAddPrivilegeToGroupAccess,
  hasRemovePrivilegeFromGroupAccess,
  hasReadGroupAccess,
  hasReadUsersAccess,
  privilegesInfo, groups, users
}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ['h1', [
          _('Privileges')
        ]],
        ['table', {class: 'table table-bordered table-striped'}, [
          ['thead', {class: 'thead-dark'}, [
            ['tr', [
              ['th', {class: 'privileges number'}, [_('NumberAbbreviated')]],
              ['th', {class: 'privileges privilege'}, [_('Privilege')]],
              ['th', {class: 'privileges description'}, [_('Description')]],
              ['th', {class: 'privileges type'}, [_('PrivilegeType')]],
              ['th', {class: 'privileges scope'}, [_('VariesByUser')]],
              ['th', {class: 'privileges group'}, [_('Group')]],
              hasAddPrivilegeToGroupAccess
                ? ['th', {class: 'privileges addPrivilegeToGroup'}, [
                  _('addPrivilegeToGroup')
                ]]
                : '',
              hasReadUsersAccess
                ? ['th', {class: 'privileges users'}, [_('Users')]]
                : '',
              hasEditPrivilegeAccess && hasReadUsersAccess
                ? ['th', {class: 'privileges addPrivilegeToUser'}, [
                  _('addPrivilegeToUser')
                ]]
                : '',
              hasEditPrivilegeAccess
                ? ['th', {class: 'privileges edit'}, [_('EditPrivilege')]]
                : '',
              hasEditPrivilegeAccess ? ['th', [_('delete')]] : ''
            ]]
          ]],
          ['tbody', /** @type {import('jamilih').JamilihChildren} */ (
            privilegesInfo.map((
              {
                privilegeName, description, type, userVarying,
                builtin, groupsInfo, usersInfo
              }, i
            ) => {
              return ['tr', [
                ['td', {class: 'groups group'}, [i + 1]],
                ['td', [
                  builtin
                    ? ['span', [
                      ['b', [privilegeName]],
                      ' ',
                      ['i', [_('builtin')]]
                    ]]
                    : privilegeName
                ]],
                ['td', [
                  description
                ]],
                ['td', [_(
                  `${type[0].toUpperCase()}${type.slice(1)}Privilege`
                )]],
                ['td', [_(userVarying ? 'Yes' : 'No')]],
                hasRemovePrivilegeFromGroupAccess
                  ? ['td', userVarying
                    ? [_('NotApplicable')]
                    : groupsInfo.map(
                      ({groupName, usersInfo: groupUsersInfo}) => {
                        return ['button', {
                          class: 'removePrivilegeFromGroup',
                          'data-privilege': privilegeName,
                          'data-group': groupName,
                          title: hasReadUsersAccess
                            ? groupUsersInfo.map(({user}) => {
                              return user;
                            }).join(', ')
                            : undefined
                        }, [
                          `${groupName} ☒`
                        ]];
                      }
                    )]
                  : hasReadGroupAccess
                    ? ['td', userVarying
                      ? [_('NotApplicable')]
                      : groupsInfo.map(
                        ({groupName}) => {
                          return ['span', [
                            groupName
                          ]];
                        }
                      )]
                    : '',
                hasAddPrivilegeToGroupAccess
                  ? ['td', userVarying
                    ? []
                    : [
                      ['button', {
                        class: 'addPrivilegeToGroup btn btn-primary',
                        'data-privilege': privilegeName,
                        'data-type': type
                      }, ['+']]
                    ]]
                  : '',
                hasReadUsersAccess
                  ? ['td', userVarying
                    ? usersInfo.map(({user}) => {
                      return hasEditPrivilegeAccess
                        ? ['button', {
                          class: 'removePrivilegeFromUser',
                          'data-privilege': privilegeName,
                          'data-user': user
                        }, [`${user} ☒`]]
                        : ['span', [user]];
                    })
                    : [_('NotApplicable')]]
                  : '',
                hasEditPrivilegeAccess && hasReadUsersAccess
                  ? ['td', userVarying
                    ? [
                      ['button', {
                        class: 'addPrivilegeToUser btn btn-primary',
                        'data-privilege': privilegeName,
                        'data-type': type
                      }, ['+']]
                    ]
                    : []]
                  : '',
                ...builtin
                  ? [
                    hasEditPrivilegeAccess ? ['td'] : '',
                    hasEditPrivilegeAccess ? ['td'] : ''
                  ]
                  : [
                    hasEditPrivilegeAccess
                      ? ['td', [
                        ['button', {
                          class: 'editPrivilege',
                          'data-privilege': privilegeName,
                          'data-description': description,
                          'data-type': type,
                          'data-user-varying': userVarying
                        }, ['e']]
                      ]]
                      : '',
                    hasEditPrivilegeAccess
                      ? ['td', [
                        ['button', {
                          class: 'deletePrivilege',
                          'data-privilege': privilegeName
                        }, ['x']]
                      ]]
                      : ''
                  ]
              ]];
            })
          )]
        ]],
        ['br'],
        ['button', {class: 'createPrivilege btn btn-primary focus'}, [
          _('createPrivilege')
        ]],
        alert({_}),
        confirm({_, type: 'deletePrivilege'}),
        confirm({_, type: 'removePrivilegeFromGroup'}),
        confirm({_, type: 'removePrivilegeFromUser'}),
        doubleInputForm({
          _, type: 'createPrivilege',
          inputDirections: 'PleaseInputPrivilegeToCreate',
          descriptionDirections: 'PleaseInputADescriptionForPrivilege',
          includePrivilegeType: true,
          includeUserVarying: true
        }),
        doubleInputForm({
          _, type: 'editPrivilege',
          inputDirections: 'PleaseInputPrivilegeToEdit',
          descriptionDirections: 'PleaseInputADescriptionForPrivilege',
          includePrivilegeType: true,
          includeUserVarying: true
        }),
        singleInputForm({
          _, type: 'addPrivilegeToGroup',
          inputDirections: 'PleaseInputGroupToWhichToAddPrivilege',
          autocomplete: groups,
          additionalFields: privilegeValueFields({
            _, type: 'addPrivilegeToGroup'
          })
        }),
        singleInputForm({
          _, type: 'addPrivilegeToUser',
          inputDirections: 'PleaseInputUserToWhichToAddPrivilege',
          autocomplete: users,
          additionalFields: privilegeValueFields({
            _, type: 'addPrivilegeToUser'
          })
        })
      ]]
    ],
    scripts: [
      ['script', {
        // src: '/js/controllers/privilegesController.js', type: 'module'
        src: '/js/controllers/privilegesController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default privileges;

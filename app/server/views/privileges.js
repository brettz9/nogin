import alert from './modals/alert.js';
import confirm from './modals/confirm.js';
import singleInputForm from './modals/single-input-form.js';
import doubleInputForm from './modals/double-input-form.js';

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
 *     builtin: boolean,
 *     groupsInfo: {
 *       groupName: string,
 *       builtin: boolean,
 *       usersInfo: {
 *         user: string,
 *         _id: string
 *       }[]
 *     }[]
 *   }[],
 *   groups: string[]
 * }} cfg
 */
const privileges = ({
  _, layout,
  hasEditPrivilegeAccess, hasAddPrivilegeToGroupAccess,
  hasRemovePrivilegeFromGroupAccess,
  hasReadGroupAccess,
  hasReadUsersAccess,
  privilegesInfo, groups
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
              ['th', {class: 'privileges group'}, [_('Group')]],
              hasAddPrivilegeToGroupAccess
                ? ['th', {class: 'privileges addPrivilegeToGroup'}, [
                  _('addPrivilegeToGroup')
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
              {privilegeName, description, builtin, groupsInfo}, i
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
                hasRemovePrivilegeFromGroupAccess
                  ? ['td', groupsInfo.map(
                    ({groupName, usersInfo}) => {
                      return ['button', {
                        class: 'removePrivilegeFromGroup',
                        'data-privilege': privilegeName,
                        'data-group': groupName,
                        title: hasReadUsersAccess
                          ? usersInfo.map(({user}) => {
                            return user;
                          }).join(', ')
                          : undefined
                      }, [
                        `${groupName} ☒`
                      ]];
                    }
                  )]
                  : hasReadGroupAccess
                    ? ['td', groupsInfo.map(
                      ({groupName}) => {
                        return ['span', [
                          groupName
                        ]];
                      }
                    )]
                    : '',
                hasAddPrivilegeToGroupAccess
                  ? ['td', [
                    ['button', {
                      class: 'addPrivilegeToGroup btn btn-primary',
                      'data-privilege': privilegeName
                    }, ['+']]
                  ]]
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
                          'data-description': description
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
        doubleInputForm({
          _, type: 'createPrivilege',
          inputDirections: 'PleaseInputPrivilegeToCreate',
          descriptionDirections: 'PleaseInputADescriptionForPrivilege'
        }),
        doubleInputForm({
          _, type: 'editPrivilege',
          inputDirections: 'PleaseInputPrivilegeToEdit',
          descriptionDirections: 'PleaseInputADescriptionForPrivilege'
        }),
        singleInputForm({
          _, type: 'addPrivilegeToGroup',
          inputDirections: 'PleaseInputGroupToWhichToAddPrivilege',
          autocomplete: groups
        })
      ]]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/privilegesController.js', type: 'module'
        // src: '/js/controllers/privilegesController.iife.min.js',
        // defer: 'defer'
      }]
    ]
  });
};

export default privileges;

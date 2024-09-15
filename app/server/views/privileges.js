import alert from './modals/alert.js';
import confirm from './modals/confirm.js';
import singleInputForm from './modals/single-input-form.js';
import doubleInputForm from './modals/double-input-form.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   hasDeletePrivilegesAccess: boolean,
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
 *   users: string[]
 * }} cfg
 */
const privileges = ({
  _, layout, hasDeletePrivilegesAccess, privilegesInfo
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
              ['th', {class: 'privileges addPrivilegeToGroup'}, [
                _('addPrivilegeToGroup')
              ]],
              ['th', {class: 'privileges edit'}, [_('EditPrivilege')]],
              hasDeletePrivilegesAccess ? ['th', [_('delete')]] : ''
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
                ['td', groupsInfo.map(
                  ({groupName, usersInfo}) => {
                    return ['button', {
                      class: 'removePrivilegeFromGroup',
                      'data-privilege': privilegeName,
                      'data-group': groupName,
                      title: usersInfo.map(({user}) => {
                        return user;
                      }).join(', ')
                    }, [
                      `${groupName} ☒`
                    ]];
                  }
                )],
                ['td', [
                  ['button', {
                    class: 'addPrivilegeToGroup btn btn-primary',
                    'data-privilege': privilegeName
                  }, ['+']]
                ]],
                ...builtin
                  ? [
                    ['td'],
                    hasDeletePrivilegesAccess ? ['td'] : ''
                  ]
                  : [
                    ['td', [
                      ['button', {
                        class: 'editPrivilege', 'data-privilege': privilegeName
                      }, ['e']]
                    ]],
                    hasDeletePrivilegesAccess
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
          autocomplete: privilegesInfo.map(({privilegeName}) => privilegeName)
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

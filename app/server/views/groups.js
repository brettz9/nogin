import alert from './modals/alert.js';
import confirm from './modals/confirm.js';
import singleInputForm from './modals/single-input-form.js';

/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
*   hasDeleteGroupsAccess: boolean,
*   groupsInfo: {
*     groupName: string,
*     usersInfo: {user: string, _id: string}[]
*   }[],
*   users: string[]
* }} cfg
*/
const groups = ({_, layout, hasDeleteGroupsAccess, groupsInfo, users}) => {
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
              ['th', {class: 'groups users'}, [_('Users')]],
              ['th', {class: 'groups addUserToGroup'}, [_('addUserToGroup')]],
              ['th', {class: 'groups rename'}, [_('EditGroupName')]],
              // ['th', {class: 'groups privileges'}, [_('Privileges')]],
              hasDeleteGroupsAccess ? ['th', [_('delete')]] : ''
            ]]
          ]],
          ['tbody', /** @type {import('jamilih').JamilihChildren} */ (
            groupsInfo.map((
              {groupName, usersInfo}, i
            ) => {
              return ['tr', [
                ['td', {class: 'groups group'}, [i + 1]],
                ['td', [groupName]],
                ['td', usersInfo.filter(Boolean).map(({user}) => {
                  return ['button', {
                    class: 'removeUserFromGroup',
                    'data-user': user,
                    'data-group': groupName
                  }, [
                    `${user} ☒`
                  ]];
                })],
                ['td', [
                  ['button', {
                    class: 'addUserToGroup btn btn-primary',
                    'data-group': groupName
                  }, ['+']]
                ]],
                ['td', [
                  ['button', {
                    class: 'renameGroup', 'data-group': groupName
                  }, ['e']]
                ]],
                hasDeleteGroupsAccess
                  ? ['td', [
                    ['button', {
                      class: 'deleteGroup',
                      'data-group': groupName
                    }, ['x']]
                  ]]
                  : ''
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

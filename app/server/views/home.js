import account from './account.js';
import alert from './modals/alert.js';
import confirm from './modals/confirm.js';

/**
 * @param {import('../routeUtils.js').TitleWithLayoutCallback & {
 *   user: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[]
 *   emailPattern: string,
 *   requireName: boolean
 * }} cfg
 */
const home = ({
  _, layout, user, countries, emailPattern, title, requireName
}) => {
  return layout({
    content: /** @type {import('jamilih').JamilihChildren} */ ([
      ['nav', {
        class: 'navbar navbar-expand navbar-light bg-light',
        role: 'navigation'
      }, [
        ['div', {
          class: 'nav-item'
        }, [
          ['div', {class: 'navbar-brand', 'data-name': 'navbar-brand'}, [
            _('ControlPanel')
          ]]
        ]],
        ['div', {
          class: 'navbar-nav ml-auto'
        }, [
          ['div', {
            class: 'nav-item'
          }, [
            ['button', {
              id: 'btn-logout',
              'data-name': 'btn-logout',
              class: 'btn navbar-btn btn-outline-dark'
            }, [
              _('SignOut')
            ]]
          ]]
        ]]
      ]],
      ['div', {
        role: 'main'
      }, [
        ...account({
          _, user, countries, emailPattern, title, requireName
        }),
        alert({_}),
        confirm({_, type: 'deleteAccount'}),
        confirm({_, type: 'notice'})
      ]]
    ]),
    scripts: [
      ['script', {
        src: '/js/controllers/homeController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default home;

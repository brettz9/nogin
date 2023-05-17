import account from './account.js';
import alert from './modals/alert.js';

/**
 * @param {import('../routeUtils.js').TitleWithLayoutCallback & {
 *   emptyUser: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[],
 *   emailPattern: string,
 *   requireName?: boolean
 * }} cfg
 */
const signup = ({
  _, layout, emptyUser, countries, emailPattern, requireName, title
}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, /** @type {import('jamilih').JamilihChildren} */ ([
        ...account({
          _, user: emptyUser, countries, emailPattern, requireName, title
        }),
        alert({_})
      ])]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/signupController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default signup;

import account from './account.js';
import alert from './modals/alert.js';

const signup = ({
  _, layout, emptyUser, countries, emailPattern, requireName, title
}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ...account({
          _, user: emptyUser, countries, emailPattern, requireName, title
        }),
        alert({_})
      ]]
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

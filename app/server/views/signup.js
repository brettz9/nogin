/* eslint-disable global-require */
'use strict';

module.exports = function ({
  _, layout, emptyUser, countries, emailPattern, title
}) {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ...require('./account.js')({
          _, user: emptyUser, countries, emailPattern, title
        }),
        require('./modals/alert.js')({_})
      ]]
    ],
    scripts: [
      ['script', {
        src: '/js/utilities/ajaxFormClientSideValidate.js'
      }],
      ['script', {
        src: '/js/views/utilities/AlertDialog.js'
      }],
      ['script', {
        src: '/js/views/utilities/populateForm.js'
      }],
      ['script', {
        src: '/js/views/validators/AccountValidatorView.js', defer: 'defer'
      }],
      ['script', {
        src: '/js/form-validators/AccountValidator.js', defer: 'defer'
      }],
      ['script', {src: '/js/views/signup.js', defer: 'defer'}],
      ['script', {src: '/js/controllers/signupController.js', defer: 'defer'}]
    ]
  });
};

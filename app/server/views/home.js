/* eslint-disable global-require */
'use strict';

module.exports = function ({_, layout, user, countries, emailPattern, title}) {
  return layout({
    content: [
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
            ]],
            ...require('./account.js')({
              _, user, countries, emailPattern, title
            }),
            require('./modals/alert.js')({_}),
            require('./modals/confirm.js')({_})
          ]]
        ]]
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
      ['script', {src: '/js/views/home.js', defer: 'defer'}],
      ['script', {
        src: '/js/views/validators/AccountValidatorView.js', defer: 'defer'
      }],
      ['script', {
        src: '/js/form-validators/AccountValidator.js', defer: 'defer'
      }],
      ['script', {src: '/js/controllers/homeController.js', defer: 'defer'}],
      ['script', {
        src: '/js/views/utilities/populateConfirmDialog.js'
      }]
    ]
  });
};

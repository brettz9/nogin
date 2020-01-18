/* eslint-disable global-require */
'use strict';

module.exports = function ({_, layout}) {
  return layout({
    content: [
      require('./modals/reset-password.js')({_})
    ],
    scripts: [
      ['script', {src: '/js/views/reset-password.js', defer: 'defer'}],
      ['script', {
        src: '/js/views/validators/ResetPasswordValidatorView.js',
        defer: 'defer'
      }],
      ['script', {
        src: '/js/form-validators/ResetPasswordValidator.js', defer: 'defer'
      }],
      ['script', {
        src: '/js/controllers/resetPasswordController.js', defer: 'defer'
      }]
    ]
  });
};

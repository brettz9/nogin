/* eslint-disable node/global-require */
'use strict';

module.exports = function ({_, layout}) {
  return layout({
    content: [
      require('./modals/reset-password.js')({_})
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/resetPasswordController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

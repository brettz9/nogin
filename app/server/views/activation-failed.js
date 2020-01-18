/* eslint-disable global-require */
'use strict';

module.exports = function ({_, layout}) {
  return layout({
    content: [
      ['div', {role: 'main'}, [
        ['h1', [
          _('ActivationFailed')
        ]],
        require('./modals/alert.js')({_})
      ]]
    ],
    scripts: [
      ['script', {
        src: '/js/views/utilities/AlertDialog.js'
      }],
      ['script', {src: '/js/views/activation-failed.js', defer: 'defer'}],
      ['script', {
        src: '/js/controllers/activationFailedController.js', defer: 'defer'
      }]
    ]
  });
};

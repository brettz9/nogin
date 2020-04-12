/* eslint-disable node/global-require */
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
        src: '/js/controllers/activationFailedController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

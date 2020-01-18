/* eslint-disable global-require */
'use strict';

module.exports = function ({_, layout}) {
  return layout({
    content: [
      ['div', {role: 'main'}, [
        ['h1', [
          _('Activation')
        ]],
        require('./modals/alert.js')({_})
      ]]
    ],
    scripts: [
      ['script', {
        src: '/js/views/utilities/AlertDialog.js'
      }],
      ['script', {src: '/js/views/activated.js', defer: 'defer'}],
      ['script', {
        src: '/js/controllers/activatedController.js', defer: 'defer'
      }]
    ]
  });
};

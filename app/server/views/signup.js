/* eslint-disable node/global-require */
'use strict';

module.exports = function ({
  _, layout, emptyUser, countries, emailPattern, requireName, title
}) {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ...require('./account.js')({
          _, user: emptyUser, countries, emailPattern, requireName, title
        }),
        require('./modals/alert.js')({_})
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

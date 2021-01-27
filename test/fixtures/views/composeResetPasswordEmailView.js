'use strict';
module.exports = function ({
  _, langDir, jml, baseurl, name, user, passKey, fromText, fromURL
}) {
  return {$document: {
    childNodes: [
      ['html', langDir, [
        ['body', [
          _('HiPerson', {name}),
          ['br', 'br'],
          _('YourUserNameIs', {
            user: jml('b', [user])
          }),
          ['br', 'br'],
          ['a', {
            href: `${baseurl}/reset-password?key=${passKey}`
          }, [
            _('ClickToResetPassword')
          ]],
          ['br', 'br'],
          'See you later alligator', ['br'],
          ['a', {
            href: fromURL
          }, [
            fromText
          ]], ['br', 'br']
        ]]
      ]]
    ]
  }};
};

'use strict';
module.exports = function ({
  _, jml, baseurl, name, user, passKey, fromText, fromURL
}) {
  return {$document: {
    body: [
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
      _('Regards'), ['br'],
      ['a', {
        href: fromURL
      }, [
        fromText
      ]], ['br', 'br']
    ]
  }};
};

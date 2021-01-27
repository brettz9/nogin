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
            // eslint-disable-next-line max-len
            href: `${baseurl}${_('route_resetPassword')}?${_('query_key')}=${passKey}`
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
        ]]
      ]]
    ]
  }};
};

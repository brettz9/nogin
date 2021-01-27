'use strict';
module.exports = function ({
  _, langDir, jml, baseurl, name, user, activationCode, fromText, fromURL
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
            href: `${baseurl}${_('route_activation')}?${_('query_c')}=${activationCode}`
          }, [
            _('ClickToActivateAccount')
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

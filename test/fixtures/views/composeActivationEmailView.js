const composeActivationEmailView = ({
  _, langDir, jml, baseurl, name, user, activationCode, fromText, fromURL
}) => {
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
            href: `${baseurl}/activation?c=${activationCode}`
          }, [
            _('ClickToActivateAccount')
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

export default composeActivationEmailView;

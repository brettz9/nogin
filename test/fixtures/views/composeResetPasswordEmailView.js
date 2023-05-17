/**
 *
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   langDir: import('../../../app/server/modules/i18n.js').LanguageDirection,
*   jml: import('jamilih').jml,
*   baseurl: string,
*   name: string,
*   user: string,
*   passKey: string,
*   fromText: string,
*   fromURL: string
* }} cfg
* @returns {import('jamilih').JamilihDoc}
*/
const composeResetPasswordEmailView = ({
  _, langDir, jml, baseurl, name, user, passKey, fromText, fromURL
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

export default composeResetPasswordEmailView;

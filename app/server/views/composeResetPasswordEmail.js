/**
 *
 * @typedef {(cfg: {
 *   _: import('../modules/email-dispatcher.js').Internationalizer,
 *   langDir: {dir: "rtl"|"ltr"|undefined, lang: string},
 *   jml: import('jamilih').jml,
 *   baseurl: string,
 *   name: string,
 *   user: string,
 *   passKey: string,
 *   fromText: string,
 *   fromURL: string
 * }) => import('jamilih').JamilihDoc} ComposeResetPasswordEmail
 */

/** @type {ComposeResetPasswordEmail} */
const composeResetPasswordEmail = ({
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
            // eslint-disable-next-line @stylistic/max-len
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

export default composeResetPasswordEmail;

/**
 *
 * @typedef {(cfg: {
*   _: import('../modules/email-dispatcher.js').Internationalizer,
*   langDir: {dir: "rtl"|"ltr"|undefined, lang: string},
*   jml: import('jamilih').jml,
*   baseurl: string,
*   name: string,
*   user: string,
*   activationCode: string,
*   fromText: string,
*   fromURL: string
* }) => import('jamilih').JamilihDoc} ComposeActivationEmail
*/

/** @type {ComposeActivationEmail} */
const composeActivationEmail = ({
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
            // eslint-disable-next-line @stylistic/max-len
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

export default composeActivationEmail;

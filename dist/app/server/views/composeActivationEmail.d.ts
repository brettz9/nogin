/**
 *
 * @typedef {(cfg: {
*   _: import('../modules/email-dispatcher.js').Internationalizer,
*   langDir: {dir: "rtl"|"ltr"|undefined, lang: string},
*   jml: typeof import('jamilih').jml,
*   baseurl: string,
*   name: string,
*   user: string,
*   activationCode: string,
*   fromText: string,
*   fromURL: string
* }) => import('jamilih').JamilihDoc} ComposeActivationEmail
*/
export type ComposeActivationEmail = (cfg: {
    _: import('../modules/email-dispatcher.js').Internationalizer;
    langDir: {
        dir: "rtl" | "ltr" | undefined;
        lang: string;
    };
    jml: typeof import('jamilih').jml;
    baseurl: string;
    name: string;
    user: string;
    activationCode: string;
    fromText: string;
    fromURL: string;
}) => import('jamilih').JamilihDoc;
/** @type {ComposeActivationEmail} */
declare const composeActivationEmail: ComposeActivationEmail;
export default composeActivationEmail;
//# sourceMappingURL=composeActivationEmail.d.ts.map
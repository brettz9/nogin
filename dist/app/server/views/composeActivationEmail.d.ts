export default composeActivationEmail;
export type ComposeActivationEmail = (cfg: {
    _: import("../modules/email-dispatcher.js").Internationalizer;
    langDir: {
        dir: "rtl" | "ltr" | undefined;
        lang: string;
    };
    jml: typeof import("jamilih").jml;
    baseurl: string;
    name: string;
    user: string;
    activationCode: string;
    fromText: string;
    fromURL: string;
}) => import("jamilih").JamilihDoc;
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
declare const composeActivationEmail: ComposeActivationEmail;
//# sourceMappingURL=composeActivationEmail.d.ts.map
export default composeResetPasswordEmail;
export type ComposeResetPasswordEmail = (cfg: {
    _: import("../modules/email-dispatcher.js").Internationalizer;
    langDir: {
        dir: "rtl" | "ltr" | undefined;
        lang: string;
    };
    jml: typeof import("jamilih").jml;
    baseurl: string;
    name: string;
    user: string;
    passKey: string;
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
 *   passKey: string,
 *   fromText: string,
 *   fromURL: string
 * }) => import('jamilih').JamilihDoc} ComposeResetPasswordEmail
 */
/** @type {ComposeResetPasswordEmail} */
declare const composeResetPasswordEmail: ComposeResetPasswordEmail;
//# sourceMappingURL=composeResetPasswordEmail.d.ts.map
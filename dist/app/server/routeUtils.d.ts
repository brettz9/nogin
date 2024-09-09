export type Path = string;
export type Routes = any;
export type RouteGetter = (_: import("./modules/email-dispatcher.js").Internationalizer) => Routes;
export type SecuritySourceAttributes = (type: "link" | "script", name: string) => {
    crossorigin: string;
    integrity?: string;
};
export type LinkScript = {
    name: string;
    local: string;
    integrity: string;
    remote: string;
};
export type IntegrityMap = {
    link: (LinkScript & {
        noLocalIntegrity?: boolean;
    })[];
    script: (LinkScript & {
        global: string;
    })[];
};
export type TemplateArgs = {
    content: import("jamilih").JamilihChildren;
    scripts?: ([string, import("jamilih").JamilihAttributes])[];
};
export type LayoutCallback = (templateArgs: TemplateArgs) => Promise<[import("jamilih").JamilihDoc]>;
export type TitleWithLayoutCallback = {
    _: import("./modules/email-dispatcher.js").Internationalizer;
    title: string;
    layout: LayoutCallback;
    langDir: import("../server/modules/i18n.js").LanguageDirection;
};
/**
 * `template` - The template name (made available to
 * `injectHTML` so it can vary the generated HTML per template).
 */
export type LayoutAndTitleArgs = {
    _: import("./modules/email-dispatcher.js").Internationalizer;
    title: string;
    template: string;
    error?: string;
    csrfToken?: string;
};
export type LayoutAndTitleGetter = (businessLogicArgs: LayoutAndTitleArgs) => TitleWithLayoutCallback;
export type Route = "root" | "logout" | "home" | "signup" | "activation" | "lostPassword" | "resetPassword" | "users" | "delete" | "reset" | "coverage";
/**
 * @typedef {{
 *   content: import('jamilih').JamilihChildren,
 *   scripts?: ([string, import('jamilih').JamilihAttributes])[],
 * }} TemplateArgs
 */
/**
 * @typedef {(
 *   templateArgs: TemplateArgs
 * ) => Promise<[import('jamilih').JamilihDoc]>} LayoutCallback
 */
/**
 * @typedef {{
 *   _: import('./modules/email-dispatcher.js').Internationalizer,
 *   title: string,
 *   layout: LayoutCallback,
 *   langDir: import('../server/modules/i18n.js').LanguageDirection
 * }} TitleWithLayoutCallback
 */
/**
 * `template` - The template name (made available to
 * `injectHTML` so it can vary the generated HTML per template).
 * @typedef {{
 *   _: import('./modules/email-dispatcher.js').Internationalizer
 *   title: string,
 *   template: string
 *   error?: string,
 *   csrfToken?: string
 * }} LayoutAndTitleArgs
 */
/**
 * @callback LayoutAndTitleGetter
 * @param {LayoutAndTitleArgs} businessLogicArgs
 * @returns {TitleWithLayoutCallback}
 */
/**
 * @param {import('./app.js').RouteConfig} config
 * @param {import('jamilih').jml} jml
 * @returns {LayoutAndTitleGetter}
 */
export function layoutAndTitleGetter(config: import("./app.js").RouteConfig, jml: typeof import("jamilih").jml): LayoutAndTitleGetter;
/**
 * @param {RouteGetter} getRoutes
 * @param {string} localesBasePath
 * @returns {Promise<void>}
 */
export function checkLocaleRoutes(getRoutes: RouteGetter, localesBasePath: string): Promise<void>;
/**
 * @param {string[]} customRoute Equal-separated locale=route=path
 * @returns {RouteGetter}
 */
export function routeGetter(customRoute: string[]): RouteGetter;
//# sourceMappingURL=routeUtils.d.ts.map
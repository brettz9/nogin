export default layout;
/**
 * @todo change `content` and `scripts` to `JamilihDocumentFragmentContent[]`
 *   once jamilih updated
 * @param {import('../routeUtils.js').LayoutAndTitleArgs &
 *   import('../routeUtils.js').TemplateArgs & {
 *   langDir: import('../modules/i18n.js').LanguageDirection,
 *   isRtl: boolean,
 *   triggerCoverage: boolean,
 *   favicon: string,
 *   stylesheet: string,
 *   noBuiltinStylesheets: boolean,
 *   userJS: string,
 *   userJSModule: string,
 *   localScripts: boolean,
 *   securitySourceAttributes: import('../routeUtils.js').SecuritySourceAttributes
 *   noPolyfill: boolean,
 *   useESM: boolean,
 * }} cfg
 * @param {{
 *   headPre: import('jamilih').JamilihArray[],
 *   headPost: import('jamilih').JamilihArray[],
 *   bodyPre: import('jamilih').JamilihArray[],
 *   bodyPost: import('jamilih').JamilihArray[]
 * }} injectedHTML
 * @returns {[import('jamilih').JamilihDoc]}
 */
declare function layout({ _, langDir, isRtl, content, scripts, title, favicon, stylesheet, noBuiltinStylesheets, userJS, userJSModule, noPolyfill, useESM, csrfToken, error, triggerCoverage, securitySourceAttributes }: import('../routeUtils.js').LayoutAndTitleArgs & import('../routeUtils.js').TemplateArgs & {
    langDir: import('../modules/i18n.js').LanguageDirection;
    isRtl: boolean;
    triggerCoverage: boolean;
    favicon: string;
    stylesheet: string;
    noBuiltinStylesheets: boolean;
    userJS: string;
    userJSModule: string;
    localScripts: boolean;
    securitySourceAttributes: import('../routeUtils.js').SecuritySourceAttributes;
    noPolyfill: boolean;
    useESM: boolean;
}, injectedHTML: {
    headPre: import('jamilih').JamilihArray[];
    headPost: import('jamilih').JamilihArray[];
    bodyPre: import('jamilih').JamilihArray[];
    bodyPost: import('jamilih').JamilihArray[];
}): [import('jamilih').JamilihDoc];
//# sourceMappingURL=layout.d.ts.map
export type LanguageDirection = {
    lang: string;
    dir: "ltr" | "rtl" | undefined;
};
export type LanguageDirectionSetter = (_: import('./email-dispatcher.js').Internationalizer) => LanguageDirection;
/**
 * @typedef {object} LanguageDirection
 * @property {string} lang
 * @property {"ltr"|"rtl"|undefined} dir
 */
/**
 * @callback LanguageDirectionSetter
 * @param {import('./email-dispatcher.js').Internationalizer} _
 * @returns {LanguageDirection}
 */
/** @type {LanguageDirectionSetter} */
declare const getLangDir: LanguageDirectionSetter;
declare const i18n: (localesBasePath?: string) => (req: import('express').Request, _res?: import('express').Response, next?: import('express').NextFunction) => Promise<import('intl-dom').I18NCallback<string>>;
export { getLangDir, i18n };
//# sourceMappingURL=i18n.d.ts.map
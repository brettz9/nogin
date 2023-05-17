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
export const getLangDir: LanguageDirectionSetter;
export function i18n(localesBasePath?: string): (req: import('express').Request, _res?: import("express").Response<any, Record<string, any>> | undefined, next?: import("express").NextFunction | undefined) => Promise<import('intl-dom').I18NCallback<string>>;
//# sourceMappingURL=i18n.d.ts.map
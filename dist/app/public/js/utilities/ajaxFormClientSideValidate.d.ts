export default ajaxFormClientSideValidate;
export type AjaxFormConfig = {
    headers?: {
        [key: string]: string | undefined;
    };
    url?: string;
    beforeSubmit?: (arr: {
        name: string;
        value: string | boolean;
    }[], $form: any, options: any) => boolean | void;
    success: (responseText: string, status: string, xhr: any, $form: JQuery) => void;
    error: (cfg: {
        responseText: string;
    }) => void;
};
export type JQueryWithAjaxForm = JQuery & {
    ajaxForm: (cfg: AjaxFormConfig) => void;
};
/**
 * @typedef {{
 *   headers?: {[key: string]: string|undefined},
 *   url?: string,
 *   beforeSubmit?: (
 *     arr: {name: string, value: string|boolean}[],
 *     $form: any,
 *     options: any
 *   ) => boolean|void,
 *   success: (
 *     responseText: string, status: string, xhr: any, $form: JQuery
 *   ) => void,
 *   error: (cfg: {
 *     responseText: string
 *   }) => void,
 * }} AjaxFormConfig
 */
/**
 * @typedef {JQuery & {
 *   ajaxForm: (cfg: AjaxFormConfig) => void
 * }} JQueryWithAjaxForm
 */
/**
 * @param {JQueryWithAjaxForm} form
 * @param {AjaxFormConfig & {
 *   validate: (e: Event) => void,
 *   checkXSRF?: boolean
 * }} cfg
 * @returns {void}
 */
declare function ajaxFormClientSideValidate(form: JQueryWithAjaxForm, cfg: AjaxFormConfig & {
    validate: (e: Event) => void;
    checkXSRF?: boolean;
}): void;
//# sourceMappingURL=ajaxFormClientSideValidate.d.ts.map
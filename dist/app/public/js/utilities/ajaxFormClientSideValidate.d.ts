export default ajaxFormClientSideValidate;
export type AjaxFormConfig = {
    headers?: {
        [key: string]: string | undefined;
    } | undefined;
    url?: string | undefined;
    beforeSubmit?: ((arr: {
        name: string;
        value: string | boolean;
    }[], $form: any, options: any) => boolean | void) | undefined;
    success: (responseText: string, status: string, xhr: any, $form: JQuery) => void;
    error: (cfg: {
        responseText: string;
    }) => void;
};
export type JQueryWithAjaxForm = JQuery<HTMLElement> & {
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
declare function ajaxFormClientSideValidate(form: JQueryWithAjaxForm, { validate, url, beforeSubmit, success, error, checkXSRF }: AjaxFormConfig & {
    validate: (e: Event) => void;
    checkXSRF?: boolean | undefined;
}): void;
//# sourceMappingURL=ajaxFormClientSideValidate.d.ts.map
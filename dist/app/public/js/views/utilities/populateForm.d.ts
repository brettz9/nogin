export default populateForm;
/**
 * @param {string} sel
 * @param {{
 *   heading: string,
 *   subheading: string,
 *   action1: string,
 *   action2: string
 * }} cfg
 * @returns {import('../../utilities/ajaxFormClientSideValidate.js').
   *   JQueryWithAjaxForm}
 */
declare function populateForm(sel: string, { heading, subheading, action1, action2 }: {
    heading: string;
    subheading: string;
    action1: string;
    action2: string;
}): import('../../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
//# sourceMappingURL=populateForm.d.ts.map
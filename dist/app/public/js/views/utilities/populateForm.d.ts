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
declare const populateForm: (sel: string, { heading, subheading, action1, action2 }: {
    heading: string;
    subheading: string;
    action1: string;
    action2: string;
}) => import('../../utilities/ajaxFormClientSideValidate.js').JQueryWithAjaxForm;
export default populateForm;
//# sourceMappingURL=populateForm.d.ts.map
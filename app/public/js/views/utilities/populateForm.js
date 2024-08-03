/* globals $ -- `$` is jQuery not ESM */

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
const populateForm = (sel, {
  heading,
  subheading,
  action1,
  action2
}) => {
  // customize the account settings form
  $(sel + ' h1.dialog').text(heading);
  $(sel + ' h2.dialog').text(subheading);
  $(sel + ' [data-name=action1]').text(action1);
  $(sel + ' [data-name=action2]').text(action2);
  return (
    /**
     * @type {import('../../utilities/ajaxFormClientSideValidate.js').
     *   JQueryWithAjaxForm}
     */ ($(sel))
  );
};

export default populateForm;

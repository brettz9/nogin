/**
 * Builds the value field pair for a typed-privilege assignment form: a plain
 * input (used for boolean and number values) plus a textarea (used for
 * string, array, and object values, revealed by the client script). The
 * client hides/disables whichever field does not apply to the chosen
 * privilege type.
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   type: string,
 *   extraInputAttributes?: {[key: string]: string}
 * }} cfg `type` is the form id prefix (e.g. `addPrivilegeToGroup`).
 * @returns {import('jamilih').JamilihArray[]}
 */
declare const privilegeValueFields: ({ _, type, extraInputAttributes }: {
    _: import('intl-dom').I18NCallback;
    type: string;
    extraInputAttributes?: {
        [key: string]: string;
    };
}) => import('jamilih').JamilihArray[];
export default privilegeValueFields;
//# sourceMappingURL=privilege-value-fields.d.ts.map
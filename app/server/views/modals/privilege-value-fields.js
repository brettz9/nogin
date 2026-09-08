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
const privilegeValueFields = ({_, type, extraInputAttributes = {}}) => {
  return [
    ['label', {for: type + '-value-input'}, [_('PrivilegeValue')]],
    ['input', {
      class: 'form-control',
      id: type + '-value-input',
      'data-name': 'privilege-value',
      name: 'value',
      ...extraInputAttributes
    }],
    ['textarea', {
      class: 'form-control',
      id: type + '-value-textarea',
      'data-name': 'privilege-value',
      name: 'value',
      rows: 4,
      hidden: 'hidden'
    }]
  ];
};

export default privilegeValueFields;

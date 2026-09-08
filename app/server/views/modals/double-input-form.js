import singleInputForm from './single-input-form.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   type: string,
 *   inputDirections: string,
 *   descriptionDirections: string,
 *   autocomplete?: string[],
 *   includePrivilegeType?: boolean
 * }} cfg
 * @returns {import('jamilih').JamilihArray}
 */
const doubleInputForm = ({
  _, type, inputDirections, descriptionDirections, autocomplete,
  includePrivilegeType = false
}) => {
  const privilegeTypeFields = /** @type {import('jamilih').JamilihArray[]} */ (
    includePrivilegeType
      ? [
        ['label', {for: type + '-type-input'}, [_('PrivilegeType')]],
        ['select', {
          class: 'form-control',
          id: type + '-type-input',
          'data-type': type,
          name: type + 'type'
        }, [
          ['option', {value: 'boolean'}, [_('BooleanPrivilege')]],
          ['option', {value: 'string'}, [_('StringPrivilege')]],
          ['option', {value: 'number'}, [_('NumberPrivilege')]]
        ]]
      ]
      : []
  );
  return singleInputForm({
    _, type, inputDirections, autocomplete,
    additionalFields: [
      ['label', {for: type + '-description-input'}, [_(descriptionDirections)]],
      ['input', {
        class: 'form-control required',
        required: 'required',
        minlength: 3,
        id: type + '-description-input',
        'data-description': type,
        name: type + 'description'
      }],
      ...privilegeTypeFields
    ]
  });
};

export default doubleInputForm;

import singleInputForm from './single-input-form.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   type: string,
 *   inputDirections: string,
 *   descriptionDirections: string,
 *   autocomplete?: string[],
 *   includePrivilegeType?: boolean,
 *   includeUserVarying?: boolean
 * }} cfg
 * @returns {import('jamilih').JamilihArray}
 */
const doubleInputForm = ({
  _, type, inputDirections, descriptionDirections, autocomplete,
  includePrivilegeType = false, includeUserVarying = false
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
          ['option', {value: 'number'}, [_('NumberPrivilege')]],
          ['option', {value: 'array'}, [_('ArrayPrivilege')]],
          ['option', {value: 'object'}, [_('ObjectPrivilege')]]
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
      ...privilegeTypeFields,
      ...(includeUserVarying
        ? /** @type {import('jamilih').JamilihArray[]} */ ([
          ['div', {class: 'form-check'}, [
            ['input', {
              class: 'form-check-input',
              type: 'checkbox',
              id: type + '-user-varying-input',
              'data-user-varying': type,
              name: type + 'userVarying'
            }],
            ['label', {
              class: 'form-check-label',
              for: type + '-user-varying-input'
            }, [_('VariesByUser')]]
          ]]
        ])
        : [])
    ]
  });
};

export default doubleInputForm;

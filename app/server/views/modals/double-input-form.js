import singleInputForm from './single-input-form.js';

/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   type: string,
*   inputDirections: string,
*   descriptionDirections: string,
*   autocomplete?: string[]
* }} cfg
* @returns {import('jamilih').JamilihArray}
*/
const doubleInputForm = ({
  _, type, inputDirections, descriptionDirections, autocomplete
}) => {
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
      }]
    ]
  });
};

export default doubleInputForm;

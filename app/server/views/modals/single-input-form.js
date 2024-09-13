/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   type: string,
*   inputDirections: string
*   autocomplete?: string[]
* }} cfg
* @returns {import('jamilih').JamilihArray}
*/
const singleInputForm = ({_, type, inputDirections, autocomplete}) => {
  return ['div', {
    id: type,
    'data-name': type, class: 'modal fade'
  }, [
    ['div', {class: 'modal-dialog', role: 'dialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {
            class: 'modal-title',
            'data-name': 'modal-title'
          }, [_(type)]],
          ['button', {
            type: 'button',
            class: 'close',
            'data-dismiss': 'modal',
            'aria-label': 'Close'
          }, [
            ['span', {'aria-hidden': 'true'}, [_('ACloseButton')]]
          ]]
        ]],
        ['div', {class: 'modal-body'}, [
          ['form', {id: type + '-form', method: 'post'}, [
            ['div', {class: 'form-group'}, [
              ['label', {for: type + '-input'}, [_(inputDirections)]],
              autocomplete
                ? ['datalist', {
                  id: type + '-datalist'
                }, /** @type {import('jamilih').JamilihChildren} */ (
                  autocomplete.map((item) => {
                    return ['option', {value: item}];
                  }))]
                : '',
              ['input', {
                list: type + '-datalist',
                class: 'form-control required',
                required: 'required',
                minlength: 3,
                id: type + '-input',
                'data-name': type,
                name: type
              }]
              // Not hiding? Keeping in case wish to use for client validation
              // ['div', {
              //   class: 'alert alert-danger hide', 'data-name': 'alert'
              // }]
            ]]
          ]]
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {
            id: type + '-cancel',
            'data-name': type + '-cancel',
            class: 'btn btn-outline-dark',
            'data-dismiss': 'modal',
            form: type + '-form'
          }, [_('Cancel')]],
          ['button', {
            type: 'submit',
            id: type + '-submit',
            'data-name': type + '-submit',
            class: 'btn btn-primary',
            form: type + '-form'
          }, [_('Submit')]]
        ]]
      ]]
    ]]
  ]];
};

export default singleInputForm;

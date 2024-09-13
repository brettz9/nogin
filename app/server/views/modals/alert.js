/**
 * @param {{
 *   _: import('intl-dom').I18NCallback
 * }} cfg
 * @returns {import('jamilih').JamilihArray}
 */
const alert = ({_}) => {
  return ['div', {
    class: 'modal-alert modal fade', 'data-name': 'modal-alert'
  }, [
    ['div', {class: 'modal-dialog', role: 'alertdialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {class: 'modal-title', 'data-name': 'modal-title'}]
        ]],
        ['div', {class: 'modal-body', 'data-name': 'modal-body'}, [
          ['p']
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {
            id: 'ok', 'data-name': 'ok',
            class: 'btn btn-primary', 'data-dismiss': 'modal'
          }, [_('OK')]]
        ]]
      ]]
    ]]
  ]];
};

export default alert;

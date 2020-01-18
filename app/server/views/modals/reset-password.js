'use strict';

module.exports = function ({_}) {
  return ['div', {id: 'set-password', class: 'modal', role: 'main'}, [
    ['div', {class: 'modal-dialog', role: 'dialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {
            class: 'modal-title', 'data-name': 'modal-title'
          }, [_('ResetPassword')]],
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
          ['form', {id: 'set-password-form', method: 'post'}, [
            ['div', {class: 'form-group'}, [
              ['label', {for: 'pass-tf'}, [_('PleaseEnterNewPassword')]],
              ['input', {
                type: 'password',
                autocomplete: 'new-password',
                class: 'form-control',
                required: 'required',
                name: 'pass',
                id: 'pass-tf',
                minlength: 6
              }],
              ['div', {class: 'alert alert-danger hide'}]
            ]]
          ]]
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {id: 'set-password-submit', class: 'btn btn-primary',
            type: 'submit',
            form: 'set-password-form'
          }, [_('Submit')]]
        ]]
      ]]
    ]]
  ]];
};

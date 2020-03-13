'use strict';

module.exports = function ({_, emailPattern}) {
  return ['div', {
    id: 'retrieve-password',
    'data-name': 'retrieve-password', class: 'modal fade'
  }, [
    ['div', {class: 'modal-dialog', role: 'dialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {
            class: 'modal-title',
            'data-name': 'modal-title'
          }, [_('RetrievePassword')]],
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
          ['form', {id: 'retrieve-password-form', method: 'post'}, [
            ['div', {class: 'form-group'}, [
              ['label', {for: 'email-tf'}, [_('PleaseEnterEmail')]],
              ['input', {
                class: 'form-control required', type: 'email',
                required: 'required',
                autocomplete: 'email',
                pattern: emailPattern,
                id: 'email-tf',
                'data-name': 'email',
                name: 'email'
              }],
              ['div', {class: 'alert alert-danger hide', 'data-name': 'alert'}]
            ]]
          ]]
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {
            id: 'retrieve-password-cancel',
            'data-name': 'retrieve-password-cancel',
            class: 'btn btn-outline-dark',
            'data-dismiss': 'modal',
            form: 'retrieve-password-form'
          }, [_('Cancel')]],
          ['button', {
            type: 'submit',
            id: 'retrieve-password-submit',
            'data-name': 'retrieve-password-submit',
            class: 'btn btn-primary',
            form: 'retrieve-password-form'
          }, [_('Submit')]]
        ]]
      ]]
    ]]
  ]];
};

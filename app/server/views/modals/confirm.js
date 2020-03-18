'use strict';

module.exports = function ({_, type}) {
  return ['div', {
    class: 'modal-confirm modal fade',
    'data-name': 'modal-confirm',
    'data-confirm-type': type
  }, [
    ['div', {class: 'modal-dialog', role: 'dialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {class: 'modal-title', 'data-name': 'modal-title'}],
          ['button', {
            type: 'button',
            class: 'close',
            'data-dismiss': 'modal',
            'aria-label': 'Close'
          }, [
            ['span', {'aria-hidden': 'true'}, [_('ACloseButton')]]
          ]]
        ]],
        ['div', {class: 'modal-body', 'data-name': 'modal-body'}, [
          ['p']
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {
            class: 'cancel btn btn-outline-dark',
            'data-name': 'cancel',
            'data-dismiss': 'modal'
          }, [_('Cancel')]],
          ['button', {
            'data-name': 'submit-confirm',
            class: 'submit btn btn-primary'
          }, [_('Ok')]]
        ]]
      ]]
    ]]
  ]];
};

'use strict';

module.exports = function ({_}) {
  return ['div', {class: 'modal-form-errors modal fade'}, [
    ['div', {class: 'modal-dialog', role: 'dialog'}, [
      ['div', {class: 'modal-content'}, [
        ['div', {class: 'modal-header'}, [
          ['h1', {
            class: 'modal-title', 'data-name': 'modal-title'
          }, [_('Whoops')]],
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
          _('LooksLikeProblem'),
          ['ul']
        ]],
        ['div', {class: 'modal-footer'}, [
          ['button', {
            class: 'btn btn-primary', 'data-dismiss': 'modal'
          }, [_('OK')]]
        ]]
      ]]
    ]]
  ]];
};

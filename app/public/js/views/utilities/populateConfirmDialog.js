/* globals $ */
'use strict';

window.populateConfirmDialog = ({
  header,
  body,
  cancel,
  submit
}) => {
  $('[data-name=modal-confirm]').modal({
    show: false, keyboard: true, backdrop: true
  });
  $('[data-name=modal-confirm] .modal-header [data-name=modal-title]').text(
    header
  );
  $('[data-name=modal-confirm] [data-name=modal-body] p').text(body);
  $('[data-name=modal-confirm] .cancel').text(cancel);
  $('[data-name=modal-confirm] .submit').text(submit);
  return $('[data-name=modal-confirm]');
};

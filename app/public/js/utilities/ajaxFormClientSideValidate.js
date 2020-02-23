'use strict';
window.ajaxFormClientSideValidate = (form, {
  validate,
  // `ajaxForm` properties and methods
  url,
  beforeSubmit,
  success,
  error
}) => {
  // As per problem #3 at https://www.html5rocks.com/en/tutorials/forms/constraintvalidation/#toc-current-implementation-issues ,
  //  we can't do the validation at submit, so we instead add a capturing
  //  change listener as well as input listeners to reset the messages;
  //  note that we can't use the `invalid` event to call `reportValidity`
  //  after our `setCustomValidity()` (to ensure we get the bubbles showing)
  //  as that fires further `invalid` events; and setting the form to
  //  `novalidate` won't show the bubbles.
  form[0].addEventListener('change', (e) => {
    // Provide custom messages of invalidity
    validate(e);
  }, true);

  form[0].addEventListener('input', ({target: field}) => {
    field.setCustomValidity('');
    field.checkValidity('');
  }, true);

  return form.ajaxForm({
    url,
    beforeSubmit,
    success,
    error
  });
};

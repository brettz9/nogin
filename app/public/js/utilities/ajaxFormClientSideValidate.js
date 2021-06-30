/* globals $, Nogin */

// Note: This per-request approach suffers from the possibility that the
//   may subsequently open a page from the site with nogin in another tab
//   where that page sets a new, different token meta expectation to a
//   new value and this will thereby become invalid.
const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

const ajaxFormClientSideValidate = (form, {
  validate,
  // `ajaxForm` properties and methods
  url,
  beforeSubmit,
  success,
  error,
  checkXSRF = true
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

  // istanbul ignore if
  if (checkXSRF && !xsrfCookie && !Nogin.disableXSRF) {
    error({responseText: 'UnknownError'});
    return;
  }

  form.ajaxForm({
    headers: {
      // `$.ajaxForm` will auto-check for special `meta` tags to add XSRF
      //   data, but we avoid the extra meta it requires by sending on the
      //   header.
      'X-XSRF-Token': xsrfCookie
    },
    url,
    beforeSubmit,
    success,
    error
  });
};

export default ajaxFormClientSideValidate;

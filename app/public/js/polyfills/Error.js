/* eslint-disable no-restricted-globals, no-shadow */
// For IE 5.5 (needed per `eslint-plugin-compat`)
if (typeof Error === 'undefined') {
  /**
   * Error polyfill.
   */
  window.Error = class Error {};
}

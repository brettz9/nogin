/* eslint-disable no-restricted-globals, no-shadow */
// For IE 5.5 (needed per `eslint-plugin-compat`)
if (typeof Error === 'undefined') {
  /**
   * Error polyfill.
   */
  // @ts-expect-error Ok for browser
  window.Error = class Error {};
}

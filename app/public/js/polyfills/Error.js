/* eslint-disable no-restricted-globals, no-shadow -- Polyfill */
// For IE 5.5 (needed per `eslint-plugin-compat`)
if (typeof Error === 'undefined') {
  /**
   * Error polyfill.
   */
  // @ts-expect-error Ok for browser
  // eslint-disable-next-line @stylistic/max-len -- Long
  // eslint-disable-next-line unicorn/no-global-object-property-assignment -- Polyfill
  window.Error = class Error {};
}

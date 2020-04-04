// Add an empty file here to get added to `instrumented` directory and
//  so that found in `layout.js` when `JS_DIR` is set to `instrumented` and
//  `__coverage__` gets set for those pages which
//  otherwise wouldn't get an instrumented script file,
//  e.g., 404 and users
// See https://github.com/cypress-io/code-coverage#instrument-your-application

// We don't go to trouble of loading no-op polyfill for older browsers with
//  `console`, as this file is not built.

'use strict';
// istanbul ignore else
if (typeof console !== 'undefined' && console.log) {
  console.log('placeholder code');
}

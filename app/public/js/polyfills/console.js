// No-op shim for Opera 9 and IE 5.5 (needed per `eslint-plugin-compat`)
const consoleShim = typeof console === 'undefined'
  ? {log () {
    //
  }, error () {
    //
  }}
  : console;

export default consoleShim;

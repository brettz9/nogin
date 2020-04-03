// No-op shim for Opera 9 and IE 5.5 (needed per `eslint-plugin-compat`)
const consoleShim = typeof console === 'undefined'
  ? {}
  : console;

const noop = () => {
  // No-op
};

['error', 'log'].forEach((prop) => {
  if (!consoleShim[prop]) {
    consoleShim[prop] = noop;
  }
});

export default consoleShim;

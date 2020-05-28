'use strict';

module.exports = {
  parser: 'babel-eslint',
  rules: {
    // Intrusive
    'no-global-assign': ['error'],

    // Vulnerable
    'no-eval': ['error']
  }
};

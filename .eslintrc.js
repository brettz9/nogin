'use strict';

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'ash-nazg/sauron',
    'plugin:node/recommended-script',
    'plugin:cypress/recommended'
  ],
  env: {
    es6: true
  },
  settings: {
    polyfills: [
    ]
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  overrides: [{
    files: [
      'cypress/integration/**/*.js',
      'cypress/plugins/main.js',
      'cypress/support/**/*.js',
      'test/**'
    ],
    extends: [
      'plugin:chai-expect/recommended',
      'plugin:chai-friendly/recommended',
      'plugin:node/recommended-module'
    ],
    rules: {
      'cypress/assertion-before-screenshot': ['error'],
      'cypress/require-data-selectors': ['error'],
      'cypress/no-force': ['error']
    }
  }, {
    files: ['test/**'],
    extends: [
      'plugin:node/recommended-module'
    ],
    env: {
      node: true
    },
    globals: {
      __dirname: true
    }
  }, {
    files: ['*.md'],
    rules: {
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-unpublished-import': 'off'
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module'
    }
  }],
  rules: {
    'import/no-commonjs': 0,
    'import/unambiguous': 0,

    // Browser only
    'compat/compat': 0,

    'no-console': 0
  }
};

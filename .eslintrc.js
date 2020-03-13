'use strict';

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'ash-nazg/sauron',
    'plugin:node/recommended-script'
  ],
  env: {
    browser: false,
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
    files: ['test/**'],
    extends: [
      // Note: Could add this to cypress tests too, using the `chai` global
      //   which is auto-added in that environment
      'plugin:@fintechstudios/chai-as-promised/recommended'
    ],
    env: {
      mocha: true
    },
    globals: {
      expect: true
    }
  }, {
    files: [
      'cypress/**'
    ],
    extends: [
      'plugin:cypress/recommended'
    ]
  }, {
    files: [
      'cypress/integration/**/*.js',
      'cypress/plugins/main.js',
      'cypress/plugins/db-basic-testing-extensions.js',
      'cypress/support/**/*.js',
      'test/*.js'
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
    files: [
      'app/public/**'
    ],
    env: {
      node: false,
      browser: true
    }
  }, {
    files: [
      'test/*.js',
      'test/fixtures/bad-template.js',
      'test/utilities/**'
    ],
    extends: [
      'plugin:node/recommended-module'
    ],
    env: {
      node: true
    },
    globals: {
      require: true,
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

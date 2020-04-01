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
      // Supplied by core-js
      'Object.values',
      'Promise',

      // Would require polyfills for these much older features
      'console',
      'Error',
      'location.href'
    ]
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  overrides: [{
    files: ['test/**'],
    extends: [
      // Disabling for now until merging/releasing:
      //  https://github.com/fintechstudios/eslint-plugin-chai-as-promised/pull/15
      // Note: Could add this to cypress tests too, using the `chai` global
      //   which is auto-added in that environment
      // 'plugin:@fintechstudios/chai-as-promised/recommended'
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
      'cypress/support/**/*.js',
      'test/*.js'
    ],
    settings: {
      polyfills: [
        'Promise',
        'Promise.all',
        'Promise.resolve'
      ]
    },
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
      'cypress/plugins/main.js',
      'cypress/plugins/db-basic-testing-extensions.js',
      'rollup.config.js'
    ],
    extends: [
      'plugin:node/recommended-module'
    ],
    rules: {
      // Browser only
      'compat/compat': 0
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
      'app/public/js/controllers/*.js',
      'app/public/js/form-validators/**',
      'app/public/js/polyfills/**',
      'app/public/js/utilities/**',
      'app/public/js/views/**'
    ],
    extends: [
      'plugin:node/recommended-module'
    ],
    env: {
      node: false,
      browser: true
    }
  }, {
    files: [
      'app/public/js/controllers/emptyController.js'
    ],
    extends: [
      'plugin:node/recommended-script'
    ]
  }, {
    files: [
      'app/server/**', 'test/**', 'bin/**', 'app.js',
      'tools/mochawesome-cli.js'
    ],
    rules: {
      // Browser only
      'compat/compat': 0
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

    // For modules, we shouldn't need `window`
    'no-restricted-globals': ['error', 'window'],

    'no-console': 0
  }
};

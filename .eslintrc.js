'use strict';

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'ash-nazg/sauron-node-script'
  ],
  env: {
    browser: false,
    es6: true
  },
  settings: {
    polyfills: [
      // Need to take care these polyfills are loaded in files that use them;
      //  Ponyfills/shims loaded as needed would be safer than blanket
      //  whitelisting here, but less semantic and less friendly for future
      //  migration.
      // Might use https://github.com/rollup/plugins/tree/master/packages/inject
      //  which would auto-insert wherever used.

      // Supplied by core-js
      'Object.values',
      'Promise',

      // Supplied by polyfills
      'console',
      'Error'

      // (Conditionally) used, but served as string from server
      // 'location.href'
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
      'ash-nazg/sauron-node'
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
      'ash-nazg/sauron-node'
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
      'ash-nazg/sauron-node'
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
      'ash-nazg/sauron-node-script'
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
      'ash-nazg/sauron-node'
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
    'node/exports-style': 0,
    'import/unambiguous': 0,

    // For modules, we shouldn't need `window`
    'no-restricted-globals': ['error', 'window'],

    'no-console': 0
  }
};

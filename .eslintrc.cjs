'use strict';

const rules = {
  'import/no-commonjs': 0,
  'import/unambiguous': 0,

  // Disable for now
  'eslint-comments/require-description': 0,

  // For modules, we shouldn't need `window`
  'no-restricted-globals': ['error', 'window'],

  'no-console': 0
};

module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false
  },
  extends: [
    'ash-nazg/sauron-script-overrides'
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
      'ash-nazg/sauron-node',
      // Note: Could add this to cypress tests too, using the `chai` global
      //   which is auto-added in that environment
      'plugin:@fintechstudios/chai-as-promised/recommended'
    ],
    env: {
      browser: false,
      node: true,
      mocha: true
    },
    globals: {
      module: true,
      expect: true
    },
    rules: {
      ...rules,

      // Browser only
      'compat/compat': 0,
      'import/no-commonjs': 0,
      'no-console': 0,
      'node/exports-style': 0,

      // Disable for now
      'eslint-comments/require-description': 0
    }
  }, {
    files: [
      'cypress/**'
    ],
    extends: [
      'plugin:cypress/recommended'
    ],
    rules
  }, {
    files: ['**/*.md/*.js'],
    rules: {
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-unpublished-import': 'off'
    }
  }, {
    files: [
      'cypress/integration/**/*.js',
      'cypress/support/**/*.js',
      'test/*.mjs'
    ],
    settings: {
      polyfills: [
        'Promise',
        'Promise.all',
        'Promise.resolve'
      ]
    },
    env: {
      browser: false
    },
    extends: [
      'ash-nazg/sauron-node',
      'plugin:chai-expect/recommended',
      'plugin:chai-friendly/recommended'
    ],
    rules: {
      ...rules,
      'cypress/assertion-before-screenshot': ['error'],
      'cypress/require-data-selectors': ['error'],
      'cypress/no-force': ['error'],

      // Browser only
      'compat/compat': 0,

      // Disable for now
      'eslint-comments/require-description': 0
    }
  }, {
    files: [
      'cypress/plugins/index.js'
    ],
    extends: [
      'ash-nazg/sauron-node-script-overrides'
    ]
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
      'compat/compat': 0,

      'no-console': 0,

      // Disable for now
      'eslint-comments/require-description': 0
    }
  }, {
    files: [
      'app/public/**'
    ],
    env: {
      node: false,
      browser: true
    },
    rules
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
    },
    rules: {
      ...rules,
      // Disable for now
      'eslint-comments/require-description': 0
    }
  }, {
    files: [
      'app/public/js/controllers/emptyController.js'
    ],
    extends: [
      'ash-nazg/sauron-node-script'
    ],
    rules: {
      'no-console': 'off'
    }
  }, {
    files: ['nogin.js', 'nogin-sample.js'],
    extends: ['ash-nazg/sauron-script-overrides', 'ash-nazg/rc-script']
  }, {
    env: {
      browser: false,
      node: true
    },
    files: [
      'app/server/**', 'bin/**', 'app.js',
      'tools/mochawesome-cli.js'
    ],
    extends: [
      'ash-nazg/sauron-node-script'
    ],
    rules: {
      // Browser only
      'compat/compat': 0,

      // Disable for now
      'eslint-comments/require-description': 0,

      'import/no-commonjs': 0,
      'no-console': 0,
      'node/exports-style': 0
    }
  }, {
    files: [
      'test/fixtures/bad-template.mjs',
      'test/utilities/**'
    ],
    extends: [
      'ash-nazg/sauron-node'
    ],
    rules
  }],
  rules
};

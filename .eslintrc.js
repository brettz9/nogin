module.exports = {
    "env": {
      "es6": true
    },
    "settings": {
      "polyfills": [
      ]
    },
    "extends": [
      "ash-nazg/sauron",
      "plugin:node/recommended-script",
      "plugin:cypress/recommended"
    ],
    "plugins": [
      "pug"
    ],
    "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
    },
    "overrides": [{
      files: ["cypress/integration/**/*.js"],
      plugins: [
        'chai-friendly'
      ],
      rules: {
        'no-unused-expressions': 'off',
        'chai-friendly/no-unused-expressions': ['error']
      }
    }, {
      files: [
        "app/public/js/views/bogus.js",
        "cypress/integration/unit.js",
        "cypress/support/index.js"
      ],
      parserOptions: {
        "ecmaVersion": 2018,
        "sourceType": "module"
      },
    }, {
      files: ["*.md"],
      rules: {
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-unpublished-import': 'off'
      },
      parserOptions: {
        "ecmaVersion": 2018,
        "sourceType": "module"
      }
    }, {
      files: ["*.pug"],
      rules: {
        'eol-last': 0
      }
    }],
    "rules": {
      "object-curly-spacing": ["error", "always"],

      "import/no-commonjs": 0,
      "import/unambiguous": 0,

      // Browser only
      "compat/compat": 0,

      "no-console": 0
    }
};

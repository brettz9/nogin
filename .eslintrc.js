module.exports = {
    "extends": [
      "ash-nazg/sauron",
      "plugin:node/recommended-script",
      "plugin:cypress/recommended"
    ],
    "plugins": [
      "pug"
    ],
    "env": {
      "es6": true
    },
    "settings": {
      "polyfills": [
      ]
    },
    "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
    },
    "overrides": [{
      files: ["cypress/integration/**/*.js"],
      extends: [
        'plugin:chai-expect/recommended',
        'plugin:chai-friendly/recommended'
      ],
      rules: {
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
      "import/no-commonjs": 0,
      "import/unambiguous": 0,

      // Browser only
      "compat/compat": 0,

      "no-console": 0
    }
};

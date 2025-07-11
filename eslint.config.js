import ashNazg from 'eslint-config-ash-nazg';
const off = 'off'; // Weird behavior from sonarjs
export default [
  {
    name: 'nogin/ignores',
    ignores: [
      'instrumented/**',
      'coverage/**',
      'mochawesome-report/**',
      'cypress/results/**',
      'docs/typedoc',
      'app/public/js/controllers/*.iife.min.js',
      'app/public/js/polyfills/*.iife.min.js'
    ]
  },
  {
    name: 'nogin/settings',
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
    }
  },
  ...ashNazg(['sauron']),
  ...ashNazg(['sauron', 'node']).map((cfg) => {
    const cypressRules = {
      'cypress/assertion-before-screenshot': ['error'],
      'cypress/require-data-selectors': ['error'],
      'cypress/no-force': ['error'],
      'sonarjs/no-hardcoded-passwords': off
    };
    return {
      files: ['test/**', 'cypress/**', 'test/*.js'],
      ...cfg,
      rules: {
        ...cfg.rules,
        ...(cfg.plugins?.cypress ? cypressRules : {})
      }
    };
  }),
  {
    name: 'nogin/readme',
    files: ['*.md/*.js'],
    rules: {
      'sonarjs/no-hardcoded-ip': 'off'
    }
  },
  {
    name: 'nogin/basic',
    rules: {
      'import/no-commonjs': 0,
      'import/unambiguous': 0,
      'no-console': 0,
      '@brettz9/no-use-ignored-vars': 0,

      // For modules, we shouldn't need `window`
      'no-restricted-globals': ['error', 'window'],
      'unicorn/prefer-global-this': 'off'
    }
  }
];

import parser from '@babel/eslint-parser';
export default [
  {
    ignores: [
      '!node_modules/**'
    ]
  },
  {
    languageOptions: {
      parser,
      parserOptions: {
        requireConfigFile: false
      }
    }
  },
  {
    files: [
      'node_modules/bson/lib/bson/parser/deserializer.js',
      'node_modules/depd/index.js',
      'node_modules/es-abstract/GetIntrinsic.js'
    ],
    rules: {
      'no-eval': 'off'
    }
  },
  {
    files: ['node_modules/once/once.js'],
    rules: {
      'no-extend-native': 'off'
    }
  },
  {
    rules: {
      // Intrusive
      'no-extend-native': ['error'],
      'no-global-assign': ['error'],

      // Vulnerable
      'no-eval': ['error']
    }
  }
];

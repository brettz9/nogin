'use strict';

module.exports = {
  recurseDepth: 10,
  source: {
    exclude: [
      'coverage',
      'cypress',
      'instrumented',
      'node_modules',
      'test'
    ],
    excludePattern: 'rollup\\.*|.*iife\\.min\\.js'
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: true
  },
  templates: {
    cleverLinks: true,
    monospaceLinks: false
  },
  opts: {
    recurse: true,
    verbose: true,
    destination: 'docs/jsdoc'
  }
};

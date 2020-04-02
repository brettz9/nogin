'use strict';

module.exports = [
  {
    name: 'loggerLocale', type: String,
    description: 'Locale for server log messages; defaults to "en-US".',
    typeLabel: '{underline locale}'
  },
  {
    name: 'noLogging', alias: 'l', type: Boolean,
    description: 'Whether to disable logging; defaults to `false` (logging ' +
      'is enabled).'
  }
];

'use strict';

require('@babel/register')({
  babelrc: false,
  plugins: [
    ['@babel/plugin-transform-modules-commonjs']
  ]
});
module.exports = require('./main.js').default;

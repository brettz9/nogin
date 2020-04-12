/* eslint-disable promise/prefer-await-to-callbacks */
'use strict';

// Todo: Reenable dominum when getting it working
// const jml = require('jamilih/dist/jml-dominum.js').default;
// const jml = dominum.default;
const jsdom = require('jamilih/dist/jml-jsdom.js');

const jml = jsdom.default;

module.exports = function (filePath, options, callback) {
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const template = require(filePath);

  let rendered;
  try {
    rendered = jml.toXML(...template(options));
  } catch (err) {
    return callback(err);
  }

  return callback(null, rendered);
};

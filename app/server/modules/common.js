'use strict';

const {v4: uuid} = require('uuid');

const isNullish = (o) => o === null || o === undefined;

/**
 * @param {GenericObject} obj
 * @param {string} prop
 * @returns {boolean}
 */
const hasOwn = (obj, prop) => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const parseCLIJSON = (opts) => {
  return typeof opts === 'string'
    ? JSON.parse(opts)
    : opts;
};

exports.isNullish = isNullish;
exports.uuid = uuid;
exports.hasOwn = hasOwn;
exports.parseCLIJSON = parseCLIJSON;

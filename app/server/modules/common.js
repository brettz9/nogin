'use strict';

const isNullish = (o) => o === null || o === undefined;

/**
 * @returns {string}
 */
const guid = function () {
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    const r = Math.trunc(Math.random() * 16),
      v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  /* eslint-enable no-bitwise */
};

/**
 * @param {GenericObject} obj
 * @param {string} prop
 * @returns {boolean}
 */
const hasOwn = (obj, prop) => {
  return {}.hasOwnProperty.call(obj, prop);
};

exports.isNullish = isNullish;
exports.guid = guid;
exports.hasOwn = hasOwn;

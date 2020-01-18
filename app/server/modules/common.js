'use strict';

const isNullish = (o) => o === null || o === undefined;

/**
 * @returns {string}
 */
const guid = function () {
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  /* eslint-enable no-bitwise */
};

exports.isNullish = isNullish;
exports.guid = guid;

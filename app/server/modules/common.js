import {v4 as uuid} from 'uuid';

/* eslint-disable jsdoc/reject-any-type -- Arbitrary */
/**
 * @typedef {any} AnyValue
 */
/* eslint-enable jsdoc/reject-any-type -- Arbitrary */

/**
 * @param {AnyValue} o
 * @returns {o is null|undefined}
 */
const isNullish = (o) => o === null || o === undefined;

/**
 * @param {object} obj
 * @param {string} prop
 * @returns {boolean}
 */
const hasOwn = (obj, prop) => {
  return Object.hasOwn(obj, prop);
};

/**
 * @param {AnyValue} opts
 */
const parseCLIJSON = (opts) => {
  return typeof opts === 'string'
    ? JSON.parse(opts)
    : opts;
};

export {isNullish, uuid, hasOwn, parseCLIJSON};

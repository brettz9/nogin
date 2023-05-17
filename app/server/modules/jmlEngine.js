/* eslint-disable promise/prefer-await-to-callbacks */
// Todo: Reenable dominum when getting it working
// const jml = require('jamilih/dist/jml-dominum.js').default;
// const jml = dominum.default;
import {jml} from 'jamilih/src/jml-jsdom.js';

/**
 * @param {string} filePath
 * @param {object} options
 * @param {(err: any, rendered?: string) => void} callback
 * @returns {Promise<void>}
 */
const jmlEngine = async (filePath, options, callback) => {
  // eslint-disable-next-line no-unsanitized/method -- Could supply import
  const template = (await import(filePath)).default;

  let rendered;
  try {
    rendered = jml.toXML(...(/** @type {import('jamilih').JamilihArray} */ (
      await template(options))
    ));
  } catch (err) {
    return callback(err);
  }

  return callback(null, rendered);
};

export default jmlEngine;

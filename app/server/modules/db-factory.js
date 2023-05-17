import {MongoDB} from './db-adapters/MongoDB.js';

/**
 * @typedef {number} Integer
 */

/**
 * @typedef {object} DbConfig
 * @property {string} [DB_USER]
 * @property {string} [DB_PASS]
 * @property {string} [DB_HOST]
 * @property {Integer} [DB_PORT]
 * @property {string} [DB_NAME]
 */

/**
 * @typedef {Required<DbConfig> & {
 *   adapter: "mongodb"
 * }} DbOptions
 */

/**
 * Creates a specific database type instance.
 */
const DBFactory = {
  /**
   * @param {Partial<DbConfig>} options
   * @returns {DbOptions}
   */
  getDefaults (options) {
    return /** @type {DbOptions} */ ({
      DB_NAME: 'nogin',
      DB_HOST: '127.0.0.1',
      DB_PORT: 27017,
      adapter: 'mongodb',
      ...options
    });
  },

  /**
   * @param {"mongodb"} adapter
   * @param {boolean} prod
   * @param {DbConfig} dbConfig
   * @returns {string}
   */
  getURL (adapter, prod, dbConfig) {
    switch (adapter) {
    case 'mongodb':
      return MongoDB.getURL(prod, dbConfig);
    default:
      throw new Error(`Unrecognized database adapter "${adapter}"!`);
    }
  },

  /**
   * @param {"mongodb"} adapter
   * @param {import('./db-abstraction.js').DBConfigObject} config
   * @returns {MongoDB}
   */
  createInstance (adapter, config) {
    switch (adapter) {
    case 'mongodb':
      return new MongoDB(config);
    default:
      throw new Error(`Unrecognized database adapter "${adapter}"!`);
    }
  }
};

export default DBFactory;

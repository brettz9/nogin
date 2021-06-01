'use strict';

const MongoDB = require('./db-adapters/MongoDB.js');

/**
* @typedef {PlainObject} DbConfig
* @property {string} DB_USER
* @property {string} DB_PASS
* @property {string} DB_HOST
* @property {Integer} DB_PORT
* @property {string} DB_NAME
*/

/**
* @typedef {DbConfig} DbOptions
* @property {"mongodb"} adapter
*/

/**
 * Creates a specific database type instance.
 */
const DBFactory = {
  /**
  * @param {DbConfig} options
  * @returns {DbOptions}
  */
  getDefaults (options) {
    return {
      DB_NAME: 'nogin',
      DB_HOST: 'localhost',
      DB_PORT: 27017,
      adapter: 'mongodb',
      ...options
    };
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
   * @param {DBConfigObject} config
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

module.exports = DBFactory;

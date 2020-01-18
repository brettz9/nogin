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
 * Creates a specific database type instance.
 */
class DBFactory {
  /**
  * @param {DbConfig} options
  * @returns {DbConfig}
  */
  static getDefaults (options) {
    return {
      DB_NAME: 'node-login',
      DB_HOST: 'localhost',
      DB_PORT: 27017,
      adapter: 'mongodb',
      ...options
    };
  }
  /**
   * @param {"mongodb"} adapter
   * @param {boolean} prod
   * @param {DbConfig} dbConfig
   * @returns {string}
   */
  static getURL (adapter, prod, dbConfig) {
    switch (adapter) {
    case 'mongodb':
      return MongoDB.getURL(prod, dbConfig);
    default:
      throw new Error(`Unrecognized database adapter ${adapter}!`);
    }
  }
  /**
   * @param {"mongodb"} adapter
   * @param {DBConfigObject} config
   * @returns {MongoDB}
   */
  static createInstance (adapter, config) {
    switch (adapter) {
    case 'mongodb':
      return new MongoDB(config);
    default:
      throw new Error('Unrecognized database adapter!');
    }
  }
}

module.exports = DBFactory;

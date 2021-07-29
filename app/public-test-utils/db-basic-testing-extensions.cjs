'use strict';

// If we decide to expose this to the non-testing API (CLI, server,
//   or programmatic) of db-basic, we will need coverage
// import {getAccountManager} from '../server/modules/db-basic.js';
const {getAccountManager} = require('../server/modules/db-basic.js');

/**
* @typedef {DbConfig} GenerateLoginOptionDefinitions
* @property {string|string[]} user
* @property {string|string[]} ip
*/

/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a login key since that key should really only be
 * useful in a browser.
 * @param {GenerateLoginOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
/* export */ const generateLoginKeys = async (options) => {
  const am = await getAccountManager(options);
  const {ip, user} = options;
  const users = Array.isArray(user) ? user : [user];
  const ips = Array.isArray(ip) ? ip : [ip];
  return Promise.all(
    users.map((usr, i) => {
      return am.generateLoginKey(usr, ips[i]);
    })
  );
};

/**
* @typedef {DbConfig} GeneratePasswordOptionDefinitions
* @property {string|string[]} email
* @property {string|string[]} ip
*/

/**
 * Don't see a real need now to expose this on CLI (in
 * `manage-accounts.js`) as there seems to be little use for getting
 * and setting a password key since that key should really only be
 * useful in a browser.
 * @param {GeneratePasswordOptionDefinitions} options
 * @returns {Promise<string[]>} Cookies
 */
/* export */ const generatePasswordKey = async (options) => {
  const am = await getAccountManager(options);
  const {email, ip} = options;
  const emails = Array.isArray(email) ? email : [email];
  const ips = Array.isArray(ip) ? ip : [ip];
  return Promise.all(
    emails.map(async (eml, i) => {
      const {passKey} = await am.generatePasswordKey(eml, ips[i]);
      return passKey;
    })
  );
};

/* eslint-disable node/exports-style -- Individual items */
exports.generateLoginKeys = generateLoginKeys;
exports.generatePasswordKey = generatePasswordKey;
/* eslint-enable node/exports-style -- Individual items */

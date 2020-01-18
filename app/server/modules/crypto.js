'use strict';

/* eslint-disable-next-line no-shadow  */
const crypto = require('crypto');

/*
  private encryption & validation methods
*/

const md5 = function (str) {
  return crypto.createHash('md5').update(str).digest('hex');
};

const saltAndHash = function (data) {
  const hasher = 'sha256';
  const iterations = 10000;
  const hashLength = 32;
  const saltBytes = 16;
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    crypto.randomBytes(saltBytes, function (err, buf) {
      if (err) {
        reject(err);
        return;
      }
      const salt = buf.toString('hex');
      crypto.pbkdf2(
        data, salt, iterations, hashLength, hasher,
        function (error, derivedKey) {
          if (error) {
            reject(error);
            return;
          }
          const hash = derivedKey.toString('hex');
          resolve([salt, hash].join('$'));
        }
      );
    });
  });
};

const validatePasswordV0 = function (plainPass, hashedPass) {
  const salt = hashedPass.slice(0, 10);
  const validHash = salt + md5(plainPass + salt);
  if (hashedPass !== validHash) {
    throw new Error('invalid-password');
  }
};

const validatePasswordV1 = function (plainPass, hashedPass) {
  const hasher = 'sha256';
  const iterations = 10000;
  const hashLength = 32;
  const salt = hashedPass.split('$')[0];
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      plainPass, salt, iterations, hashLength, hasher,
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      function (err, derivedKey) {
        if (err) {
          reject(new Error('invalid-password'));
          return;
        }
        const plainPassHash = derivedKey.toString('hex');
        const validHash = [salt, plainPassHash].join('$');
        resolve(hashedPass === validHash);
      }
    );
  });
};

exports.saltAndHash = saltAndHash;
exports.validatePasswordV0 = validatePasswordV0;
exports.validatePasswordV1 = validatePasswordV1;

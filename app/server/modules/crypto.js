import {pbkdf2, randomBytes} from 'crypto';
import safeCompare from 'safe-compare';

/*
  private encryption & validation methods
*/

/**
 * @param {string} data
 * @param {string} salt
 * @returns {Promise<string>}
 */
function pbkdf2Prom (data, salt) {
  const hasher = 'sha256';
  const iterations = 10000;
  const hashLength = 32;
  // eslint-disable-next-line promise/avoid-new -- our own API
  return new Promise((resolve, reject) => {
    pbkdf2(
      data, salt, iterations, hashLength, hasher,
      // eslint-disable-next-line promise/prefer-await-to-callbacks -- API
      function (error, derivedKey) {
        // istanbul ignore if
        if (error) {
          reject(error);
          return;
        }
        const hash = derivedKey.toString('hex');
        resolve([salt, hash].join('$'));
      }
    );
  });
}

/**
 * @param {string} data
 * @returns {Promise<string>}
 */
const saltAndHash = function (data) {
  const saltBytes = 16;
  // eslint-disable-next-line promise/avoid-new -- our own API
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- API
    randomBytes(saltBytes, async function (err, buf) {
      // istanbul ignore if
      if (err) {
        reject(err);
        return;
      }
      const salt = buf.toString('hex');
      try {
        const resolved = await pbkdf2Prom(data, salt);
        resolve(resolved);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * @param {string} plainPass
 * @param {string} hashedPass
 * @returns {Promise<boolean>}
 */
const validatePasswordV1 = async function (plainPass, hashedPass) {
  const [salt] = hashedPass.split('$');
  const validHash = await pbkdf2Prom(plainPass, salt);
  return safeCompare(hashedPass, validHash);
};

export {saltAndHash, validatePasswordV1};

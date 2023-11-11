import {spawn} from 'child_process';

/**
* @callback EventWatcher
* @param {string} stdout Aggregate stdout
* @param {string} data
* @returns {void|Promise<void>}
*/

/**
 * @typedef {number} Integer
 */

/**
 * @overload
 * @param {string} path
 * @param {object} opts
 * @param {string[]} args
 * @param {Integer} [killDelay=10000]
 * @param {EventWatcher|null|undefined} watchEvents
 * @returns {Promise<import('../cli.js').SpawnResults>}
 */

/**
 * @overload
 * @param {string} path
 * @param {string[]} opts
 * @param {Integer} args
 * @param {EventWatcher|null|undefined} killDelay
 * @returns {Promise<import('../cli.js').SpawnResults>}
 */

/**
 * @param {string} path
 * @param {object|string[]|undefined} opts
 * @param {(string|Integer)[]|Integer} [args]
 * @param {Integer|EventWatcher|null|undefined} [killDelay]
 * @param {EventWatcher|null|undefined} [watchEvents]
 * @returns {Promise<import('../cli.js').SpawnResults>}
 */
const spawnPromise = (
  path, opts, args, killDelay, watchEvents = null
) => {
  if (Array.isArray(opts)) {
    watchEvents = /** @type {EventWatcher|null|undefined} */ (killDelay);
    killDelay = /** @type {Integer} */ (args);
    args = /** @type {string[]} */ (opts);
    opts = undefined;
  }
  if (!killDelay) {
    killDelay = 10000;
  }
  // eslint-disable-next-line promise/avoid-new -- Control promisifying
  return new Promise((resolve, reject) => {
    let stderr = '', stdout = '';
    const cli = spawn(
      path,
      /** @type {string[]} */ (args),
      /** @type {object} */
      (opts)
    );
    cli.stdout.on('data', (data) => {
      stdout += data;
      if (watchEvents) {
        watchEvents(stdout, data);
      }
    });

    cli.stderr.on('data', (data) => {
      stderr += data;
    });

    cli.on('error', (data) => {
      const err = new Error(data.message);
      reject(err);
    });

    cli.on('close', (/* code */) => {
      resolve({
        stdout,
        stderr
      });
    });
    // Todo: We should really just signal this when we know the server
    //  is running
    setTimeout(() => {
      cli.kill();
    }, /** @type {Integer} */ (killDelay));
  });
};

export default spawnPromise;

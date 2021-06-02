import {spawn} from 'child_process';

/**
* @callback EventWatcher
* @param {string} stdout Aggregate stdout
* @param {string} data
* @returns {void|Promise<void>}
*/

/**
 * @param {string} path
 * @param {PlainObject|string[]} opts
 * @param {string[]} args
 * @param {Integer} [killDelay=10000]
 * @param {EventWatcher} watchEvents
 * @returns {Promise<SpawnResults>}
 */
const spawnPromise = (
  path, opts, args, killDelay, watchEvents = null
) => {
  if (Array.isArray(opts)) {
    watchEvents = killDelay;
    killDelay = args;
    args = opts;
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
      args,
      opts
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
      const err = new Error(data);
      reject(err);
    });

    cli.on('close', (code) => {
      resolve({
        stdout,
        stderr
      });
    });
    // Todo: We should really just signal this when we know the server
    //  is running
    setTimeout(() => {
      cli.kill();
    }, killDelay);
  });
};

export default spawnPromise;

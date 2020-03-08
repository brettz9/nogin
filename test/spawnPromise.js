import {spawn} from 'child_process';

/**
 * @param {string} path
 * @param {PlainObject|string[]} opts
 * @param {string[]} args
 * @param {Integer} [killDelay=10000]
 * @returns {Promise<SpawnResults>}
 */
const spawnPromise = (path, opts, args, killDelay = 10000) => {
  if (Array.isArray(opts)) {
    killDelay = args || killDelay;
    args = opts;
    opts = undefined;
  }
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    let stderr = '', stdout = '';
    const cli = spawn(
      path,
      args,
      opts
    );
    cli.stdout.on('data', (data) => {
      stdout += data;
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

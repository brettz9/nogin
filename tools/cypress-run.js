import {spawn} from 'node:child_process';

const preserveCoverageFlag = '--preserve-coverage';
const preserveResultsFlag = '--preserve-results';
const args = process.argv.slice(2);
const preserveCoverage = args.includes(preserveCoverageFlag);
const preserveResults = args.includes(preserveResultsFlag);
const cypressArgs = args.filter((arg) => {
  return arg !== preserveCoverageFlag && arg !== preserveResultsFlag;
});

/**
 * @param {string} command
 * @param {string[]} commandArgs
 * @returns {Promise<void>}
 */
function run (command, commandArgs) {
  // eslint-disable-next-line promise/avoid-new -- Adapt child process events
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: 'inherit'
    });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(Object.assign(
        new Error(`${command} exited with status ${String(code)}`),
        {exitCode: code ?? 1}
      ));
    });
  });
}

const cleanupScript = preserveCoverage && !preserveResults
  ? 'cypress:remove-mochaawesome'
  : 'cypress:run-remove';
try {
  if (!preserveResults) {
    await run('npm', ['run', cleanupScript]);
  }
  await run('cypress', [
    'run',
    '--browser=chrome',
    '--reporter=mocha-multi-reporters',
    '--reporter-options',
    'configFile=mmr.json',
    ...cypressArgs
  ]);
} catch (error) {
  console.error(error.message);
  process.exitCode = error.exitCode ?? 1;
}

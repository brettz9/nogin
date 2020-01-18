// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import fs from 'fs';
import {dirname} from 'path';
import {spawn} from 'child_process';

import browserify from '@cypress/browserify-preprocessor';
import codeCoverageTask from '@cypress/code-coverage/task.js';

import {
  addAccounts, removeAccounts
} from '../../app/server/modules/db-basic.js';

const exprt = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
  on('task', codeCoverageTask);

  on('task', {
    deleteAllAccounts () {
      return removeAccounts({all: true});
    }
  });

  on('task', {
    async addAccount () {
      return (await addAccounts({
        name: ['Brett'],
        email: ['brettz9@example.com'],
        user: ['bretto'],
        pass: ['abc123456'],
        country: ['US'],
        // eslint-disable-next-line max-len
        activationCode: ['0bb6ab8966ef06be4bea394871138169$f5eb3f8e56b03d24d5dd025c480daa51e55360cd674c0b31bb20993e153a6cb1'],
        activated: [true]
      }))[0];
    },
    async addNonActivatedAccount () {
      return (await addAccounts({
        name: ['Brett'],
        email: ['brettz9@example.com'],
        user: ['bretto'],
        pass: ['abc123456'],
        country: ['US'],
        activated: [false]
      }))[0];
    }
  });

  // // eslint-disable-next-line global-require
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));

  // https://docs.cypress.io/api/plugins/preprocessors-api.html#File-object
  // https://github.com/cypress-io/code-coverage#instrument-unit-tests
  // https://docs.cypress.io/guides/tooling/code-coverage.html#E2E-and-unit-code-coverage
  // If using Babel, use this instead:
  //   `@cypress/code-coverage/use-babelrc` per https://docs.cypress.io/guides/tooling/code-coverage.html#E2E-and-unit-code-coverage
  on('file:preprocessor', (file) => {
    const {filePath, shouldWatch} = file; // , outputPath

    console.log('file.outputPath', JSON.stringify(file.outputPath));

    console.log(
      'preprocess1', filePath, '::',
      config.integrationFolder.replace(/\/$/u, '') + '/'
    );
    console.log(
      'preprocess2', filePath, '::',
      dirname(config.supportFile).replace(/\/$/u, '') + '/'
    );

    if (shouldWatch) {
      const watcher = fs.watch(filePath, () => {
        file.emit('rerun'); // with watch
      });
      // Close event if the current running spec, the project, or the
      //   browser is closed
      file.on('close', () => {
        watcher.close();
      });
    }

    // We catch this or otherwise our test files themselves will be instrumented
    //  in place.
    // Todo: This apparently doesn't work because we need the imports *within*
    //   the test files (and they are not reported)?
    if ([
      config.integrationFolder,
      dirname(config.supportFile)
    ].some((folder) => {
      return filePath.startsWith(folder.replace(/\/$/u, '') + '/');
    })) {
      console.log('browserifying', file);
      return browserify(browserify.defaultOptions)(file);
    }

    console.log('spawning');

    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      const nyc = spawn('nyc', [
        'instrument', filePath, 'instrumented'
      ]);
      nyc.on('exit', () => {
        resolve(browserify(browserify.defaultOptions)(file));
      });
    });
  });
  // E.g.:
  // on('file:preprocessor', require('@cypress/code-coverage/use-babelrc.js'));
  // From https://github.com/cypress-io/code-coverage
};

export default exprt;

import terser from '@rollup/plugin-terser';

import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import {babel} from '@rollup/plugin-babel';

/**
 * @external RollupConfig
 * @type {object}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {object} config
 * @param {string} config.input
 * @param {boolean} [config.minifying]
 * @returns {RollupConfig}
 */
function getRollupObject ({input, minifying} = {}) {
  const nonMinified = {
    input,
    output: {
      format: 'iife',
      sourcemap: minifying,
      file: `${input.replace(/\.js$/u, '.iife')}${minifying ? '.min' : ''}.js`
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled'
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

export default [
  getRollupObject({
    input: 'app/public/js/polyfills/polyfills.js', minifying: true
  }),
  ...[
    'activatedController.js',
    'activationFailedController.js',
    'groupsController.js',
    'homeController.js',
    'usersController.js',
    'loginController.js',
    'privilegesController.js',
    'resetPasswordController.js',
    'signupController.js'
  ].map((file) => {
    return getRollupObject({
      input: `app/public/js/controllers/${file}`, minifying: true
    });
  })
];

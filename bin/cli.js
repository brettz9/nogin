#!/usr/bin/env node
'use strict';

const {cliBasics} = require('command-line-basics');

const {createServer} = require('../app.js');

const options = cliBasics({
  optionsPath: '../app/server/optionDefinitions.js',
  cwd: __dirname
});
if (!options) {
  return;
}

createServer(options);

#!/usr/bin/env node
require('source-map-support').install();
var path = require('path');

var usage_path = path.join(__dirname, 'usage.txt');

var Cli = require('../lib/src').Cli;
var cli = new Cli({ path: usage_path});

var result = cli.run({
  argv: process.argv.slice(2),
  version: '2.0'
}, {
  cwd: process.cwd()
});

console.log(result);

#!/usr/bin/env node
require('source-map-support').install();
var path = require('path');

var Cli = require('../lib').Cli;
var cli = new Cli({ path: path.join(__dirname, 'usage.txt') });

var HelpController = function(params, cli) {
  return cli.usage_doc;
};

cli
  .route('help', function(p, args) { return p.help || p['--help'] || args.length <= 0; }, HelpController)
  .route('now', null, function() { return (new Date()).toString(); });

var result = cli.run({
  argv: process.argv.slice(2),
  version: '2.0'
}, {
  cwd: process.cwd()
});

console.log(result);

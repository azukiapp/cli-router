#!/usr/bin/env node
require('source-map-support').install();

import { Cli } from '../../..';
import path from 'path';

class HelloCli extends Cli {
  docopt(options = {}) {
    options.help = false;
    return super.docopt(options);
  }
}

const cli = new HelloCli({
  // Path for usage file (with docopt syntax)
  path: path.join(__dirname, '..', 'assets', 'usage.txt'),
  // Folder for controllers
  controllers_root: path.join(__dirname, 'controllers')
});

// route(command, [filter: (params, args) => boolean], [controller: string | (params, cli) => string | number]): cli
cli
  .route('help', (params, args) => params.help || params['--help'] || args.length <= 0)
  .route('now', null, () => (new Date()).toString())
  .route('say')
  .route('help'); // If you do not fall in any other route, the help is called.

// run cli-router with process args
var result = cli.run({ argv: process.argv.slice(2) });
if (typeof result === 'string') {
  console.log(result); // eslint-disable-line no-console
} else {
  process.exit(result);
}

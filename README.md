# cli-router

[![NPM](https://nodei.co/npm/cli-router.png)](https://nodei.co/npm/cli-router/)

A simple Cli router to Controllers

## Install with [npm](https://www.npmjs.com/package/cli-router)

```shell
$ yarn add cli-router
# or
$ npm install --save cli-router
```

## Usage

Example of usage:

- `./usage.txt`:

```
Hello Word

Usage:
  usage hello <name> [--help]
  usage now [--help]
  usage version
  usage [--version | -h | --help]

Options:
  --help, -h  Show this help.
  --version   Show version.
```

- `./hello`

```javascript
#!/usr/bin/env node
// Used ES6 JS
import { Cli } from 'cli-router';

const cli = new Cli({
  // Path for usage file (with docopt syntax)
  path: path.join(__dirname, `usage.txt`),
  // Folder for controllers
  controllers_root: path.join(__dirname, "controllers")
});

// route(command, [filter: (params, args) => boolean], [controller: string | (params, cli) => string | number]): cli
cli
  .route('help', (p, args) => p.help || p['--help'] || args.length <= 0)
  .route('version', (p) => p.version || p['--version'])
  .route('now', null, () => (new Date()).toString());
  .route('hello');

// run cli-router with process args
var result = cli.run({ argv: process.argv.slice(2) });
console.log(result);
```

- `controllers/hello.js`

```javascript
// Used ES6 JS
var CliController = require('cli-router').CliController;
class Hello extends CliController {
  index(params, _cli) {
    return `Hello ${params['name']}`;
  }
}

module.exports = Hello;
```

- `controllers/help.js`

```javascript
// Used ES6 JS
var chalk = require('chalk');
var CliControllers = require('cli-router').CliControllers;

class Help extends CliControllers.Help {
  index(params, cli) {
    let usage = super.usage(params, cli);
    console.log(this.colorizeSections(params, usage));
    return 0;
  }

  colorizeSections(params, usage) {
    _.map(this.sections, (section) => {
      var regex = new RegExp(`^(${section}:)`, 'gmi');
      var match = regex.match(usage);
      if (match) {
        usage = usage.replace(regex, chalk.blue(`${match[1]}`));
      }
    });
    return usage;
  }
}

module.exports = Help;
```

#### Tests

```shell
# only test
$ yarn test

# test watch
$ yarn test:watch
```

#### Deploy npm package

You can deploy package with:

```shell
$ npm run deploy [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

This should run the following steps:

  - Check if not tracked commits in git
  - Run tests with `npm test`
  - Upgrade version in `package.json`, commit and add tag
  - Publish package in npmjs.com

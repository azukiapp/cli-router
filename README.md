# cli-router

[![NPM](https://nodei.co/npm/cli-router.png)](https://nodei.co/npm/cli-router/)

A simple Cli router to Controllers

## Install with [npm](https://www.npmjs.com/package/cli-router)

```shell
$ npm install --save cli-router
```

## Usage

Example of binary usage:

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
var Cli = require('cli-router').Cli;
var cli = new Cli({
  // Caminho para o arquivo de usage (seguindo o padrão do docopt.
  path: path.join(__dirname, `usage.txt`),
  // Diretório onde estão os controladores
  controllers_root: path.join(__dirname, "controllers")
});

cli
  .route('help', function(p, args) { return p.help || p['--help'] || args.length <= 0 })
  .route('version', function(p) { return p.version || p['--version'] })
  .route('now', null, function() { return (new Date()).toString(); });
  .route('hello');

// passa os argumentos para o cli-router executar
var result = cli.run({ argv: process.argv.slice(2) });
console.log(result);
```

- `controllers/hello.js`

```javascript
// Used ES6 JS
var CliController = require('cli-router').CliController;
class Hello extends CliController {
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
    var usage = super.index(params, cli);
    usage = this.colorizeSections(params, usage);
    console.log(usage);
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

## CONTRIBUTING

- Install/Update dependencies:

    ```shell
    $ npm install --save-dev azk-dev
    $ gulp editor:config
    $ gulp babel:runtime:install
    $ npm install
    ```

- Commit

    ```shell
    $ git add .
    $ git commit -m 'Updated azk-dev.'
    ```

## azk-dev

Show all gulp tasks:

```shell
$ gulp help
```

#### Tests

```shell
# default (lint + test, no watch)
$ gulp lint test

# test + lint + watch
$ gulp watch:lint:test

# test + watch (no-lint)
$ gulp watch:test
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

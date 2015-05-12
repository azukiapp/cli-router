# cli-router

[![NPM](https://nodei.co/npm/cli-router.png)](https://nodei.co/npm/cli-router/)

A simple Cli router to Controllers

## Install with [npm](https://www.npmjs.com/package/cli-router)

```shell
$ npm install --save cli-router
```

## Usage

Example of binary usage:

```javascript
#!/usr/bin/env node
var path = require('path');

var Cli = require('../lib/src').Cli;
var cli = new Cli({ path: path.join(__dirname, 'usage.txt') });

var result = cli.run({
  argv: process.argv.slice(2),
  version: '2.0'
}, {
  // ui: {},
  cwd: process.cwd()
});

console.log(result);
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

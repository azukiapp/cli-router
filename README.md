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

Check for examples in `./examples` folder;

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

## License

"Azuki", "azk" and the Azuki logo are copyright (c) 2013-2017 Azuki Serviços de Internet LTDA.

**azk** source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

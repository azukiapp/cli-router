import { CliRouter } from './cli_router';

var fs   = require('fs');

var Docopt = require('docopt');

export class Cli {
  constructor(options) {
    if (typeof options !== 'object') {
      throw Error('Undefined or invalid `options`');
    } else if (options.path) {
      this.usage_doc = fs.readFileSync(options.path).toString();
    } else if (!!options.usage_doc) {
      this.usage_doc = options.usage_doc;
    }

    this.router   = new CliRouter(options.controllers_root || './controllers');
    this._version = options.version;
  }

  get help() {
    return this.usage_doc;
  }

  get version() {
    return this._version;
  }

  set version(v) {
    this._version = v;
    return true;
  }

  docopt(opts = {}) {
    opts.version = opts.version || this.version;
    return Docopt.docopt(this.usage_doc, opts);
  }

  route(...args) {
    this.router.add(...args);
    return this;
  }

  get routes() {
    return this.router.routes;
  }

  run(args, opts) {
    if (Array.isArray(args) || typeof args === 'string') {
      args = { argv: args };
    }
    var result = this.docopt(args);

    if (typeof result !== 'string') {
      result = this.router.run(result, opts);
    }

    return result;
  }
}

import fs from 'fs';
import R from 'ramda';
import Docopt from 'docopt';

import { Router } from './router';

export class Cli {
  constructor(options) {
    if (typeof options !== 'object') {
      throw Error('Undefined or invalid `options`');
    } else if (options.path) {
      this.usage_doc = fs.readFileSync(options.path).toString();
    } else if (options.usage_doc) {
      this.usage_doc = options.usage_doc;
    }

    this.router   = new Router(options.controllers_root || './controllers');
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

  run(args, opts, obj) {
    if (R.is(Array, args) || R.is(String, args)) {
      args = { argv: args };
    }
    args.argv = R.flatten([ args.argv ]);
    var result = this.docopt(args);
    if (typeof result !== 'string') {
      opts = R.merge(opts, { default_params: result });
      result = this.router.run(args.argv, opts, (obj || this));
    }

    return result;
  }
}

export { Cli as default };

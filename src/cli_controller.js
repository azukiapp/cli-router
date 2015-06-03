var R    = require('ramda');

export class CliController {
  constructor(opts = {}) {
    Object.keys(opts).forEach((key) => {
      if (opts.hasOwnProperty(key)) {
        this[key] = opts[key];
      }
    });
  }

  index() {
    throw new Error("Don't use CliController directly, implemente the index action.");
  }

  run_action(action_name, ...args) {
    if (R.isNil(action_name) || !R.is(Function, this[action_name])) {
      args.unshift(action_name);
      action_name = 'index';
    }
    return this.before_action(action_name, ...args);
  }

  before_action(action_name, ...args) {
    var action_result = this[action_name].apply(this, args);
    return this.after_action(action_name, action_result, ...args);
  }

  after_action(action_name, action_result) {
    return action_result;
  }
}

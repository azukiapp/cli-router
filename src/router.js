import R from 'ramda';
import path from 'path';

export class Router {
  constructor(controllers_root) {
    this.controllers_root = controllers_root || './';

    this.routes = [];
    // https://regex101.com/r/fM4pO5/3
    this.param_regex = /^(?:[-_]{1,2})|^<|>$/gm;
  }

  add(name, filter, controller) {
    if (R.isNil(name)) {
      throw new Error('Route name not defined');
    }
    controller = controller || name;
    var actions = [];
    var fn;
    if (R.is(Function, controller)) {
      fn = controller;
      controller = undefined;
    } else if (/\./.test(controller)) {
      actions = controller.split('.');
      controller = actions.shift(0, 1);
    }
    filter = filter || controller || name;

    var route = { name, controller, actions, filter, fn };
    this.routes.push(route);
    return this;
  }

  find(args, params) {
    if (!R.is(Object, params)) {
      throw new Error(`Invalid type '${typeof params}' of arguments to filter: ${params}`);
    }
    var route;
    for (var i = 0; i < this.routes.length; i++) {
      route = this.routes[i];
      if (this.applyFilter(route, args, params)) {
        break;
      }
    }
    return route;
  }

  applyFilter(route, args, params) {
    var filter = route.filter;
    if (!R.is(Function, filter)) {
      filter = (p) => p[route.filter];
    }
    return !!filter(params, args);
  }

  loadController(pathname) {
    const file = path.join(this.controllers_root, pathname);
    const Controller = require(file);
    if (!R.is(Function, Controller) && Controller.hasOwnProperty('default')) {
      return Controller.default;
    }
    return Controller;
  }

  getFn(route, args, params={}) {
    if (!R.is(Object, route) ||
      (R.is(Object, route) && R.isNil(route.controller) && R.isNil(route.fn))
    ) {
      throw new Error(`Invalid route or not contain controller or fn methods: ${route}`);
    }
    route = R.clone(route);

    var fn;
    if (!R.isNil(route.controller)) {
      var actions = this.parseActions(route.actions, args, params.default_params);
      route.actions = R.clone(actions);

      if (!route.hasOwnProperty('Controller')) {
        route.Controller = this.loadController(route.controller);
      }
      params = R.merge(params, {
        name: route.name,
        route,
      });
      var obj_to_call = new (route.Controller)(params);
      var action      = actions.pop();
      var methods     = actions.slice(0);
      var method;
      while (!R.isEmpty(methods)) {
        method      = methods.shift();
        obj_to_call = obj_to_call[method];
      }
      fn = (...args) => {
        return obj_to_call.run_action.apply(obj_to_call, [action, ...args]);
      };
    } else if (!R.isNil(route.fn)) {
      fn = (...args) => {
        return route.fn.apply(params, args);
      };
    }
    return fn;
  }

  parseActions(actions, args, params) {
    var filter = (value) => {
      return R.is(String, value) || (R.is(Array, value) && !R.isEmpty(value));
    };
    var values = R.filter(filter, R.uniq(R.flatten(R.values(params))));

    args    = R.filter((arg) => !R.contains(arg)(values), args);
    args    = this._camelCase(args.slice(1));
    actions = this._camelCase(actions);
    actions = R.unionWith((a, b) => a === b, actions, args);
    actions = !R.isEmpty(actions) ? actions : ['index'];
    return actions;
  }

  cleanArgs(args, default_params) {
    var inverted = R.invert(default_params);
    var remove_arguments = (arg) => {
      var value = R.head(inverted[arg] || []) || '';
      if (!(arg.match(this.param_regex) || value.match(this.param_regex))) {
        return arg;
      }
    };
    var end_index = args.indexOf('--');
    if (end_index === -1) { end_index = args.length; }
    var no_doubledash_args = args.slice(0, end_index);
    args = R.filter((arg) => !R.isNil(arg), R.map(remove_arguments, no_doubledash_args));
    return [args, this.cleanParams(default_params), this.normalizeParams(default_params)];
  }

  // DEPRECATED - It will be replaced by normalization (this.normalizeParams)
  cleanParams(default_params) {
    var params = {};
    for (var key in default_params) {
      var value = default_params[key];
      if (key === '--') {
        key = '__doubledash';
      } else {
        key = key.replace(this.param_regex, '');
      }
      params[key] = value;
    }
    return params;
  }

  normalizeParams(default_params) {
    var params = {
      arguments: {},
      options  : {},
      commands : {},
    };
    var keys = Object.keys(default_params);
    while (!R.isEmpty(keys)) {
      var key = keys.shift();
      var value = default_params[key];

      // https://regex101.com/r/bZ2uB1/2
      var argument = /<(\S*?)>/ig.exec(key);
      // https://regex101.com/r/iG4fH2/2
      var option = /[^\w][-]{1,2}([\w-_]*)/ig.exec(key);

      if (argument) {
        key = argument[1];
        params.arguments[key] = value;
      } else if (option) {
        key = (key === '--') ? '__doubledash' : option[1];
        params.options[key] = value;
      } else {
        params.commands[key] = value;
      }
    }
    return params;
  }

  // https://github.com/substack/camelize/blob/master/index.js#L17-L21
  _camelCase(str) {
    if (R.is(Array, str)) {
      return R.map((action) => this._camelCase(action), str);
    }
    if (!R.isNil(str)) {
      str = str.replace(/[_.-](\w|$)/g, function (_, x) {
        return x.toUpperCase();
      });
    }
    return str;
  }

  run(args, opts, obj) {
    if (!(opts.hasOwnProperty('default_params') && R.is(Object, opts.default_params))) {
      opts = { default_params: opts };
    }
    var [cargs, params, normalized_params] = this.cleanArgs(args, opts.default_params);
    var route = this.find(args, opts.default_params);

    opts = R.merge(opts, { args, params, normalized_params });
    var fn = this.getFn(route, cargs, opts);

    if (R.is(Function, fn)) {
      return fn(params, (obj || this));
    }
  }
}

var R    = require('ramda');
var path = require('path');

export class CliRouter {
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
    return require(path.join(this.controllers_root, pathname));
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
      // Force camelcase actions
      var camelCases = (arr) => {
        return R.map((action) => this._camelCase(action), arr || []);
      };
      var actions = R.unionWith((a, b) => a === b, camelCases(route.actions), camelCases(args.slice(1)));
      actions = !R.isEmpty(actions) ? actions : ['index'];
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
      fn = route.fn;
    }
    return fn;
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
    return [args, this.cleanParams(default_params)];
  }

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

  // https://github.com/substack/camelize/blob/master/index.js#L17-L21
  _camelCase(str) {
    if (!R.isNil(str)) {
      str = str.replace(/[_.-](\w|$)/g, function (_, x) {
        return x.toUpperCase();
      });
    }
    return str;
  }

  run(args, default_params, obj) {
    var [cargs, params] = this.cleanArgs(args, default_params);
    var route = this.find(args, default_params);
    var fn    = this.getFn(route, cargs, { args, params, default_params });

    if (R.is(Function, fn)) {
      return fn(params, (obj || this));
    }
  }
}

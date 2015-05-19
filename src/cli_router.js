import Router from 'i40';

var R    = require('ramda');
var path = require('path');

export class CliRouter {
  constructor(controllers_root, route_regex) {
    route_regex = route_regex || '/:controller/:action?';
    this.controllers_root = controllers_root || './';

    var rule = Router.Route(route_regex, 0);

    this.route_rules      = [ rule ];
    this.routes           = [];
    this.controller_names = [];
    // https://regex101.com/r/fM4pO5/2
    this.param_regex = /^(?:[-_]{2})|^<|>$/gm;
  }

  add(pathname, controller, startAt) {
    var route = Router.match(this.route_rules, pathname, startAt);

    if (route) {
      var controller_name = route.params.controller;
      if (!R.isNil(controller_name) && !R.contains(controller_name)(this.controller_names)) {
        this.controller_names.push(controller_name);
      }

      controller = controller || pathname;

      if (typeof controller === 'string') {
        route.Controller = controller;
      } else if (typeof controller === 'function') {
        route.fn = controller;
      } else {
        throw new Error(' route ' + pathname.toString() + ' requires a `controller`');
      }

      this.routes.push(route);
    } else {
      throw new Error(' invalid route ' + pathname.toString());

    }
    return this;
  }

  match(pathname, startAt) {
    var params = Router.match(this.route_rules, pathname, startAt);
    return params;
  }

  loadController(pathname) {
    return require(path.join(this.controllers_root, pathname));
  }

  findRoute(controller, action) {
    var routes = [];
    for (var i = 0; i < this.routes.length; i++) {
      if (this.routes[i].params.controller == controller &&
        this.routes[i].params.action == action ) {
        routes.push(this.routes[i]);
      }
    }
    return R.last(routes);
  }

  findRouteByParams(params) {
    var route = this.findRoute(params.controller, params.action);
    if (!route) {
      route = this.findRoute(params.controller);
    }

    return route;
  }

  getFn(controller, opts={}) {
    controller = controller || {};
    var route = controller.route;

    if (!R.is(Object, route) || !R.is(Object, route.params)) { return; }
    var fn;
    var params = route.params;
    // Force camelcase actions
    params.action = this._camelCase(params.action);

    if (route.hasOwnProperty('Controller')) {
      if (R.is(String, route.Controller)) {
        route.Controller = this.loadController(route.Controller);
      }
      opts = R.merge(opts, {
        name     : params.controller,
        route,
        params,
        args     : controller.args,
        full_args: controller.full_args,
      });
      var obj = new (route.Controller)(opts);
      fn = (...args) => {
        return obj.run_action.apply(obj, [params.action, ...args]);
      };
    } else if (route.hasOwnProperty('fn')) {
      fn = route.fn;
    }
    return fn;
  }

  extractCommands(args) {
    var cmds = [];
    for (var i = 0; i < this.controller_names.length; i++) {
      var controller_name = this.controller_names[i];
      if (args.hasOwnProperty(controller_name) && !!args[controller_name]) {
        cmds.push(controller_name);
      }
    }
    // Filter commands and actions (do not start with "-" or between "<>")
    R.mapObjIndexed((v, k) => {
      if (R.isNil(k.match(this.param_regex)) && !!v) {
        cmds.push(k);
      }
    }, args);
    return R.uniq(cmds);
  }

  cleanArgs(full_args) {
    var args = {};
    for (var key in full_args) {
      var value = full_args[key];
      if (key === '--') {
        key = '__doubledash';
      } else {
        key = key.replace(this.param_regex, '');
      }
      args[key] = value;
    }
    return args;
  }

  controller(full_args) {
    var route = {};
    var cmds = this.extractCommands(full_args);

    if (!R.isNil(cmds) && !R.isEmpty(cmds)) {
      var match = this.match(`/${cmds.join('/')}/`);
      if (R.is(Object, match)) {
        route = this.findRouteByParams(match.params);
        route = R.merge(route, match);
      }
    }

    var args = this.cleanArgs(full_args);
    return { route, params: route.params, args, full_args };
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

  run(args, opts, obj) {
    var controller = this.controller(args);
    var fn         = this.getFn(controller, opts);
    if (R.is(Function, fn)) {
      return fn(controller.args, (obj || this));
    }
  }
}

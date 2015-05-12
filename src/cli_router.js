import { Route, match } from 'i40';

var R    = require('ramda');
var path = require('path');

export class CliRouter {
  constructor(controllers_root, route_regex) {
    route_regex = route_regex || '/:controller/:action?';
    this.controllers_root = controllers_root || './';

    var rule = Route(route_regex, 0);

    this.route_rules      = [ rule ];
    this.routes           = [];
    this.controller_names = [];
  }

  add(pathname, controller, startAt) {
    var route = match(this.route_rules, pathname, startAt);

    if (route) {
      var controller_name = route.params.controller;
      if (!R.isNil(controller_name) && !R.contains(controller_name)(this.controller_names)) {
        this.controller_names.push(controller_name);
      }

      controller = controller || pathname;

      if (typeof controller === 'string') {
        route.Controller = this.loadController(pathname, controller);
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
    var params = match(this.route_rules, pathname, startAt);
    return params;
  }

  loadController(pathname) {
    try { return require(path.join(this.controllers_root, pathname)); } catch (e) { }
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

  getFn(route, params, opts) {
    if (!R.is(Object, route) || !R.is(Object, params)) { return; }
    var fn;

    if (route.hasOwnProperty('Controller')) {
      var controller = new route.Controller(opts);
      fn = controller[params.action] || controller.index;
    } else if (route.hasOwnProperty('fn')) {
      fn = route.fn;
    }
    return fn;
  }

  exatractCommads(args) {
    var cmds = [];
    for (var i = 0; i < this.controller_names.length; i++) {
      var controller_name = this.controller_names[i];
      if (args.hasOwnProperty(controller_name) && !!args[controller_name]) {
        cmds.push(controller_name);
      }
    }
    cmds = R.uniq(R.concat(cmds, (R.invert(args).true || [])));

    return cmds;
  }

  run(args, opts) {
    var cmds = this.exatractCommads(args);

    if (!R.isNil(cmds) && !R.isEmpty(cmds)) {
      var url    = `/${cmds.join('/')}/`;
      var params = this.match(url).params;
      var route  = this.findRouteByParams(params);
      var fn     = this.getFn(route, params, opts);

      if (R.is(Function, fn)) {
        return fn(args);
      }
    }
  }
}

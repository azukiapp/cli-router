import { Route } from 'i40';

var path = require('path');

export class CliRouter {
  constructor(controllers_root) {
    this.controllers_root = controllers_root || './';
    this.routes          = [];
    this.routeMap        = [];
  }

  add(path, controller) {
    if (!path) { throw new Error(' route requires a path'); }

    var route = Route(path, this.routeMap.length);
    route.Controller = this.getController(path, controller);

    this.routes.push(route);
    this.routeMap.push([path, route.Controller]);

    return this;
  }

  getController(route_path, controller) {
    controller = controller || route_path;

    if (typeof controller === 'string') {
      controller = this.loadController(route_path);
    } else if (typeof controller !== 'function') {
      controller = null;
    }

    if (!controller) { throw new Error(' route ' + route_path.toString() + ' requires a `controller`'); }

    return controller;
  }

  controllerPath(route_path) {
    return path.join(this.controllers_root, route_path);
  }

  loadController(route_path) {
    route_path = this.controllerPath(route_path);

    try { return require(route_path); } catch (e) { }
  }

  run(opts, cwd) {
    console.log('opts:', opts);
    console.log('cwd:', cwd);
  }
}

import h from './spec-helper';
import { CliRouter } from '../src/cli_router';

var R    = require('ramda');
var path = require('path');

describe('CliRouter module', function() {
  var controllers_root = h.fixture_require_path('controllers');
  var controller_opts = {
    cwd: process.cwd()
  };

  it('shoud ordered src of routes', function() {
    var cli_router = new CliRouter(controllers_root)
      .add('/agent', () => {})
      .add('/agent/stop', () => {})
      .add('/start', () => {})
      .add('/stop' , () => {});

    h.expect(cli_router.routes[0].params).to.eql({ controller: 'agent', action: undefined });
    h.expect(cli_router.routes[1].params).to.eql({ controller: 'agent', action: 'stop' });
    h.expect(cli_router.routes[2].params).to.eql({ controller: 'start', action: undefined });
    h.expect(cli_router.routes[3].params).to.eql({ controller: 'stop' , action: undefined });
  });

  it('should route with agent controller', function() {
    var action     = '/agent';
    var cli_router = new CliRouter(controllers_root)
      .add(action);

    var params = cli_router.match(action).params;
    var route  = cli_router.findRouteByParams(params);

    h.expect(route).to.have.deep.property('Controller');
    h.expect(route).to.have.deep.property('params.controller', 'agent');
    h.expect(route).to.have.deep.property('params.action', undefined);
  });

  it('should route with agent controller and start action', function() {
    var action     = '/agent/start';
    var cli_router = new CliRouter(controllers_root)
      .add(action);

    var params = cli_router.match(action).params;
    var route  = cli_router.findRouteByParams(params);

    h.expect(route).to.have.deep.property('params.controller', 'agent');
    h.expect(route).to.have.deep.property('params.action', 'start');
  });

  it('should fn result of route /agent', function() {
    var action     = '/agent';
    var cli_router = new CliRouter(controllers_root)
      .add(action);

    var Controller = require(path.join(controllers_root, action));
    var controller = new Controller();
    var params     = cli_router.match(action).params;
    var route      = cli_router.findRouteByParams(params);
    var result     = cli_router.getFn(route, params)();

    h.expect(result).to.eql(controller.index());
  });

  describe('run with options', function () {
    var should_options = {
      '--': false,
      '--help': false,
      '--log': false,
      '--no-daemon': false,
      '--open': false,
      '--quiet': false,
      '--rebuild': false,
      '--reload-vm': false,
      '--reprovision': false,
      '--verbose': 0,
      '--version': false,
      '<ssh-options>': [],
      '<system>': null,
      '<to>': null,
      agent: false,
      help: false,
      remove: false,
      scale: false,
      ssh: false,
      start: false,
      status: false,
      stop: false,
      vm: false
    };

    it('should run `agent start demo`', function() {
      var options = R.merge(should_options, {
        agent: true,
        start: true,
        '<system>': 'demo'
      });
      var cli_router = new CliRouter(controllers_root)
        .add('/agent')
        .add('/start', () => 'start');

      var result = cli_router.run(options, controller_opts);

      h.expect(result).to.eql('agent start demo');
    });

    it('should run `agent start` with function', function() {
      var options = R.merge(should_options, {
        agent: true,
        start: true
      });
      var cli_router = new CliRouter(controllers_root)
        .add('/agent')
        .add('/agent/start', () => 'agent no start')
        .add('/start', () => 'start');

      var result = cli_router.run(options, controller_opts);
      h.expect(result).to.eql('agent no start');
    });

    it('should run `system start` with function', function() {
      var options = R.merge(should_options, {
        system: true,
        start: true,
      });
      var cli_router = new CliRouter(controllers_root)
        .add('/system')
        .add('/system/start', () => 'system start')
        .add('/start', () => 'start');

      var result = cli_router.run(options, controller_opts);
      h.expect(result).to.eql('system start');
    });
  });

  describe('should extracted cmds', function () {
    var action = '/agent';
    var cli_router = new CliRouter(controllers_root)
      .add(action);

    it('from args without options', function() {
      var args = { '--': false,
        '--no-daemon': false,
        '--quiet': false,
        '--verbose': 0,
        '--version': false,
        agent: true,
        ssh: false,
        start: true,
        vm: false
      };
      h.expect(cli_router.extractCommands(args)).to.eql(['agent', 'start']);
    });

    it('from args with multiple options', function() {
      var args = { '--': false,
        '--no-daemon': true,
        '--quiet': false,
        '--verbose': 0,
        '--version': true,
        agent: true,
        ssh: false,
        start: true,
        vm: false
      };
      h.expect(cli_router.extractCommands(args)).to.eql(['agent', 'start']);
    });
  });
});

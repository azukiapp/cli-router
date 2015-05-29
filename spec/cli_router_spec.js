import h from './spec-helper';
import { CliRouter } from '../src/cli_router';

var path = require('path');

describe('CliRouter module', function() {
  var controllers_root = h.fixture_require_path('controllers');
  var controller_opts = {
    cwd: process.cwd()
  };

  var cli_router = new CliRouter(controllers_root)
    .add('help', (p) => p.help || p['--help'])
    .add('agent_start', (p, args) => p.agent && args[1] === 'start', 'agent.start')
    .add('agent')
    .add('start', null, (params={}) => `start ${params.system}`)
    .add('vm');

  describe('should ordered routes and check', function () {
    it('controller', function() {
      h.expect(cli_router.routes[0]).to.have.property('controller', 'help');
      h.expect(cli_router.routes[1]).to.have.property('controller', 'agent');
      h.expect(cli_router.routes[2]).to.have.property('controller', 'agent');
      h.expect(cli_router.routes[3]).to.have.property('controller', undefined);
    });

    it('actions', function() {
      h.expect(cli_router.routes[0].actions).to.deep.eql([]);
      h.expect(cli_router.routes[1].actions).to.deep.eql(['start']);
      h.expect(cli_router.routes[2].actions).to.deep.eql([]);
      h.expect(cli_router.routes[3].actions).to.deep.eql([]);
    });

    it('fn', function() {
      h.expect(cli_router.routes[0].fn).to.deep.eql(undefined);
      h.expect(cli_router.routes[1].fn).to.deep.eql(undefined);
      h.expect(cli_router.routes[2].fn).to.deep.eql(undefined);
      h.expect(cli_router.routes[3].fn()).to.deep.eql((() => 'start undefined')());
    });
  });

  describe('should find route', function () {
    it('agent to `agent` command', function() {
      var command = 'agent';
      var args    = [ command ];
      var params  = {};
      params[command] = true;
      var route  = cli_router.find(args, params);

      h.expect(route).to.have.deep.property('name', command);
      h.expect(route).to.have.deep.property('controller', command);
      h.expect(route.actions).to.have.deep.eql([]);
    });

    it('agent_start to `agent start` command', function() {
      var command = 'agent';
      var args    = [ command, 'start' ];
      var params  = { start: true };
      params[command] = true;
      var route  = cli_router.find(args, params);

      h.expect(route).to.have.deep.property('name', 'agent_start');
      h.expect(route).to.have.deep.property('controller', command);
      h.expect(route.actions).to.have.deep.eql(['start']);
    });

    it('help to `help` command', function() {
      var command = 'help';
      var args    = [ command ];
      var params  = {};
      params[command] = true;
      var route  = cli_router.find(args, params);

      h.expect(route).to.have.deep.property('name', command);
      h.expect(route).to.have.deep.property('controller', command);
      h.expect(route.actions).to.have.deep.eql([]);
    });

    it('help to `agent --help` command', function() {
      var command = 'agent';
      var args    = [ command, '--help' ];
      var params  = { '--help': true };
      params[command]   = true;
      var route  = cli_router.find(args, params);

      h.expect(route).to.have.deep.property('name', 'help');
      h.expect(route).to.have.deep.property('controller', 'help');
      h.expect(route.actions).to.have.deep.eql([]);
    });

    it('agent and get fn to `agent` command', function() {
      var command = 'agent';
      var args    = [ command ];
      var params  = {};
      params[command] = true;
      var route  = cli_router.find(args, params);

      var Controller = require(path.join(controllers_root, command));
      var obj    = new Controller();
      var result = cli_router.getFn(route, args, { params })();

      h.expect(result).to.eql(obj.index());
    });

    it('agent and call sub fn to `agent subagent subcommand` command', function() {
      var command = 'agent';
      var args    = [ command, 'subagent', 'subcommand' ];
      var params  = {
        subagent: true,
        subcommand: true
      };
      params[command] = true;
      var route  = cli_router.find(args, params);

      var Controller = require(path.join(controllers_root, command));
      var obj    = new Controller();
      var result = cli_router.getFn(route, args, { params })();

      h.expect(result).to.eql(obj.subagent.subcommand());
    });
  });

  describe('should run', function () {
    it('`agent stop demo`', function() {
      var args   = [ 'agent', 'stop', 'demo' ];
      var params = {
        agent: true,
        stop: true,
        '<system>': 'demo'
      };

      var result = cli_router.run(args, params, controller_opts);
      h.expect(result).to.eql('agent stop demo');
    });

    it('`agent start demo -v`', function() {
      var args   = [ 'agent', 'start', 'demo', '-v' ];
      var params = {
        agent: true,
        start: true,
        '<system>': 'demo',
        '--verbose': true
      };

      var result = cli_router.run(args, params, controller_opts);
      h.expect(result).to.eql('agent start demo');
    });

    it('`start old -f`', function() {
      var args   = [ 'start', 'old', '-f' ];
      var params = {
        start: true,
        '<system>': 'old',
        '--force': true
      };

      var result = cli_router.run(args, params, controller_opts);
      h.expect(result).to.eql('start old');
    });

    it('`vm ssh -- echo terminal`', function() {
      var args = ['vm', 'ssh', '--', 'echo', 'terminal'];
      var params = {
        vm: true,
        ssh: true,
        '<ssh-options>': ['echo', 'terminal'],
      };

      var result = cli_router.run(args, params, controller_opts);
      h.expect(result).to.eql('echo terminal');
    });
  });
});

import h from './spec-helper';
import { CliRouter } from '../src/cli_router';

var path = require('path');

describe('CliRouter module', function() {
  var controllers_root = h.fixture_require_path('controllers');

  it('shoud ordered src of routes', function() {
    var cli_router = new CliRouter(controllers_root)
      .add('/agent', () => {})
      .add('/start', () => {})
      .add('/stop' , () => {});

    h.expect(cli_router.routes[0].src).to.eql('/agent');
    h.expect(cli_router.routes[1].src).to.eql('/start');
    h.expect(cli_router.routes[2].src).to.eql('/stop');
  });

  it('sould controller path to /agent', function() {
    var action          = '/agent';
    var cli_router      = new CliRouter(controllers_root);
    var controller_path = cli_router.controllerPath(action);
    h.expect(controller_path).to.eql(path.join(controllers_root, action));
  });
});

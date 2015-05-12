import { CliController } from '../../../src/cli_controller';

class Agent extends CliController {
  constructor(...args) {
    super(...args);
  }

  index() {
    return 'agent';
  }

  start(params={}) {
    var system = params['<system>'];
    return `agent start ${system}`;
  }

  stop() {
    return 'agent stop';
  }
}

module.exports = Agent;

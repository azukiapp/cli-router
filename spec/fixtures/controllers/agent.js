import { CliController } from '../../../src/cli_controller';

class Agent extends CliController {
  index() {
    return 'agent';
  }

  start(params={}) {
    return `agent start ${params.system}`;
  }

  stop() {
    return 'agent stop';
  }
}

module.exports = Agent;

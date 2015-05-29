import { CliController } from '../../../src/cli_controller';

class SubAgent extends CliController {
  subcommand() {
    return 'subcommand';
  }
}

class Agent extends CliController {
  constructor(...args) {
    super(...args);
    this.subagent = new SubAgent();
  }

  index() {
    return 'agent';
  }

  start(params={}) {
    return `agent start ${params.system}`;
  }

  stop(params={}) {
    return `agent stop ${params.system}`;
  }
}

module.exports = Agent;

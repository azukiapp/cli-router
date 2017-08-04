import { Controller } from '../../../src/controller';

class SubAgent extends Controller {
  subcommand() {
    return 'subcommand';
  }
}

class Agent extends Controller {
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

import { Controller } from '../controllers';

class Agent extends Controller {
  constructor(...args) {
    super(...args);
  }

  index() {
    return 'agent';
  }

  start(opts={}) {
    var system = opts['<system>'];
    return `agent start ${system}`;
  }

  stop() {
    return 'agent stop';
  }
}

module.exports = Agent;

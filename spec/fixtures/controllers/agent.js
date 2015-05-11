import { Controller } from '../controllers';

class Agent extends Controller {
  constructor(...args) {
    super(...args);
  }

  index() {
    return 'agent';
  }
}

module.exports = Agent;

import { Controller } from '../../../src/controller';

class VM extends Controller {
  ssh(params={}) {
    return params['ssh-options'].join(' ');
  }
}

module.exports = VM;

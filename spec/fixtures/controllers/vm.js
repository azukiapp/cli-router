import { CliController } from '../../../src/cli_controller';

class VM extends CliController {
  ssh(params={}) {
    return params['ssh-options'].join(' ');
  }
}

module.exports = VM;

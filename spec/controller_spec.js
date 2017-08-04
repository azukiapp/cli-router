import h from './spec-helper';

import { Controller } from '../src/controller';

describe('Controller module', function() {
  it('should call hooks before and after run action', function() {
    class BeforeAndAfterController extends Controller {
      index(args) {
        return args[0];
      }

      before_action(action, args) {
        args.unshift('before');
        return super.before_action(action, args);
      }

      after_action(action, result) {
        return super.after_action(action, `${result} and after`);
      }
    }

    var controller = new BeforeAndAfterController();
    var result     = controller.run_action('index', ['not show this']);
    h.expect(result).to.eql('before and after');
  });
});

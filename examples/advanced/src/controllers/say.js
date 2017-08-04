import { Controller } from '../../../..';

export default class SayController extends Controller {
  index(params, _cli) {
    console.log(`Hello ${params['name']}`); // eslint-disable-line no-console
    return 1;
  }
}

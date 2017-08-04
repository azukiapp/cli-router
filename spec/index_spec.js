import h from './spec-helper';

import Cli from '../src/cli';
import CliDefault, { Cli as CliVar } from '../src';

import { Controller as CliControllerOriginal } from '../src/controller';
import { CliController, Controller } from '../src';

import { Help as HelpControllerOriginal } from '../src/controllers/help';
import { HelpController } from '../src';

import * as CliControllersOriginal from '../src/controllers';
import { CliControllers, Controllers } from '../src';


describe('export module', function () {
  it('same exports', function() {
    h.expect(CliDefault).to.equal(Cli);
    h.expect(CliDefault).to.equal(CliVar);

    h.expect(CliController).to.equal(CliControllerOriginal);
    h.expect(Controller).to.equal(CliControllerOriginal);

    h.expect(CliControllers).to.equal(CliControllersOriginal);
    h.expect(Controllers).to.equal(CliControllersOriginal);

    h.expect(HelpController).to.equal(HelpControllerOriginal);
  });
});

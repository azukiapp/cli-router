import path from 'path';
import chai from 'chai';

// Chai extensions
chai.use(require('chai-subset'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true;

var Helpers = {
  expect : chai.expect,

  fixture_path(...fixture) {
    return path.resolve(
      '.', 'spec', 'fixtures', ...fixture
    );
  },

  fixture_require_path(...fixture) {
    return path.resolve(
      '.', 'lib', 'spec', 'fixtures', ...fixture
    );
  },
};

export default Helpers;
export { chai };

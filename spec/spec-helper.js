var path = require('path');

var Helpers = {
  expect : require('azk-dev/chai').expect,

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

import h from './spec-helper';

import { Cli } from '../src';

class TestCli extends Cli {
  docopt(...args) {
    try {
      return super.docopt(...args);
    } catch (e) {
      return e.message;
    }
  }
}

describe('Cli module', function() {
  describe('simple usage', function () {
    var cli_options = {
      path: h.fixture_path('usage.txt')
    };
    var doc_opts = { exit: false };

    describe('without version', function () {
      var cli = new TestCli(cli_options);

      it('show options', function() {
        doc_opts.argv = '--version';
        var options = cli.run(doc_opts);

        h.expect(options).to.have.property("--version", true);
      });
    });

    describe('with version', function() {
      cli_options.version = require('../../package.json').version;
      var cli = new TestCli(cli_options);

      it('without args', function() {
        doc_opts.argv = [];
        var options = cli.run(doc_opts);

        h.expect(options).to.eql({
          '--help': false,
          '--version': false,
          help: false,
        });
      });

      it('should show --help', function() {
        doc_opts.argv = '--help';
        var output  = cli.run(doc_opts);

        h.expect(output).to.eql(cli.help);
      });

      it('should show cli version', function() {
        doc_opts.argv = '--version';
        var options = cli.docopt(doc_opts);

        h.expect(options).to.eql(`${cli.version}`);
      });
    });
  });

  describe('full usage', function () {
    var cli_options = {
      path: h.fixture_path('usage_full.txt')
    };

    it('should route /agent', function() {
      var cli = new TestCli(cli_options)
        .route('/agent', () => {});
      h.expect(cli.routes[0].src).to.eql('/agent');
    });
  });
});

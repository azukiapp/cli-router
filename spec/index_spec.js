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
  var cwd = process.cwd();
  var cli_options = {
    controllers_root: h.fixture_require_path('controllers')
  };

  describe('simple usage', function () {
    cli_options.path = h.fixture_path('usage.txt');
    var doc_opts = { exit: false };

    describe('without version', function () {
      var cli = new TestCli(cli_options);

      it('show options', function() {
        doc_opts.argv = '--version';

        var options = cli.docopt(doc_opts);
        var result  = cli.run(doc_opts);

        h.expect(options).to.have.property("--version", true);
        h.expect(result).to.eql(undefined);
      });
    });

    describe('with version', function() {
      cli_options.version = '0.0.1';
      var cli = new TestCli(cli_options);

      it('show version', function() {
        doc_opts.argv = '--version';

        var options = cli.docopt(doc_opts);
        var result  = cli.run(doc_opts);

        h.expect(options).to.eql("0.0.1");
        h.expect(result).to.eql('0.0.1');
      });

      it('without args', function() {
        doc_opts.argv = [];
        var options = cli.docopt(doc_opts);
        var result  = cli.run(doc_opts);

        h.expect(options).to.eql({
          '--help': false,
          '--version': false,
          help: false,
        });
        h.expect(result).to.eql(undefined);
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
    cli_options.path = h.fixture_path('usage_full.txt');

    var doc_opts = { exit: false };

    it('should route /agent', function() {
      var cli = new TestCli(cli_options)
        .route('/agent');

      doc_opts.argv = ['agent', 'start'];
      var result  = cli.run(doc_opts, cwd);

      h.expect(cli.routes[0].params).to.eql({ controller: 'agent', action: undefined });
      h.expect(result).to.eql('agent start null');
    });
  });
});

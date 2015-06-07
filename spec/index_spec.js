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
  var cli_options = {
    controllers_root: h.fixture_require_path('controllers')
  };
  var controller_opts = {
    cwd: process.cwd()
  };

  describe('simple usage', function () {
    cli_options.path = h.fixture_path('usage.txt');
    var cli      = new TestCli(cli_options);
    var doc_opts = { exit: false };

    describe('without version', function () {
      it('show options', function() {
        doc_opts.argv = '--version';

        var options = cli.docopt(doc_opts);
        var result = () => cli.run(doc_opts);

        h.expect(options).to.have.property("--version", true);
        h.expect(result).to.throw(Error, /Invalid route/);
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
        var result = () => cli.run(doc_opts);

        h.expect(options).to.eql({
          '--help': false,
          '--version': false,
          help: false,
        });
        h.expect(result).to.throw(Error, /Invalid route/);
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
    var cli = new TestCli(cli_options)
      .route('agent');

    var doc_opts = { exit: false };

    it('should route agent', function() {
      doc_opts.argv = ['agent', 'start'];
      var result  = cli.run(doc_opts, controller_opts);

      h.expect(cli.routes[0]).to.have.property('controller', 'agent');
      h.expect(cli.routes[0].actions).to.deep.eql([]);
      h.expect(cli.routes[0].fn).to.deep.eql(undefined);
      h.expect(result).to.eql('agent start null');
    });

    it('should -- and shell-args without system', function() {
      doc_opts.argv = ['shell', '--', 'echo', 'test'];
      var result  = cli.docopt(doc_opts, controller_opts);

      h.expect(result).to.have.property('<system>', null);
      h.expect(result).to.have.property('--', true);
      h.expect(result).to.have.property('<shell-args>').deep.eql(['echo', 'test']);
    });
  });
});

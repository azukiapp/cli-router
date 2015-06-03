import h from '../spec-helper';
import { Cli as RootCli } from '../../src';
import path from 'path';

class Cli extends RootCli {
  docopt(...args) {
    try {
      return super.docopt(...args);
    } catch (e) {
      return e.message;
    }
  }
}

describe('CliControllers Help', function() {
  var cli_options = {
    path: h.fixture_path('usage_full.txt'),
    controllers_root: path.resolve('.', 'lib', 'src', 'controllers')
  };

  var controller_opts = {
    cwd: process.cwd()
  };
  var cli = new Cli(cli_options)
    .route('help', (p) => p.help || p['--help'])
    .route('agent');

  var doc_opts    = { exit: false };

  it("should run help command", function() {
    doc_opts.argv = 'help';
    var options = cli.docopt(doc_opts);
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(options).to.have.property('help', true);
    h.expect(result).to.match(RegExp('Usage:', 'gi'));
  });

  it("should run --help command", function() {
    doc_opts.argv = ['--help'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:', 'gi'));
  });

  it("should run -h command", function() {
    doc_opts.argv = '-h';
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Commands:' , 'gi'));
    h.expect(result).to.match(RegExp('Actions:'  , 'gi'));
    h.expect(result).to.match(RegExp('Arguments:', 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
    h.expect(result).to.match(RegExp('Examples:' , 'gi'));
  });

  it("should run `agent --help` command", function() {
    doc_opts.argv = ['agent', '--help'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Actions:'  , 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
    h.expect(result).to.match(RegExp('Examples:' , 'gi'));
  });

  it("should run `help agent` command", function() {
    doc_opts.argv = ['help', 'agent'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Actions:'  , 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
    h.expect(result).to.match(RegExp('Examples:' , 'gi'));
  });

  it("should run `start --help` command", function() {
    doc_opts.argv = ['start', '--help'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Arguments:', 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
  });

  it("should run `help start` command", function() {
    doc_opts.argv = ['help', 'start'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Arguments:', 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
  });

  it("should run `vm --help` command", function() {
    doc_opts.argv = ['vm', '--help'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Actions:'  , 'gi'));
    h.expect(result).to.match(RegExp('Arguments:', 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
  });

  it("should run `tmp --help` command", function() {
    doc_opts.argv = ['tmp', '--help'];
    var result  = cli.run(doc_opts, controller_opts);

    h.expect(result).to.match(RegExp('Usage:'    , 'gi'));
    h.expect(result).to.match(RegExp('Actions:'  , 'gi'));
    h.expect(result).to.match(RegExp('Arguments:', 'gi'));
    h.expect(result).to.match(RegExp('Options:'  , 'gi'));
  });
});
export class CliController {
  contructor(opts) {
    this.ui  = opts.ui;
    this.cwd = opts.cwd;
  }

  index() {
    throw new Error("Don't use CliController directly, implemente the index action.");
  }
}

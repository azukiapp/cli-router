export class CliController {
  constructor(opts = {}) {
    Object.keys(opts).forEach((key) => {
      if (opts.hasOwnProperty(key)) {
        this[key] = opts[key];
      }
    });
  }

  index() {
    throw new Error("Don't use CliController directly, implemente the index action.");
  }
}

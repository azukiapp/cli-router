import { HelpController } from '../../../..';

export default class Controller extends HelpController {
  index(params, cli) {
    let usage = super.usage(params, cli);
    console.log(this.colorizeSections(params, usage)); // eslint-disable-line no-console
    return 0;
  }

  colorizeSections(params, usage) {
    this.sections.forEach(function(section) {
      var regex = new RegExp(`^(${section}:)`, 'gmi');
      usage = usage.replace(regex, '\u001b[34m$1\u001b[39m');
    });

    return usage;
  }
}

import { Controller } from '../controller';
import R from 'ramda';
import Docopt from 'docopt';

export default class Help extends Controller {
  get sections() {
    return ['usage', 'commands', 'actions', 'arguments', 'options', 'examples'];
  }

  usage(params, cli) {
    var usage = '';
    if (!R.is(Object, cli)) { return 1; }
    if (R.is(String, cli.help)) {
      usage = R.clone(cli.help);
    }

    this.param_regex = cli.router.param_regex;
    var args = R.filter((arg) => arg !== 'help' && !arg.match(this.param_regex), this.args);

    var controller = R.head(args);
    if (controller) {
      usage = this.controllerUsage(controller, usage);
    }
    return usage;
  }

  controllerUsage(controller, full_usage) {
    var usage = this.parseCommandUsage('usage', controller, full_usage);

    // not searched a usage show all
    if (R.isNil(usage)) { return full_usage; }

    var patterns = this.usagePatterns(controller, usage);
    var title    = this.parseCommandTitle(controller, full_usage);

    var sections = R.mapObjIndexed((pattern, section) => {
      return this.parseCommandSection(controller, section, pattern, full_usage);
    }, patterns);
    sections = R.values(sections);
    sections.push(this.parseCommandUsage('examples', controller, full_usage));
    sections = [
      `  ${title}`,
      usage,
      ...R.filter((v) => !(R.isNil(v) || R.isEmpty(v)), sections)
    ];

    sections = `\n${sections.join('\n\n')}\n`;
    return sections;
  }

  parseCommandTitle(controller, usage) {
    var section = Docopt.parse_section('commands:', usage);
    // https://regex101.com/r/xB7aQ9/2
    var regex   = new RegExp(`^  ${controller}[ ]*(.*)`, 'gmi');
    var matches = regex.exec(section);
    return matches && matches[1];
  }

  usagePatterns(controller, usage) {
    // https://regex101.com/r/eG0wX2/2
    var regex = new RegExp(`^  [^ ]* (${controller}|(?:\\(|[^\\(]*\\|)?${controller}(?:.*\\)|.*\\|)?).*`, 'gmi');
    var match = regex.exec(usage);
    if (R.is(Array, match) && match[1]) {
      usage = usage.replace(`${match[1]}`, '');
    }
    usage = Docopt.formal_usage(usage);
    var pattern = Docopt.parse_pattern(usage, []);
    return {
      actions  : R.uniq(R.pluck('name')(pattern.flat(Docopt.Command))),
      arguments: R.uniq(R.map((o) => o.name.replace(this.param_regex, ''), pattern.flat(Docopt.Argument))),
      options  : R.uniq(R.pluck('name')(pattern.flat(Docopt.Option  ))),
    };
  }

  parseCommandSection(controller, section_name, patterns, usage) {
    var section = Docopt.parse_section(`${section_name}:`, usage) || [];
    section = R.head(section) || '';

    var matches = R.map((pattern) => {
      // https://regex101.com/r/tE2wV6/2
      var regex = new RegExp(`^(  (?:.*,.*|)${pattern}(?:  |[,=]).*)`, 'gmi');
      return section.match(regex);
    }, R.flatten([patterns]));
    matches = R.filter((v) => !R.isNil(v), R.flatten(matches));
    if (matches.length > 0) {
      var regex = new RegExp(`^${section_name}:`, 'gmi');
      var title = section.match(regex) || [];
      matches = title.concat(R.flatten(matches));
    }

    return matches.join('\n');
  }

  parseCommandUsage(section_name, controller, usage) {
    var section = Docopt.parse_section(section_name, usage);
    section = R.head(section) || '';
    // https://regex101.com/r/W8Hjq1/2
    var regex = new RegExp(`^([^ ].*|  \\w{1,}\\s{1,}[\\<\\(]?${controller}.*)`, 'gmi');
    var match = section.match(regex);
    return R.is(Array, match) && match.length > 1 ? (match).join('\r\n') : null;
  }
}

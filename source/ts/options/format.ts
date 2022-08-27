import 'chance';

import {Option} from './option';
import {Tile} from '../tile';
import {TileGenerator} from '../tile-generator';

/// Formats a string with values selected from other `Option`s.
export class Format extends Option {
  /// The inner options that are used to fill in the format string.
  private readonly options: Option[];

  constructor(private readonly format: string, ...options: Option[]) {
    super();
    this.options = options;
  }

  build(rng: Chance.Chance): TileGenerator {
    return new (class {
      private readonly generators: TileGenerator[];

      constructor(private readonly option: Format) {
        this.generators = option.options.map(option => option.build(rng));
      }

      select(): Tile | null {
        let text = this.option.format;
        for (const [i, generator] of this.generators.entries()) {
          // Allow the option format to specify the same number multiple
          // times to select different values from the options.
          const occurrences = text.split(`{${i}}`).length - 1;
          for (let j = 0; j < occurrences; j++) {
            const choice = generator.select();
            if (!choice) return null;
            text = text.replace(`{${i}}`, choice.text);
          }
        }
        return {text};
      }

      toString(): string {
        return this.option.toString();
      }
    })(this);
  }

  toString() {
    return `F(${JSON.stringify(this.format)}, ${this.options})`;
  }
}

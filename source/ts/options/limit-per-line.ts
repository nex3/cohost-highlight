import 'chance';

import {Option} from './option';
import {Tile} from '../tile';
import {TileGenerator} from '../tile-generator';

/// A special wrapper option that limits the options its wrapped to appearing only N times in a
/// single line on the Bingo board.
export class LimitPerLine extends Option {
  /// The next ID to use to distinguish between multiple `LimitPerLine`s in the same set of
  /// options.
  private static nextId = 0;

  /// The ID that identifies this particular group of line-limited tiles.
  private readonly id = LimitPerLine.nextId++;

  constructor(private readonly limit: number, private readonly option: Option) {
    super();
  }

  build(rng: Chance.Chance): TileGenerator {
    return new (class {
      /// The inner generator.
      private readonly generator: TileGenerator;

      constructor(private readonly option: LimitPerLine) {
        this.generator = option.option.build(rng);
      }

      get weight(): number | undefined {
        return this.generator.weight;
      }

      select(): Tile | null {
        const result = this.generator.select();
        if (!result) return null;
        (result.limitsPerLine ??= {})[this.option.id] = this.option.limit;
        return result;
      }

      toString(): string {
        return this.option.toString();
      }
    })(this);
  }

  toString() {
    return `LimitPerLine(${this.limit}, ${this.option})`;
  }
}

import 'chance';

import {Option} from './option';
import {Tile} from '../tile';
import {TileGenerator} from '../tile-generator';
import {Unique} from './unique';

/// Wraps another option and gives it a specific weight. Can take multiple
/// weights, which are used in order as more items are selected.
export class Weight extends Option {
  /// The weights to use for this option, in the order they should be used. The last weight in the
  /// list is used repeatedly.
  private readonly weights: number[];

  /// The inner option whose weight is being modified.
  private readonly option: Option;

  constructor(weights: number | number[], option: Option | string | number) {
    super();
    this.weights = weights instanceof Array ? weights : [weights];
    this.option = Unique.wrap(option);
  }

  build(rng: Chance.Chance): TileGenerator {
    return new (class {
      /// The inner generator.
      private readonly generator: TileGenerator;

      private readonly weights: number[];

      constructor(private readonly option: Weight) {
        this.generator = option.option.build(rng);
        this.weights = [...option.weights];
      }

      get weight(): number {
        return this.weights[0];
      }

      select(): Tile | null {
        if (this.weights.length > 0) this.weights.shift();
        return this.generator.select();
      }

      toString(): string {
        return this.option.toString();
      }
    })(this);
  }

  toString() {
    return `W(${this.weights}, ${this.option})`;
  }
}

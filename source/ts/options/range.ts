import 'chance';

import {Option} from './option';
import {Tile} from '../tile';
import {TileGenerator} from '../tile-generator';

/// An option that returns a random integer once within a given minimum and maximum (inclusive).
export class Range extends Option {
  constructor(private readonly min: number, private readonly max: number) {
    super();
  }

  build(rng: Chance.Chance): TileGenerator {
    return new (class {
      /// Whether `select()` has been called yet.
      private done = false;

      constructor(private readonly option: Range) {}

      select(): Tile | null {
        if (this.done) return null;
        this.done = true;
        return {text: `${rng.integer({min: this.option.min, max: this.option.max})}`};
      }

      toString(): string {
        return this.option.toString();
      }
    })(this);
  }

  toString() {
    return `R(${this.min}, ${this.max})`;
  }
}

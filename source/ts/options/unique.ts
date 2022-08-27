import {Option} from './option';
import {Tile} from '../tile';
import {TileGenerator} from '../tile-generator';

/// A single bingo option that can be selected exactly once. This doesn't need
/// to be instantiated manually, since `new Select()` will automatically
/// translate plain strings into `Unique` options.
export class Unique extends Option {
  /// Converts a `string` or `number` to a `Unique`, or returns an `Option` as-is.
  static wrap(item: Option | string | number): Option {
    return item instanceof Option ? item : new Unique(item.toString());
  }

  constructor(private readonly value: string) {
    super();
  }

  build(): TileGenerator {
    return new (class {
      /// Whether `select()` has been called yet.
      private done = false;

      constructor(private readonly option: Unique) {}

      select(): Tile | null {
        if (this.done) return null;
        this.done = true;
        return {text: this.option.value};
      }

      toString(): string {
        return this.option.toString();
      }
    })(this);
  }

  toString() {
    return JSON.stringify(this.value);
  }
}

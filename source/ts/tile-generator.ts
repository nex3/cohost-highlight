import {Tile} from './tile';

/// A mutable generator object that returns a new bingo tile every time `select()` is called, until
/// it's no longer able to at which point it returns `null`.
export interface TileGenerator {
  /// An optional weight that's used to determine the relative likelihood of this generator being
  /// selected among several options. Defaults to 100.
  weight?: number;

  /// Either returns a newly-generated bingo tile, or returns `null` to indicate that the bingo
  /// tile
  select(): Tile | null;
}

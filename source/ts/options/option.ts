import 'chance';

import {TileGenerator} from '../tile-generator';

/// The abstract base class of various ways of describing bingo options.
///
/// Option classes are immutable. When it's time to generate squares for a new board, the `build()`
/// method is called to return a mutable generator that can track state over time (for example, to
/// ensure the same option isn't selected more than once).
export abstract class Option {
  /// Returns a generator object given a random number generator.
  abstract build(rng: Chance.Chance): TileGenerator;
}

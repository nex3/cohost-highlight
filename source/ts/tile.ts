/// A single generated bingo tile.
export interface Tile {
  /// The text to display on the bingo tile.
  text: string;

  /// Each key/value pair in this record indicates a restriction on how often a set of tiles can
  /// appear in a single line. The key is an opaque ID, and the value indicates how many tiles
  /// with that ID can appear on the same line.
  limitsPerLine?: Record<string, number>;
}

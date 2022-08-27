import {Chance} from 'chance';

import {TileState} from './tile-state';
import {Option} from './options';
import {Tile} from './tile';

/// A set of indices comprising a single horizontal, vertical or diagonal line on the bingo board.
type Line = [number, number, number, number, number];

/// A single bingo board.
export class Bingo {
  /// The random number generator used to choose bingo options.
  private readonly rng: Chance.Chance;

  /// The set of tiles generated for this bingo board. Only set once `generate()` has been called.
  private tiles?: Tile[];

  constructor(private readonly option: Option, seed?: number) {
    this.option = option;
    if (seed === undefined) {
      this.rng = new Chance.Chance();
    } else {
      this.rng = new Chance(seed);
    }
  }

  /// Returns the bingo tiles in a format accepted by bingosync.com. Must be called after
  /// `generate()`.
  getGoalString(): string {
    return JSON.stringify(this.tiles!.map(tile => ({name: tile.text})));
  }

  /// Writes the contents of `tiles` to the `#bingo-table` table. Must be called after
  /// `generate()`.
  writeToBoard() {
    const table = document.getElementById('bingo-table') as HTMLTableElement;
    for (let i = 0; i < 5; ++i) {
      const row = table.rows[i];
      for (let k = 0; k < 5; ++k) {
        const col = row.cells[k];
        col.innerText = this.tiles![i + 5 * k].text;
      }
    }
    this.addListeners();
  }

  /// Generates a fresh bingo board.
  generate(): void {
    this.tiles = [];
    const generator = this.option.build(this.rng);
    for (let i = 0; i < 5; ++i) {
      for (let k = 0; k < 5; ++k) {
        this.tiles.push(generator.select()!);
      }
    }
    this.rng.shuffle(this.tiles);
    this.ensureLimitPerLine();
  }

  /// Swaps tiles to ensure that `LimitPerLine` restrictions aren't violated.
  ensureLimitPerLine(): void {
    // Check each line and makes a random swap if any of them have too many three-max options.
    // Do this up to 30 times before giving up and regenerating the entire board.
    for (let i = 0; i < 30; i++) {
      if (!this.checkLine(row(0))) continue;
      if (!this.checkLine(row(1))) continue;
      if (!this.checkLine(row(2))) continue;
      if (!this.checkLine(row(3))) continue;
      if (!this.checkLine(row(4))) continue;
      if (!this.checkLine(column(0))) continue;
      if (!this.checkLine(column(1))) continue;
      if (!this.checkLine(column(2))) continue;
      if (!this.checkLine(column(3))) continue;
      if (!this.checkLine(column(4))) continue;
      if (!this.checkLine([0, 6, 12, 18, 24])) continue;
      if (!this.checkLine([4, 8, 12, 16, 20])) continue;

      // Once we get here, we've ensured that all lines in the bingo board have three or fewer
      // ThreeMaxInALine options.
      return;
    }

    this.generate();
  }

  /// Checks a single line of tiles to see if they violate `LimitPerLine`, and swaps one out if it
  /// does. Returns whether or not a swap was made.
  private checkLine(line: Line): boolean {
    // A map from `LimitPerLine` IDs to information about those limits, including the indices of
    // all tiles in `line` that  have a limit for that ID.
    const limitedTilesById: Record<string, {id: string; limit: number; limitedTiles: number[]}> =
      {};
    for (const i of line) {
      const limits = this.tiles![i].limitsPerLine;
      if (!limits) continue;
      for (const [id, limit] of Object.entries(limits)) {
        (limitedTilesById[id] ??= {
          id,
          limit,
          limitedTiles: [],
        }).limitedTiles.push(i);
      }
    }

    for (const {id, limit, limitedTiles} of Object.values(limitedTilesById)) {
      if (limitedTiles.length <= limit) continue;

      // Choose an index to swap out.
      const i = this.rng.pickone(limitedTiles);

      // Choose an index to swap in.
      const j = this.rng.pickone(
        [...new Array(25).keys()].filter(
          i => !(this.tiles![i].limitsPerLine ?? {})[id] && !line.includes(i)
        )
      );

      const tmp = this.tiles![j];
      this.tiles![j] = this.tiles![i];
      this.tiles![i] = tmp;
      return false;
    }

    return true;
  }

  /// Adds listeners to the `#bingo-table` element to modify tile colors.
  private addListeners(): void {
    const table = document.getElementById('bingo-table') as HTMLTableElement;

    for (let i = 0; i < 5; ++i) {
      const row = table.rows[i];
      for (let k = 0; k < 5; ++k) {
        const col = row.cells[k];
        const state = new TileState();
        col.onclick = event => {
          const elem = event.target as HTMLTableElement;
          state.increment();
          elem.style.backgroundColor = state.color;
        };
      }
    }
  }
}

/// Return the indices for the nth row of a bingo board.
function row(n: number): Line {
  return [n * 5, n * 5 + 1, n * 5 + 2, n * 5 + 3, n * 5 + 4];
}

/// Return the indices for the nth column of a bingo board.
function column(n: number): Line {
  return [n, 5 + n, 10 + n, 15 + n, 20 + n];
}

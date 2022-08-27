/// The state of a single bingo tile on the board.
export class TileState {
  /// The state number. 0 indicates an unselected tile, 1 a selected tile, and 2 a negated tile.
  private state = 0;

  /// Transitions to the next state.
  increment() {
    this.state = (this.state + 1) % 3;
  }

  /// Returns the name of the color for the current state.
  get color() {
    return ['black', 'green', 'red'][this.state];
  }
}

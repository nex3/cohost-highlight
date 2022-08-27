import {Chance} from 'chance';

import {BingoBoard} from './bingo-board';
import {Option} from './options';
import {options as ds3} from './config/ds3';
import {options as sekiro} from './config/sekiro';

const configs: Record<string, Option> = {sekiro, ds3};

const options = configs[document.body.dataset.bingo as string];
let bingo: BingoBoard | undefined;

/// Creates a new bingo board with the given `rng`.
function setBoard(rng: Chance.Chance): void {
  bingo = new BingoBoard(options, rng);
  bingo.writeToBoard();
}

const seedForm = document.getElementById('seed') as HTMLFormElement;
seedForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = seedForm.querySelector('input[type=number]') as HTMLInputElement;
  setBoard(input.value === '' ? new Chance.Chance() : new Chance.Chance(input.value));
});

const bingosyncButton = document.getElementById('bingosync') as HTMLButtonElement;
bingosyncButton.addEventListener('click', () => {
  if (bingo) navigator.clipboard.writeText(bingo.goalString);
});

document.addEventListener('DOMContentLoaded', () => setBoard(new Chance.Chance()), false);

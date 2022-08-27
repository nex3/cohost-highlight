import {Chance} from 'chance';

import {BingoBoard} from './bingo-board';
import {Option} from './options';
import {options as ds3} from './config/ds3';
import {options as sekiro} from './config/sekiro';

const configs: Record<string, Option> = {sekiro, ds3};

const options = configs[document.body.dataset.bingo as string];

declare global {
  interface Window {
    seed: () => void;
  }
}

window.seed = () => {
  const field = document.getElementById('seed') as HTMLInputElement;
  const text = field.value;
  new BingoBoard(options, new Chance.Chance(parseInt(text))).writeToBoard();
};

document.addEventListener('DOMContentLoaded', () => new BingoBoard(options).writeToBoard(), false);

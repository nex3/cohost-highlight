import {Bingo} from './bingo';
import {Option} from './options';
import {options as ds3} from './config/ds3';
import {options as sekiro} from './config/sekiro';

const configs: Record<string, Option> = {sekiro, ds3};

const options = configs[document.body.dataset.bingo as string];
let bingo = new Bingo(options);
function main() {
  bingo.generate();
  bingo.writeToBoard();
}

declare global {
  interface Window {
    seed: () => void;
  }
}

window.seed = () => {
  const field = document.getElementById('seed') as HTMLInputElement;
  const text = field.value;
  bingo = new Bingo(options, parseInt(text));
  main();
};

document.addEventListener('DOMContentLoaded', main, false);

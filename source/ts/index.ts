import hljs from 'highlightjs';
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';

function debounce<T extends Function>(fn: T, wait = 200): T {
  let timeout = setTimeout(() => {}, 0);
  const callable = (...args: unknown[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
  return callable as unknown as T;
}

const input = document.querySelector('#input') as HTMLElement;
const inputText = new MDCTextField(input.querySelector('.mdc-text-field')!);
const selectLanguage = new MDCSelect(document.querySelector('#select-language')!);
const output = document.querySelector('#output') as HTMLElement;
const outputText = output.querySelector('code') as HTMLElement;

function highlight() {
  const source = inputText.value;
  outputText.innerHTML = (
    selectLanguage.value === 'auto'
      ? hljs.highlightAuto(source)
      : hljs.highlight(selectLanguage.value, source)
  ).value;
}

selectLanguage.listen('MDCSelect:change', highlight);
inputText.listen('input', debounce(highlight));

const selectTheme = new MDCSelect(document.querySelector('#select-theme')!);
selectTheme.listen('MDCSelect:change', () => {
  output.dataset.theme = selectTheme.value;
});

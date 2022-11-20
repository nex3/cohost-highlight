import hljs from 'highlightjs';
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';

function debounce<T extends Function>(fn: T, wait = 200): T {
    let timeout = setTimeout(() => {}, 0);
    let callable = (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
    return callable as unknown as T;
}

const input = document.querySelector("#input") as HTMLElement;
const inputText = new MDCTextField(input.querySelector(".mdc-text-field")!);

const output = document.querySelector("#output") as HTMLElement;
const outputText = output.querySelector("code") as HTMLElement;
inputText.listen('input', debounce(e => {
    const source = (e.target as HTMLInputElement).value;
    outputText.innerHTML = hljs.highlightAuto(source).value;
}));

const selectTheme = new MDCSelect(document.querySelector('#select-theme')!);
selectTheme.listen('MDCSelect:change', () => {
    output.dataset.theme = selectTheme.value;
});
import escapeHtml from 'escape-html';
import hljs from 'highlightjs';
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';
import {MDCRipple} from '@material/ripple';

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
const outputPre = output.querySelector('pre') as HTMLElement;
const outputText = output.querySelector('code') as HTMLElement;

function highlight() {
  const source = inputText.value;
  outputText.innerHTML = (
    selectLanguage.value === 'auto'
      ? hljs.highlightAuto(source)
      : hljs.highlight(selectLanguage.value, source)
  ).value;
  outputText.innerHTML += '<span id="baseline"></span>';
}

selectLanguage.listen('MDCSelect:change', highlight);
inputText.listen('input', debounce(highlight));

const selectTheme = new MDCSelect(document.querySelector('#select-theme')!);
selectTheme.listen('MDCSelect:change', () => {
  output.dataset.theme = selectTheme.value;
});

const allCss = Array.from(document.styleSheets).map(stylesheet => Array.from(stylesheet.cssRules ?? []).filter(rule => rule instanceof CSSStyleRule)  as CSSStyleRule[]).flat();
function getMatchedCSSRules(element: HTMLElement): Set<CSSStyleRule> {
    return new Set(allCss.filter(rule => element.matches(rule.selectorText)));
}

function getStyleDiff(baseline: Set<CSSStyleRule>, element: HTMLElement): string {
    const decls: string[] = [];
    for (const rule of getMatchedCSSRules(element)) {
        if (baseline.has(rule)) continue;
        for (let i =0 ; i < rule.style.length; i ++) {
            const name = rule.style[i];
            const value = rule.style.getPropertyValue(name);
            decls.push(`${name}: ${value}`);
        }
    }
    return decls.join(';');
}

const copyHtml = new MDCRipple(document.querySelector('#copy-html')!);
copyHtml.listen('click', async () => {
    const pre = window.getComputedStyle(outputPre);
    const baseline = getMatchedCSSRules(document.querySelector("#baseline")!);
    const html = `<pre style="
        background-color: ${pre.backgroundColor};
        color: ${pre.color};
    ">` + 
    Array.from(outputText.childNodes).map(child => {
        if (child instanceof Text) return child.nodeValue;
        const span = child as HTMLSpanElement;
        if (span.id === 'baseline') return '';
        return '<span style="' + getStyleDiff(baseline, span) + '">' + escapeHtml(span.innerText) + '</span>';
    }).join('') + '</pre>';
    await navigator.clipboard.writeText(html);
    // this._snackBar.open("HTML copied!", undefined, { duration: 1000 });
})


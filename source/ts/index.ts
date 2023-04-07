import Color from 'colorjs.io';
import escapeHtml from 'escape-html';
import hljs from 'highlightjs';
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCSwitch} from '@material/switch';
import escapeHTML from 'escape-html';

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
const crtSwitch = new MDCSwitch(document.querySelector('#crt-switch')!);

function glowify(): void {
  for (const span of Array.from(outputPre.querySelectorAll('span'))) {
    const style = window.getComputedStyle(span);
    const color = new Color(style.color);
    color.lch.l *= 1.2;
    span.style.textShadow = `0 0 2px ${color.toString({format: 'hex'})}`;
  }
}

function deglowify(): void {
  for (const span of Array.from(outputPre.querySelectorAll('span'))) {
    span.style.textShadow = '';
  }
}

function highlight() {
  const source = inputText.value;
  outputText.innerHTML =
    '<span>' +
    (selectLanguage.value === 'auto'
      ? hljs.highlightAuto(source)
      : hljs.highlight(selectLanguage.value, source)
    ).value +
    '<span id="baseline"></span></span>';

  if (crtSwitch.selected) glowify();
}

selectLanguage.listen('MDCSelect:change', () => {
  window.localStorage.highlightLanguage = selectLanguage.value;
  highlight();
});
crtSwitch.listen('click', () => {
  window.localStorage.highlightCrt = crtSwitch.selected;
  output.dataset.crt = crtSwitch.selected.toString();
  if (crtSwitch.selected) {
    glowify();
  } else {
    deglowify();
  }
});
inputText.listen('input', debounce(highlight));

const title = new MDCTextField(document.querySelector('#title')!);
const label = outputPre.querySelector('.mdc-floating-label') as HTMLElement;
title.listen('input', () => {
  label.innerText = title.value.length === 0 ? 'Highlighted' : title.value;
});

const selectTheme = new MDCSelect(document.querySelector('#select-theme')!);
selectTheme.listen('MDCSelect:change', () => {
  window.localStorage.highlightTheme = selectTheme.value;
  output.dataset.theme = selectTheme.value;
});

const shadowSwitch = new MDCSwitch(document.querySelector('#shadow-switch')!);
shadowSwitch.listen('click', () => {
  window.localStorage.highlightShadow = shadowSwitch.selected;
  output.dataset.shadow = shadowSwitch.selected.toString();
});

const attributionSwitch = new MDCSwitch(document.querySelector('#attribution-switch')!);
const attribution = document.querySelector('#attribution') as HTMLElement;
attributionSwitch.listen('click', () => {
  window.localStorage.highlightAttribution = attributionSwitch.selected;
  output.dataset.attribution = attributionSwitch.selected.toString();
});

const allCss = Array.from(document.styleSheets)
  .map(
    stylesheet =>
      Array.from(stylesheet.cssRules ?? []).filter(
        rule => rule instanceof CSSStyleRule
      ) as CSSStyleRule[]
  )
  .flat();
function getMatchedCSSRules(element: HTMLElement): Set<CSSStyleRule> {
  return new Set(
    allCss.filter(rule => {
      try {
        return element.matches(rule.selectorText);
      } catch {
        /* Sometimes Safari can get scared of its own rule declarations,    *
         * so we should just treat those (and other errors) as non-matching */
        return false;
      }
    })
  );
}

function getStyleDiff(baseline: Set<CSSStyleRule>, element: HTMLElement): string {
  const decls: string[] = [];
  for (const rule of getMatchedCSSRules(element)) {
    if (baseline.has(rule)) continue;
    for (let i = 0; i < rule.style.length; i++) {
      const name = rule.style[i];
      const value = rule.style.getPropertyValue(name);
      decls.push(`${name}: ${value}`);
    }
  }
  if (crtSwitch.selected && element.style.textShadow !== '') {
    decls.push(`text-shadow:${element.style.textShadow}`);
  }
  return decls.join(';');
}

function inlinifyNodes(baseline: Set<CSSStyleRule>, node: ChildNode): string {
  if (node instanceof Text) return escapeHtml(node.nodeValue ?? '');

  const el = node as HTMLElement;
  if (el.id === 'baseline') return '';

  let html = el instanceof HTMLSpanElement ? `<span style="${getStyleDiff(baseline, el)}">` : '';
  for (const child of Array.from(el.childNodes)) {
    html += inlinifyNodes(baseline, child);
  }
  return html + '</span>';
}

const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar')!);
const copyHtml = new MDCRipple(document.querySelector('#copy-html')!);
const crt = document.querySelector('#crt') as HTMLElement;
copyHtml.listen('click', async () => {
  const pre = window.getComputedStyle(outputPre);
  const baseline = getMatchedCSSRules(document.querySelector('#baseline')!);

  let html =
    `<pre style="background-color:${pre.backgroundColor};color:${pre.color};position:relative;` +
    'padding:0;line-height:1.2rem';
  if (attributionSwitch.selected) html += ';margin-bottom:0';
  if (shadowSwitch.selected) html += `;box-shadow:${pre.boxShadow}`;
  html += '">';

  if (crtSwitch.selected) {
    html += crt.outerHTML.replace(' id="crt"', '').replace(/\s+/g, ' ');
  }

  if (title.value.length > 0) {
    html +=
      '<div style="opacity:.8;transform:translateY(-10.25px)scale(0.75);cursor:default;top:19px;' +
      'left:16px;pointer-events:none;position:absolute;transform-origin:left top;' +
      'line-height:1.15rem;fony-family:Atkinson Hyperlegible,ui-sans-serif,system-ui,' +
      '-apple-system,BlinkMacSystemFont,segoe ui,Roboto,helvetica neue,Arial,noto sans,' +
      'sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol,noto color emoji">' +
      `${escapeHTML(title.value)}</div>`;
  }

  html +=
    '<code style="padding:0 16px;display:block;margin-bottom:9px;' +
    `margin-top:${title.value.length === 0 ? '9px' : '23px'}">` +
    `${inlinifyNodes(baseline, outputText)}</code></pre>`;

  if (attributionSwitch.selected) {
    html += attribution.outerHTML.replace(' id="attribution"', '').replace(/\s+/g, ' ');
  }

  await navigator.clipboard.writeText(html);
  snackbar.open();
});

// Local storage

if (window.localStorage.highlightLanguage) {
  selectLanguage.setValue(window.localStorage.highlightLanguage);
}

if (window.localStorage.highlightTheme) {
  selectTheme.setValue(window.localStorage.highlightTheme);
}

if (window.localStorage.highlightCrt === 'true') {
  crtSwitch.selected = true;
  output.dataset.crt = 'true';
}

if (window.localStorage.highlightShadow === 'true') {
  shadowSwitch.selected = true;
  output.dataset.shadow = 'true';
}

if (window.localStorage.highlightAttribution === 'false') {
  attributionSwitch.selected = false;
  output.dataset.attribution = 'true';
}

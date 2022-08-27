import {Format} from './format';
import {OnlyN} from './only-n';
import {Option} from './option';
import {Range} from './range';
import {Select} from './select';
import {Weight} from './weight';

export {LimitPerLine} from './limit-per-line';
export {Option} from './option';

export function F(format: string, ...options: Option[]): Format {
  return new Format(format, ...options);
}

export function N(n: number, option: Option | Array<Option | string | number>): OnlyN {
  return new OnlyN(n, option);
}

export function O(options: Array<Option | string | number>): Option {
  return new OnlyN(1, new Select(options));
}

export function R(min: number, max: number): Range {
  return new Range(min, max);
}

export function S(options: Array<Option | string | number>): Option {
  return new Select(options);
}

export function W(weight: number | number[], option: Option | string | number): Option {
  return new Weight(weight, option);
}

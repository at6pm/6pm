import type { TextStyle } from 'react-native';

import { fontInstance } from '../../../modules/font-instance';

/** Between a family and its axes in an instance's name: `Literata-Variable#opsz 18,wght 600`. */
const MARK = '#';

const registered = new Map<string, boolean>();

/**
 * A variable family set at `axes` ("'opsz' 32, 'wght' 600"). iOS takes the axes on the text; on
 * Android the family is set at the axes once and drawn by its own name (`modules/font-instance`),
 * because Android before 14 rebuilds the typeface on every draw of text that carries axes.
 */
export function withAxes(family: string, axes: string): TextStyle {
  if (!fontInstance) return { fontFamily: family, fontVariationSettings: axes };
  const name = `${family}${MARK}${axes.replace(/'/g, '').replace(/\s*,\s*/g, ',')}`;
  let ok = registered.get(name);
  if (ok === undefined) {
    ok = fontInstance.register(name, family, axes);
    registered.set(name, ok);
  }
  return ok ? { fontFamily: name } : { fontFamily: family, fontVariationSettings: axes };
}

/** The font file's family a style draws in, without the axes an instance's name carries. */
export function familyOf(style: TextStyle): string | undefined {
  return style.fontFamily?.split(MARK)[0];
}

/** The axes a style sets, on the text or in an instance's name, as `withAxes` takes them. */
export function axesOf(style: TextStyle): string | undefined {
  const own = style.fontVariationSettings;
  if (typeof own === 'string') return own;
  const named = style.fontFamily?.split(MARK)[1];
  return named
    ?.split(',')
    .map((axis) => axis.replace(/^(\S+) /, "'$1' "))
    .join(', ');
}

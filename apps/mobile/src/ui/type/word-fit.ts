import type { TextStyle } from 'react-native';

/**
 * Scripts that are written without spaces between words: iOS breaks a line between any two of
 * their characters, so a break there is not a word cut in half. Thai, Lao, Khmer and Myanmar;
 * Chinese, Japanese and their punctuation; Korean, which iOS also breaks between syllables.
 */
const BREAKS_ANYWHERE_CLASS =
  '[\\u0E00-\\u0EFF\\u1000-\\u109F\\u1780-\\u17FF\\u1100-\\u11FF\\u2E80-\\u9FFF\\uA960-\\uA97F\\uAC00-\\uD7FF\\uF900-\\uFAFF\\uFE30-\\uFE4F\\uFF00-\\uFFEF]';
const BREAKS_ANYWHERE = new RegExp(BREAKS_ANYWHERE_CLASS, 'u');
const BREAKS_ANYWHERE_RUN = new RegExp(`${BREAKS_ANYWHERE_CLASS}+`, 'u');
/** Spaces a line may break at; the no-break ones (U+00A0, U+2007, U+202F) are left out. */
const BREAK_SPACES = new RegExp(
  '[\\t\\n\\r \\u1680\\u2000-\\u2006\\u2008-\\u200B\\u205F\\u3000]+',
  'u',
);
/** A hyphen or dash, which a line may break after. */
const DASHES = new RegExp('[-\\u2010\\u2013\\u2014]', 'gu');

/** A letter, digit or mark of a script that puts spaces between its words. */
function inWord(char: string | undefined): boolean {
  return char !== undefined && /[\p{L}\p{N}\p{M}]/u.test(char) && !BREAKS_ANYWHERE.test(char);
}

/**
 * Whether iOS cut a word in two to lay the lines out: a line that ends inside a word and a next
 * line that goes on with it. A line that ends at a space, a hyphen or a dash broke between words.
 */
export function breaksMidWord(lines: readonly string[]): boolean {
  for (let i = 0; i < lines.length - 1; i++) {
    const end = Array.from(lines[i] ?? '').at(-1);
    const next = Array.from(lines[i + 1] ?? '')[0];
    if (inWord(end) && inWord(next)) return true;
  }
  return false;
}

/**
 * The text's words one to a line, to measure the widest: split where iOS may break a line (a
 * space, after a hyphen or dash), never at a no-break space (U+00A0, U+202F, U+2007), which
 * keeps "Tháng 10" one word. Runs of scripts that break anywhere are left out, as they never need
 * to fit whole.
 */
export function wordsToMeasure(text: string): string {
  return text
    .replace(DASHES, (dash) => `${dash}\n`)
    .split(BREAK_SPACES)
    .flatMap((word) => word.split(BREAKS_ANYWHERE_RUN))
    .filter((word) => word.trim() !== '')
    .join('\n');
}

/**
 * How much to scale text down so a word `wordWidth` wide fits a line `lineWidth` wide, held to
 * `[minScale, 1]`. Nothing measured yet leaves the text as designed.
 */
export function wordFitScale(lineWidth: number, wordWidth: number, minScale: number): number {
  if (lineWidth <= 0 || wordWidth <= 0) return 1;
  return Math.min(1, Math.max(minScale, lineWidth / wordWidth));
}

const SCALED = [
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'paddingTop',
  'paddingBottom',
  'marginTop',
  'marginBottom',
] as const;

/**
 * A text style drawn `scale` times as big: its size, line, tracking and the vertical room `leading`
 * gives it, so a heading shrunk to fit keeps the design's proportions.
 */
export function scaleTextStyle(style: TextStyle, scale: number): TextStyle {
  if (scale === 1) return style;
  const scaled: Record<string, number> = {};
  for (const key of SCALED) {
    const value = style[key];
    if (typeof value === 'number') scaled[key] = value * scale;
  }
  return { ...style, ...scaled };
}

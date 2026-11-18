import type { BankAlertInput } from './bank-alert';

/** Any decimal digit, in any script. */
const DIGIT = /\p{Nd}/u;
/** The longest line kept, and how many: an alert is a sentence or two. */
export const ALERT_NAMING_LINE_MAX = 120;
export const ALERT_NAMING_LINES_MAX = 12;

/** A line cut at spaces into pieces no longer than the most one may be. */
function pieces(line: string): string[] {
  const out: string[] = [];
  let piece = '';
  for (const word of line.split(' ')) {
    const next = piece === '' ? word : `${piece} ${word}`;
    if (next.length <= ALERT_NAMING_LINE_MAX) {
      piece = next;
      continue;
    }
    if (piece !== '') out.push(piece);
    piece = word.slice(0, ALERT_NAMING_LINE_MAX);
  }
  if (piece !== '') out.push(piece);
  return out;
}

/**
 * A bank or wallet alert's words with every number taken out, for naming who was paid when the
 * phone could not: its title, subtitle and body as sentences, each word that holds a digit (an
 * amount, an account, a time, a code) dropped whole. No digit is in what comes back.
 */
export function alertNamingLines(input: BankAlertInput): string[] {
  const lines: string[] = [];
  for (const part of [input.title, input.subtitle, input.body]) {
    const sentences = (part ?? '').normalize('NFC').split(/[\n|]+|(?<=[.!?;])\s+/u);
    for (const sentence of sentences) {
      const words = sentence
        .split(/\s+/u)
        .filter((word) => word !== '' && !DIGIT.test(word))
        .join(' ')
        .replace(/^[\s.,;:!?-]+|[\s.,;:!?-]+$/gu, '');
      // "TK", "GD", "SD" left alone once their numbers are gone say nothing.
      if ((words.match(/\p{L}/gu)?.length ?? 0) < 3) continue;
      for (const piece of pieces(words)) {
        if (!lines.includes(piece)) lines.push(piece);
      }
    }
  }
  return lines.slice(0, ALERT_NAMING_LINES_MAX);
}

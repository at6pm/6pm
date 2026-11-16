import { foldWords } from '../capture/fold-words';
import { merchantKeyOf } from '../capture/merchant-rule';
import type { Money } from '../money/currency';
import { diffDays, type LocalDate } from '../time/local-date';
import { isRequest, personKey, plainWords, REQUEST_NOTE_MAX, type OwedLine } from './owed';

/**
 * Asking to be paid: a request is a strip on Who owes me made without a split, for a client (a
 * person, a shop or a company) and a job. It carries a four-character code that rides in the
 * VietQR transfer note ahead of the job, so the payment finds its strip on its own; when the payer
 * loses the note, the strip is matched by hand. A request is never matched on its amount alone.
 */

/** The letters and digits a code is made from: no 0 or O, no 1 or I, which read alike. */
export const REQUEST_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const REQUEST_CODE_LENGTH = 4;

const DIGITS = /[2-9]/;
const LETTERS = /[A-HJ-NP-Z]/;
const CODE = new RegExp(`^[${REQUEST_CODE_ALPHABET}]{${REQUEST_CODE_LENGTH}}$`);

/**
 * Whether text is a code: four characters of the alphabet, at least one a digit and one a letter,
 * so a code never reads as a word in a transfer note ("TIEN", "CHUY") or as a number.
 */
export function isRequestCode(text: string): boolean {
  return CODE.test(text) && DIGITS.test(text) && LETTERS.test(text);
}

/**
 * A new code, unique among the codes given (the open strips'). `random` returns [0, 1), as
 * `Math.random` does; tests pass their own.
 */
export function requestCode(taken: Iterable<string>, random: () => number = Math.random): string {
  const used = new Set([...taken].map((code) => code.toUpperCase()));
  const pick = () =>
    REQUEST_CODE_ALPHABET[Math.floor(random() * REQUEST_CODE_ALPHABET.length)] ?? 'K';
  // 32^4 codes, a few dozen open at most: a clash is rare, and a fresh draw ends it.
  for (let tries = 0; tries < 10_000; tries += 1) {
    const code = Array.from({ length: REQUEST_CODE_LENGTH }, pick).join('');
    if (isRequestCode(code) && !used.has(code)) return code;
  }
  throw new RangeError('No request code is free');
}

/**
 * The transfer note of a request: the code, then the job, in plain upper-case letters and digits
 * ("K7Q2 MENU QUAN LA"), cut at a word to what a VietQR note holds. The code always survives.
 */
export function requestCodeNote(code: string, job: string | null): string {
  const room = REQUEST_NOTE_MAX - code.length - 1;
  let what = plainWords(job ?? '').toUpperCase();
  if (what.length > room) {
    const cut = what.slice(0, room);
    const space = cut.lastIndexOf(' ');
    what = (space > 0 ? cut.slice(0, space) : cut).trim();
  }
  return [code, what].filter(Boolean).join(' ');
}

/** The words of a transfer note as matched: upper case, no accents, single spaces. */
const noteWords = (text: string) => foldWords(text).toUpperCase().trim();

/**
 * The open request a transfer's words name by its code, or null. A code counts as a word of its
 * own ("… K7Q2 MENU QUAN LA") or glued to the first word of its job where a bank dropped the
 * space ("K7Q2MENU QUAN LA"). Only open requests' codes are looked for.
 */
export function requestByCode<Line extends OwedLine>(
  words: readonly (string | null | undefined)[],
  requests: readonly (Line & { readonly job?: string | null })[],
): Line | null {
  const text = noteWords(words.filter(Boolean).join(' '));
  if (text === '') return null;
  const tokens = new Set(text.split(' '));
  const glued = text.replace(/ /g, '');
  for (const line of requests) {
    const code = line.code?.toUpperCase();
    if (!code || !isRequest(line)) continue;
    if (tokens.has(code)) return line;
    const first = noteWords(plainWords(line.job ?? '')).split(' ')[0] ?? '';
    if (first.length >= 2 && glued.includes(`${code}${first}`)) return line;
  }
  return null;
}

/** What a client holding back tax keeps of a bill: a tenth. */
export const HELD_BACK_SHARE = 0.1;

/**
 * Whether money in is what is left of a strip once a tenth was held back: 5.400.000 for a
 * 6.000.000 strip. Whole đồng either way.
 */
export function landsLessHeldBack(landed: Money, billed: Money): boolean {
  return billed > landed && billed - landed === Math.round(billed * HELD_BACK_SHARE);
}

/** How an open strip fits money in: its amount, or its amount less a tenth held back. */
export type RequestFit = 'amount' | 'heldBack' | null;

export interface RequestCandidate<Line extends OwedLine = OwedLine> {
  readonly line: Line;
  readonly fit: RequestFit;
  /** What the client kept, when the strip fits less a tenth: the strip less the money. */
  readonly heldBack: Money;
}

const oldestFirst = (a: OwedLine, b: OwedLine) =>
  a.day < b.day ? -1 : a.day > b.day ? 1 : a.id < b.id ? -1 : 1;

/**
 * The open strips money in with no code might pay, for "One of these?": strips whose amount is
 * the money, or whose amount less a tenth is (a client holding back 10%), first, the ones of
 * people this sender has paid for before ahead of the rest; then every other open strip, oldest
 * first. Nothing is matched here: the person picks.
 */
export function requestCandidates<Line extends OwedLine>(
  money: { readonly amount: Money; readonly merchant: string },
  lines: readonly Line[],
  payers: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
): RequestCandidate<Line>[] {
  const known = payers.get(merchantKeyOf(money.merchant)) ?? new Set<string>();
  const ofKnown = (line: Line) => {
    const key = personKey(line.name);
    return key !== null && known.has(key) ? 0 : 1;
  };
  const fitOf = (line: Line): RequestFit =>
    line.amount === money.amount
      ? 'amount'
      : landsLessHeldBack(money.amount, line.amount)
        ? 'heldBack'
        : null;
  const all = lines.map((line) => {
    const fit = fitOf(line);
    return { line, fit, heldBack: fit === 'heldBack' ? line.amount - money.amount : 0 };
  });
  const fits = all
    .filter((c) => c.fit !== null)
    .sort((a, b) => ofKnown(a.line) - ofKnown(b.line) || oldestFirst(a.line, b.line));
  const rest = all.filter((c) => c.fit === null).sort((a, b) => oldestFirst(a.line, b.line));
  return [...fits, ...rest];
}

/**
 * Whether the close asks "One of these?" about money in: it carries no code, nobody knows its
 * sender (no place remembered, no strip of theirs open, never paid for anyone), and some work
 * request is open.
 */
export function asksByHand(input: {
  readonly coded: boolean;
  readonly knownSender: boolean;
  readonly lines: readonly OwedLine[];
}): boolean {
  if (input.coded || input.knownSender) return false;
  return input.lines.some((line) => isRequest(line) && line.work === true);
}

/**
 * Who each sender has paid for, from strips money in settled: the sender as the bank printed them
 * ("PHAM THI DIEP"), by merchant key, to the people they paid for ("cô diệp"), by person key.
 */
export function payersOf(
  settled: readonly { readonly name: string | null; readonly payer: string }[],
): ReadonlyMap<string, ReadonlySet<string>> {
  const map = new Map<string, Set<string>>();
  for (const { name, payer } of settled) {
    const sender = merchantKeyOf(payer);
    const person = personKey(name);
    if (sender === '' || person === null) continue;
    map.set(sender, new Set([...(map.get(sender) ?? []), person]));
  }
  return map;
}

/** A strip older than this is offered "Remind". */
export const REMIND_AFTER_DAYS = 14;

/** The tone a reminder is drafted in, by the strip's age: first, a month on, two months on. */
export type ReminderTone = 'first' | 'month' | 'twoMonths';

export function reminderTone(askedOn: LocalDate, today: LocalDate): ReminderTone {
  const age = diffDays(today, askedOn);
  return age >= 60 ? 'twoMonths' : age >= 30 ? 'month' : 'first';
}

/** Whether a strip asked on `askedOn` is old enough to be offered "Remind". */
export function remindOffered(askedOn: LocalDate, today: LocalDate): boolean {
  return diffDays(today, askedOn) > REMIND_AFTER_DAYS;
}

import { foldWords } from '../capture/fold-words';
import { SPLIT_MOST } from '../capture/receipt-split';
import type { Currency, Money } from '../money/currency';
import { diffDays, type LocalDate } from '../time/local-date';
import { encodeVietQR } from '../vietqr/encode-vietqr';
import type { IncomingMoney } from './money-in';

/**
 * Who owes the user what. Splitting a spend keeps only the user's share as the spend (the only
 * part that ever counts); every other share is an owed line: a person (a typed first name, or
 * nobody named), an amount, and the spend it is a share of. A line is open until it is settled:
 *
 * - `payback`: money that came in paid it (the close's "Linh paying back 300k?"), so the number
 *   does not move, as only the user's share counted;
 * - `cash`: paid in cash, kept as a payback of that amount on the day it was said;
 * - `covered`: the user covers it ("I'll cover it"): the share becomes the user's own spending on
 *   the day it is covered, never the spend's own day, so no past close changes.
 */
export type OwedSettled = 'payback' | 'cash' | 'covered';

export interface OwedLine {
  readonly id: string;
  /** The spend this is a share of. */
  readonly spendId: string;
  /** The first name typed for them, as typed; null when the split named nobody. */
  readonly name: string | null;
  readonly amount: Money;
  /** The spend's day: how far back a payback may reach is counted from it. */
  readonly day: LocalDate;
}

/** How far back a friend's payback may reach for a split share with no name on it. */
export const PAYBACK_DAYS = 21;
/** How far back a payback may reach for a line with a name on it. */
export const OWED_NAMED_DAYS = 60;

/** How far back money in may answer this line: further for a named one. */
export function owedWindow(line: Pick<OwedLine, 'name'>): number {
  return personKey(line.name) === null ? PAYBACK_DAYS : OWED_NAMED_DAYS;
}

/** A name as compared: lower case, no accents, single spaces ("Huy ", "huy", "HUY" are one). */
export function personKey(name: string | null | undefined): string | null {
  const folded = foldWords(name ?? '').trim();
  return folded === '' ? null : folded;
}

/** Whether the sender a bank printed ("NGUYEN THU LINH") is the person named ("Linh"). */
export function namesPerson(sender: string, name: string | null): boolean {
  const key = personKey(name);
  if (key === null) return false;
  const words = new Set(foldWords(sender).trim().split(' '));
  return key.split(' ').every((word) => words.has(word));
}

/** A split's shares: the user's own, then each other person's in the order given. */
export interface Split {
  readonly mine: Money;
  readonly others: readonly Money[];
}

const waysOf = (people: number) => Math.min(Math.max(1, Math.round(people)), SPLIT_MOST);

/**
 * A total split `people` ways, the user one of them: every other share is the even share rounded
 * down to a whole step (1.000₫ in Vietnam, where nobody hands over 333.333₫; the minor unit
 * elsewhere), and whatever rounding leaves is the user's, so the shares always add up to the bill.
 */
export function splitEqually(total: Money, people: number, home: Currency): Split {
  const ways = waysOf(people);
  if (ways === 1) return { mine: total, others: [] };
  const unit = home.code === 'VND' ? home.step : 1;
  const each = Math.floor(total / ways / unit) * unit;
  return { mine: total - each * (ways - 1), others: Array.from({ length: ways - 1 }, () => each) };
}

/**
 * A split where each other person's share is said: the user's is what is left. Null when the
 * others come to more than the bill, or a share is not a whole amount above zero.
 */
export function splitByAmount(total: Money, others: readonly Money[]): Split | null {
  if (others.some((x) => !Number.isSafeInteger(x) || x <= 0)) return null;
  const mine = total - others.reduce((a, b) => a + b, 0);
  return mine < 0 ? null : { mine, others: [...others] };
}

/** What money in pays back: one owed line, or every open line of one person when it is their total. */
export interface OwedMatch {
  readonly ids: readonly string[];
  /** The person, as the newest of their lines names them; null for a line with no name. */
  readonly name: string | null;
  /** The spend of the newest line it pays. */
  readonly spendId: string;
}

const inWindow = (line: OwedLine, day: LocalDate) => {
  const back = diffDays(day, line.day);
  return back >= 0 && back <= owedWindow(line);
};

const newestFirst = (a: OwedLine, b: OwedLine) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0);

/**
 * The open owed lines money in pays back, or null. It must be the exact amount of one line, or of
 * every open line one person has in reach (Linh's 300k dinner and 150k Grab, paid as 450k), from
 * the spend's day up to `OWED_NAMED_DAYS` later for a named line, `PAYBACK_DAYS` for one with no
 * name. When the sender is someone with lines open, only their lines are asked about; otherwise
 * any line of that amount is. A line of the sender's wins, then the newest.
 */
export function owedPaybackFor(
  money: Pick<IncomingMoney, 'day' | 'amount' | 'merchant'>,
  lines: readonly OwedLine[],
): OwedMatch | null {
  const sender = lines.filter((line) => namesPerson(money.merchant, line.name));
  const pool = (sender.length > 0 ? sender : lines)
    .filter((line) => inWindow(line, money.day))
    .sort(newestFirst);
  const one = pool.find((line) => line.amount === money.amount);
  if (one) return { ids: [one.id], name: one.name, spendId: one.spendId };
  const people = new Map<string, OwedLine[]>();
  for (const line of pool) {
    const key = personKey(line.name);
    if (key !== null) people.set(key, [...(people.get(key) ?? []), line]);
  }
  for (const group of people.values()) {
    const [newest] = group;
    if (!newest || group.length < 2) continue;
    if (group.reduce((sum, line) => sum + line.amount, 0) !== money.amount) continue;
    return { ids: group.map((line) => line.id), name: newest.name, spendId: newest.spendId };
  }
  return null;
}

/** One person on the owed list: their open lines, newest first, and what they come to. */
export interface OwedPerson {
  /** `personKey` of the name, or the line's own id for a line with no name. */
  readonly key: string;
  readonly name: string | null;
  readonly lines: readonly OwedLine[];
  readonly total: Money;
}

/**
 * The owed list: open lines grouped by person (names compared as `personKey` does), each named
 * as their newest line names them; a line with no name stands alone. Whoever owes most comes
 * first, then the newest.
 */
export function owedByPerson(lines: readonly OwedLine[]): OwedPerson[] {
  const groups = new Map<string, OwedLine[]>();
  for (const line of [...lines].sort(newestFirst)) {
    const key = personKey(line.name) ?? `line:${line.id}`;
    groups.set(key, [...(groups.get(key) ?? []), line]);
  }
  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      name: group[0]?.name ?? null,
      lines: group,
      total: group.reduce((sum, line) => sum + line.amount, 0),
    }))
    .sort(
      (a, b) => b.total - a.total || newestFirst(a.lines[0] as OwedLine, b.lines[0] as OwedLine),
    );
}

/** Everything still owed, over the open lines given. */
export function owedTotal(lines: readonly Pick<OwedLine, 'amount'>[]): Money {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

/**
 * "I'll cover it": the spend the share becomes, the user's own spending on the day it is covered
 * (decided 2026-11-02, decision 4), in the original spend's category and shop.
 */
export function coveredSpend(
  line: Pick<OwedLine, 'amount'>,
  original: { readonly categoryId: string; readonly merchant: string },
  today: LocalDate,
): {
  readonly day: LocalDate;
  readonly amount: Money;
  readonly categoryId: string;
  readonly merchant: string;
} {
  return {
    day: today,
    amount: line.amount,
    categoryId: original.categoryId,
    merchant: original.merchant,
  };
}

/** The most a VietQR transfer note carries here: EMVCo's purpose of transaction (tag 62-08). */
export const REQUEST_NOTE_MAX = 25;

/** Plain letters and digits, accents and đ taken off, case kept, single spaces. */
const ascii = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim();

/**
 * The note on an Ask: "6pm {spend} {name}", in plain letters and digits, since NAPAS transfer
 * notes drop accents and some banks refuse other marks. Long shop names are cut to fit; the name
 * is kept whole when it fits at all.
 */
export function requestNote(spend: string, name: string | null): string {
  const who = ascii(name ?? '');
  const room = REQUEST_NOTE_MAX - '6pm '.length - (who ? who.length + 1 : 0);
  let what = ascii(spend);
  if (room <= 0) what = '';
  else if (what.length > room) {
    const cut = what.slice(0, room);
    const space = cut.lastIndexOf(' ');
    what = (space > 0 ? cut.slice(0, space) : cut).trim();
  }
  return ['6pm', what, who].filter(Boolean).join(' ').slice(0, REQUEST_NOTE_MAX).trim();
}

/** Where the user is paid: kept only on this phone, typed once in Settings › Your day. */
export interface ReceivingAccount {
  /** The bank's id in the catalogue (`findBank`), for its name. */
  readonly bankId: string;
  /** NAPAS BIN of the bank. */
  readonly bin: string;
  readonly account: string;
  /** The name on the account, as the bank prints it ("NGUYEN THU HA"). */
  readonly name: string;
}

/** The account number as typed, spaces and dots taken out. */
export function cleanAccount(typed: string): string {
  return typed.replace(/[\s.-]/g, '');
}

/** The holder's name as banks print it: upper case, no accents. */
export function holderName(typed: string): string {
  return ascii(typed).toUpperCase();
}

/**
 * The VietQR an Ask shows: a one-off transfer of `amount` đồng to the user's own account with the
 * note, for the friend to scan in their own bank app. 6pm moves no money. Null when the account
 * cannot make one (a BIN or number NAPAS would refuse).
 */
export function requestPayload(
  account: Pick<ReceivingAccount, 'bin' | 'account'>,
  amount: Money,
  note: string,
): string | null {
  try {
    return encodeVietQR({ bin: account.bin, account: cleanAccount(account.account), amount, note });
  } catch {
    return null;
  }
}

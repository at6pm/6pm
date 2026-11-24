import type { HeardWords, InboxSpend, InboxUnread } from '../contracts/surfaces';
import { currencyOf, type Currency } from '../money/currency';
import { isVietnameseAlert } from './alert-world';
import { normalizeWorldAlert } from './alert-world-money';
import { printedAmounts, readBankAlertKeys, type PrintedAmount } from './bank-alert';
import { bankOfApp } from './bank-alert-senders';

/**
 * A bank or wallet alert read a second time, by the server's model, when the app brings the
 * alert in. The phone reads every alert first and at once; where 6pm's AI runs on our server the
 * alert's own words then go to it, and what it reads wins over what the phone read.
 *
 * The model never writes a number. The phone marks every amount the alert prints («1: 50.000đ»)
 * and the model answers with a mark's number; the amount saved is the one the phone parsed at
 * that mark. Long runs of digits (an account, a card, a phone number) are dotted out before the
 * words leave the phone.
 */

/** The longest text sent for one alert. */
export const ALERT_READ_TEXT_MAX = 1_500;
/** The longest app name sent. */
export const ALERT_READ_APP_MAX = 80;
/** How many printed amounts one alert may offer; an alert printing more is cut to the first. */
export const ALERT_READ_AMOUNTS_MAX = 8;
/** The longest name taken from a second reading. */
export const ALERT_READ_NAME_MAX = 60;

const PART_MAX = { title: 200, subtitle: 200, body: 1_000 } as const;

/** What the second reader says of one alert. */
export interface AlertReading {
  /** Money that left, money that came in, or no money that moved. */
  readonly moved: 'out' | 'in' | 'none';
  /** The mark of the amount that moved, from 1; 0 when it chose none. */
  readonly amount: number;
  /** Who was paid, or who paid in; empty when the alert names nobody. */
  readonly merchant: string;
}

/** What the phone sends for one alert, and the amounts its marks stand for. */
export interface AlertReadAsk {
  readonly app: string;
  /** Title, subtitle and body, long digit runs dotted out, each amount marked «n: …». */
  readonly text: string;
  /** The marked amounts in order: mark `n` is `amounts[n - 1]`. */
  readonly amounts: readonly PrintedAmount[];
}

/** An account, a card or a phone number written in one piece: nine digits and more in a row. */
const LONG_NUMBER = /\p{Nd}{9,}/gu;
/**
 * The same written in groups with one separator throughout ("0912 345 678", "0912.345.678",
 * "1903-6789-0123-456", a card's four fours). A date and a time never fit: their groups are two
 * digits long.
 */
const GROUPED_NUMBER =
  /(?<![\p{Nd}.,])\p{Nd}{2,4}([ .-])\p{Nd}{3,4}(?:\1\p{Nd}{3,4}){1,3}(?![.,]?\p{Nd})/gu;
/** An amount with its thousands grouped by dots ("1.250.000.000"): never a number to hide. */
const GROUPED_AMOUNT = /^\p{Nd}{1,3}(?:\.\p{Nd}{3})+$/u;
/** The number after an account's or a card's own word, however short ("TK 12345678"). */
const NAMED_NUMBER =
  /((?:^|[\s|(])(?:tk|tài khoản|tai khoan|stk|acct|account|a\/c|thẻ|the|card|sđt|sdt|số điện thoại|so dien thoai)\s*[:：]?\s*(?:số\s*|so\s*)?)(\p{Nd}{5,})/giu;

const digitsIn = (text: string) => text.replace(/\P{Nd}/gu, '').length;
const dotted = (digits: string) => digits.replace(/\p{Nd}/gu, '•');
/** Whether a grouped run is a long number and no amount: nine digits or more in all. */
const hidden = (run: string) => digitsIn(run) >= 9 && !GROUPED_AMOUNT.test(run);

/** The text with every long number dotted out, digit for digit, so nothing else moves. */
export function maskLongNumbers(text: string): string {
  return text
    .replace(LONG_NUMBER, dotted)
    .replace(GROUPED_NUMBER, (run: string) => (hidden(run) ? dotted(run) : run))
    .replace(NAMED_NUMBER, (_, lead: string, digits: string) => lead + dotted(digits));
}

/** Whether a text still holds a long number: what the server turns away. */
export function holdsLongNumber(text: string): boolean {
  return /\p{Nd}{9,}/u.test(text) || (text.match(GROUPED_NUMBER) ?? []).some(hidden);
}

/**
 * What to send for one alert: its words with long numbers dotted out and every printed amount
 * marked. Null when it prints no amount at all, so there is nothing for a reader to point at.
 */
export function alertReadAsk(words: HeardWords, home: Currency): AlertReadAsk | null {
  const part = (value: string, max: number) => value.normalize('NFC').trim().slice(0, max);
  const printed = [
    part(words.title, PART_MAX.title),
    part(words.subtitle, PART_MAX.subtitle),
    part(words.body, PART_MAX.body),
  ]
    .filter((text) => text !== '')
    .join('\n');
  // An alert from abroad has its money written as the phone reads it ("1,234円" as "1,234 JPY").
  const plain = maskLongNumbers(
    isVietnameseAlert(printed, bankOfApp(words.app)) ? printed : normalizeWorldAlert(printed, home),
  );
  const amounts = printedAmounts(plain, home).slice(0, ALERT_READ_AMOUNTS_MAX);
  if (amounts.length === 0) return null;
  let text = '';
  let from = 0;
  amounts.forEach((amount, index) => {
    text += `${plain.slice(from, amount.start)}«${index + 1}: ${plain.slice(amount.start, amount.end)}»`;
    from = amount.end;
  });
  text += plain.slice(from);
  if (text.length > ALERT_READ_TEXT_MAX) return null;
  return { app: part(words.app, ALERT_READ_APP_MAX), text, amounts };
}

/** Minor units of a currency as an exact decimal in its own units: 350 cents is "3.50". */
function decimalOf(minor: number, code: string): string {
  const digits = currencyOf(code).minorDigits;
  return (minor / 10 ** digits).toFixed(digits);
}

/** The amount an item holds, in the currency it was printed in, as minor units. */
function heldAmount(item: InboxSpend, home: Currency): { amount: number; currency: string } | null {
  if (item.foreign) {
    const digits = currencyOf(item.foreign.currency).minorDigits;
    return {
      amount: Math.round(Number(item.foreign.amount) * 10 ** digits),
      currency: item.foreign.currency,
    };
  }
  return item.amount === null ? null : { amount: item.amount, currency: home.code };
}

const sameMoney = (
  a: { readonly amount: number; readonly currency: string },
  b: { readonly amount: number; readonly currency: string },
) => a.amount === b.amount && a.currency === b.currency;

const nameOf = (reading: AlertReading) =>
  reading.merchant.replace(/\s+/gu, ' ').trim().slice(0, ALERT_READ_NAME_MAX);

/**
 * An alert the phone read, as the second reader read it. Its way, the amount it marked and the
 * name it gave win over the phone's; an empty name keeps the phone's. The amount changes only to
 * one the phone parsed at a mark, and only when the phone's own amount is among the marked ones:
 * if it is not, the marks missed something and the phone's amount stays. A reading that says no
 * money moved changes nothing: a row the phone caught is the person's to remove, never dropped
 * unseen. The category is left as it was, for the app to file by the new name.
 */
export function withAlertReading(
  item: InboxSpend,
  reading: AlertReading,
  ask: AlertReadAsk,
  words: HeardWords,
  home: Currency,
): InboxSpend {
  if (reading.moved === 'none' || item.what === 'failed') return item;
  const held = heldAmount(item, home);
  const marked = ask.amounts[reading.amount - 1];
  const known = held !== null && ask.amounts.some((amount) => sameMoney(amount, held));
  const changed = marked !== undefined && (held === null || (known && !sameMoney(marked, held)));
  const { foreign: _foreign, what: _what, ...rest } = item;
  const money: Pick<InboxSpend, 'amount' | 'foreign'> = !changed
    ? { amount: item.amount, ...(item.foreign ? { foreign: item.foreign } : {}) }
    : marked.currency === home.code
      ? { amount: marked.amount }
      : {
          // Priced by the app when it finds the day's rate, as any charge abroad is.
          amount: null,
          foreign: { currency: marked.currency, amount: decimalOf(marked.amount, marked.currency) },
        };
  const name = nameOf(reading);
  const what =
    reading.moved === 'in' ? readBankAlertKeys(alertInput(words, null), home).what : null;
  return {
    ...rest,
    ...money,
    merchant: name === '' ? item.merchant : name,
    categoryId: reading.moved === 'in' ? null : item.categoryId,
    direction: reading.moved,
    ...(what !== null ? { what } : {}),
  };
}

/** A printed time later than this past the clock is a misreading: the alert is from now. */
const FUTURE_SLACK_MS = 5 * 60_000;

/**
 * An alert the phone read no money from, as a caught item once the second reader found money
 * that moved in it. Null when the reading says none did, or marked no amount.
 */
export function spendOfUnreadAlert(
  unread: InboxUnread,
  reading: AlertReading,
  ask: AlertReadAsk,
  home: Currency,
): InboxSpend | null {
  const marked = ask.amounts[reading.amount - 1];
  if (reading.moved === 'none' || marked === undefined) return null;
  const seen = new Date(unread.at);
  const handed = unread.date ? new Date(unread.date) : null;
  const delivered =
    handed !== null &&
    !Number.isNaN(handed.getTime()) &&
    handed.getTime() <= seen.getTime() + FUTURE_SLACK_MS;
  const keys = readBankAlertKeys(alertInput(unread.alertWords, unread.date), home);
  const abroad = marked.currency !== home.code;
  return {
    v: 1,
    id: unread.id,
    kind: 'spend',
    source: 'alert',
    status: 'caught',
    at: (delivered ? handed : seen).toISOString(),
    amount: abroad ? null : marked.amount,
    ...(home.code === 'VND' ? {} : { currency: home.code }),
    merchant: nameOf(reading),
    categoryId: null,
    ...(abroad
      ? {
          foreign: { currency: marked.currency, amount: decimalOf(marked.amount, marked.currency) },
        }
      : {}),
    ...(unread.bank !== null ? { receipt: { bank: unread.bank, namingLines: [] } } : {}),
    direction: reading.moved,
    ...(reading.moved === 'in' && keys.what !== null ? { what: keys.what } : {}),
    atKind: delivered ? 'delivered' : 'now',
    ...(keys.reference !== null ? { reference: keys.reference } : {}),
  };
}

function alertInput(words: HeardWords, date: string | null) {
  return {
    app: words.app,
    title: words.title,
    subtitle: words.subtitle,
    body: words.body,
    date,
  };
}

export type { PrintedAmount } from './bank-alert';

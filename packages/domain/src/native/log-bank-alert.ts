import { alertNamingLines } from '../capture/alert-naming-lines';
import { heardAlertId } from '../capture/alert-repeat';
import {
  readBankAlert,
  readBankAlertKeys,
  readFailedBankAlert,
  type BankAlertInput,
} from '../capture/bank-alert';
import { HEARD_WORDS_MAX } from '../contracts/heard';
import {
  SURFACES_VERSION,
  type BankAlertResult,
  type HeardWords,
  type InboxSpend,
  type SurfaceContext,
} from '../contracts/surfaces';
import { foreignToHome } from '../travel/home-fx';
import { contextMoney } from './context-money';
import { amountText, fileCategory } from './file-category';
import { decimalOf } from './log-spend';

/** A printed time later than this past the clock is a misreading: the alert is from now. */
const FUTURE_SLACK_MS = 5 * 60_000;

/**
 * Catching a bank or wallet alert from the Shortcuts automation, read on the phone.
 *
 * Money that moved becomes an inbox item with source `alert`, caught for the close, its way
 * (`out` or `in`) kept. Money out is filed like an Apple Pay tap: the merchant's rule, then the
 * words; when the alert names nobody the phone can read, the item keeps the alert's words with
 * every number taken out (`receipt.namingLines`, `payeeSure: false`) for the app to have named.
 * Money in is filed under no category: the close asks what it was. An amount in another
 * currency than home is priced at the app's last rate, or waits for one, as a Wallet tap does.
 * A skipped alert (a code, a failed payment, a promotion, a balance or security notice) leaves
 * no item. Either way `last` says what was read, for Settings to show. The item's id carries the
 * notification's fingerprint (`heardAlertId`, the rest from `id`), so the app knows the same
 * notification caught twice.
 */
export function buildBankAlert(
  input: BankAlertInput,
  context: SurfaceContext | null,
  now: Date,
  id: string,
): BankAlertResult {
  const money = contextMoney(context);
  const { home, format } = money;
  const read = readBankAlert(input, home);
  const seenAt = now.toISOString();
  // The words go no further than this unless the capture log is on.
  const words = context?.keepWords === true ? heardWordsOf(input) : null;
  if (read.kind === 'skipped') {
    const failed = read.reason === 'failed' ? readFailedBankAlert(input, home) : null;
    const voids = failed && failed.currency === home.code ? failed : null;
    // A failed payment's item carries the words itself: one file per notification.
    if (voids) {
      const item = failedItem(input, id, now, read.bank, voids);
      return {
        item: words ? { ...item, words } : item,
        last: {
          v: SURFACES_VERSION,
          at: seenAt,
          bank: read.bank,
          amountText: '',
          skipped: 'failed',
        },
      };
    }
    return {
      item: null,
      last: {
        v: SURFACES_VERSION,
        at: seenAt,
        bank: read.bank,
        amountText: '',
        skipped: read.reason,
      },
      ...(words
        ? {
            heard: {
              v: SURFACES_VERSION,
              id: heardAlertId(input, id),
              kind: 'heard' as const,
              at: seenAt,
              bank: read.bank,
              skipped: read.reason,
              words,
            },
          }
        : {}),
    };
  }
  const keys = readBankAlertKeys(input, home);

  const printedAt = read.at ? new Date(read.at) : null;
  const at = printedAt && printedAt.getTime() <= now.getTime() + FUTURE_SLACK_MS ? printedAt : now;
  const abroad = read.currency !== home.code;
  const printed = abroad ? decimalOf(read.amount, read.currency) : null;
  const rate = abroad ? money.rate(read.currency) : null;
  const priced = printed !== null && rate !== null ? foreignToHome(printed, rate, home) : null;
  const amount = abroad ? (priced !== null && priced > 0 ? priced : null) : read.amount;

  const name = read.counterparty ?? read.memo ?? '';
  const naming = [read.counterparty, read.memo].filter((part) => part !== null).join(' ');
  const category = read.direction === 'out' ? fileCategory(context, name, naming, at) : null;
  const foreign: InboxSpend['foreign'] =
    printed !== null
      ? {
          currency: read.currency,
          amount: printed,
          ...(rate !== null && amount !== null ? { rate } : {}),
        }
      : undefined;
  const shown =
    amount !== null
      ? amountText(format, amount)
      : foreign
        ? money.foreignText(foreign.amount, foreign.currency)
        : format.full(0);
  // Money out whose alert the phone read no payee from carries its words, every number taken
  // out, marked not sure: the app may ask the server who was paid.
  const namingLines =
    read.direction === 'out' && read.counterparty === null ? alertNamingLines(input) : [];
  const receipt: InboxSpend['receipt'] =
    read.bank !== null || read.memo !== null || namingLines.length > 0
      ? {
          ...(read.bank !== null ? { bank: read.bank } : {}),
          namingLines,
          ...(namingLines.length > 0 ? { payeeSure: false } : {}),
          ...(read.memo !== null ? { memo: read.memo } : {}),
        }
      : undefined;
  return {
    item: {
      v: SURFACES_VERSION,
      id: heardAlertId(input, id),
      kind: 'spend',
      source: 'alert',
      status: 'caught',
      at: at.toISOString(),
      amount,
      ...(home.code === 'VND' ? {} : { currency: home.code }),
      merchant: name,
      categoryId: category?.id ?? null,
      ...(foreign ? { foreign } : {}),
      ...(receipt ? { receipt } : {}),
      direction: read.direction,
      ...(read.direction === 'in' && keys.what !== null ? { what: keys.what } : {}),
      atKind: at === printedAt && keys.atKind !== null ? keys.atKind : 'now',
      ...(keys.reference !== null ? { reference: keys.reference } : {}),
      ...(keys.accountTail !== null ? { accountTail: keys.accountTail } : {}),
      ...(words ? { words } : {}),
    },
    last: {
      v: SURFACES_VERSION,
      at: seenAt,
      bank: read.bank,
      amountText: shown,
      direction: read.direction,
    },
  };
}

/** The notification word for word, each part cut to what the inbox file keeps. */
function heardWordsOf(input: BankAlertInput): HeardWords {
  const part = (value: string | null | undefined) => (value ?? '').slice(0, HEARD_WORDS_MAX);
  return {
    app: part(input.app),
    title: part(input.title),
    subtitle: part(input.subtitle),
    body: part(input.body),
  };
}

/**
 * A payment that failed, as an inbox item that only voids the payment it tells of: it never
 * becomes a spend, and the extensions post no notice for it.
 */
function failedItem(
  input: BankAlertInput,
  id: string,
  now: Date,
  bank: string | null,
  failed: { readonly amount: number },
): InboxSpend {
  const keys = readBankAlertKeys(input);
  return {
    v: SURFACES_VERSION,
    id: heardAlertId(input, id),
    kind: 'spend',
    source: 'alert',
    status: 'caught',
    at: now.toISOString(),
    amount: failed.amount,
    merchant: '',
    categoryId: null,
    ...(bank !== null ? { receipt: { bank, namingLines: [] } } : {}),
    direction: 'out',
    what: 'failed',
    atKind: 'now',
    ...(keys.reference !== null ? { reference: keys.reference } : {}),
    ...(keys.accountTail !== null ? { accountTail: keys.accountTail } : {}),
  };
}

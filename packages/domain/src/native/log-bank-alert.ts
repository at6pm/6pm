import { readBankAlert, type BankAlertInput } from '../capture/bank-alert';
import {
  SURFACES_VERSION,
  type BankAlertResult,
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
 * words. Money in is filed under no category: the close asks what it was. An amount in another
 * currency than home is priced at the app's last rate, or waits for one, as a Wallet tap does.
 * A skipped alert (a code, a failed payment, a promotion, a balance or security notice) leaves
 * no item. Either way `last` says what was read, for Settings to show.
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
  if (read.kind === 'skipped') {
    return {
      item: null,
      last: {
        v: SURFACES_VERSION,
        at: seenAt,
        bank: read.bank,
        amountText: '',
        skipped: read.reason,
      },
    };
  }

  const printedAt = read.at ? new Date(read.at) : null;
  const at = printedAt && printedAt.getTime() <= now.getTime() + FUTURE_SLACK_MS ? printedAt : now;
  const abroad = read.currency !== home.code;
  const printed = abroad ? decimalOf(read.amount, read.currency) : null;
  const rate = abroad ? money.rate(read.currency) : null;
  const priced = printed !== null && rate !== null ? foreignToHome(printed, rate, home) : null;
  const amount = abroad ? (priced !== null && priced > 0 ? priced : null) : read.amount;

  const name = read.counterparty ?? read.memo ?? '';
  const words = [read.counterparty, read.memo].filter((part) => part !== null).join(' ');
  const category = read.direction === 'out' ? fileCategory(context, name, words, at) : null;
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
  const receipt: InboxSpend['receipt'] =
    read.bank !== null || read.memo !== null
      ? {
          ...(read.bank !== null ? { bank: read.bank } : {}),
          namingLines: [],
          ...(read.memo !== null ? { memo: read.memo } : {}),
        }
      : undefined;
  return {
    item: {
      v: SURFACES_VERSION,
      id,
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

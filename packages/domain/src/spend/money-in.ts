import { merchantKeyOf } from '../capture/merchant-rule';
import { foldWords } from '../capture/spoken-spend';
import { floorToStep, VND, type Currency, type Money } from '../money/currency';
import type { PayCycle } from '../plan/pay-cycle';
import { diffDays, type LocalDate } from '../time/local-date';
import type { SpendDirection, SpendStatus } from './spend';

/**
 * Money that came in: pay, a gift, a side job, a refund, a friend paying back. It never counts as
 * spending. Until the user says what it was at the close it changes nothing, so the number never
 * flatters the day on a guess; once kept it is one of:
 *
 * - `spread`: added to this cycle's free money, so every day left gets a share,
 * - `saved`: put in a pot or Future you (added to free money and taken out again as a top-up, so
 *   today's number holds and the pot's monthly need falls),
 * - `pay`: the pay the plan already counts as income,
 * - `refund`: a spend given back, so its money returns to the days,
 * - `payback`: someone paying back their share of a split, or a work claim repaid: only the user's
 *   own share ever counted, so the number does not move.
 */
export type MoneyIn = 'spread' | 'saved' | 'pay' | 'refund' | 'payback';

export interface MoneyInRow {
  readonly amount: Money;
  readonly status: SpendStatus;
  readonly direction?: SpendDirection | null | undefined;
  readonly moneyIn?: MoneyIn | null | undefined;
}

/**
 * Whether a row is money in that adds to this cycle's free money: kept, and not the pay the plan
 * already counts nor a payback. Kept with nothing said (confirmed from the Inbox) is spread.
 */
export function addsToFree(row: MoneyInRow): boolean {
  if (row.direction !== 'in' || row.status !== 'kept') return false;
  return row.moneyIn !== 'pay' && row.moneyIn !== 'payback';
}

/** What money in adds to free money, over the rows given (the pay cycle's). */
export function sumMoneyIn(rows: readonly MoneyInRow[]): Money {
  let total = 0;
  for (const row of rows) if (addsToFree(row)) total += row.amount;
  return total;
}

/** Money in at least this share of the plan's income, near payday, is asked about as the pay. */
export const PAY_SHARE = 0.7;
/** How far from payday (either side) the pay may land and still be asked about. */
export const PAY_DAYS = 3;
/** Money in at least this share of the income is a big one: the companion says so. */
export const BIG_SHARE = 0.2;
/** Pay this much above the plan (as a share of it) offers to change the plan. */
export const PLAN_UPDATE_SHARE = 0.05;
/** How far back a refund may reach for the spend it gives back. */
export const REFUND_DAYS = 60;
/** How far back a friend's payback may reach for the split it answers. */
export const PAYBACK_DAYS = 21;
/** How far back a work claim may be repaid. */
export const CLAIM_DAYS = 120;

export interface IncomingMoney {
  readonly day: LocalDate;
  readonly amount: Money;
  /** Who sent it, as read ("Lan Nguyễn", "Shopee"). */
  readonly merchant: string;
  readonly note?: string | null | undefined;
  /** The transfer's own words, as the bank printed them. */
  readonly memo?: string | null | undefined;
  /** What the capture said it was: an email read as a refund says so. */
  readonly hint?: 'refund' | null | undefined;
}

/** Whether money in looks like the pay: most of the planned income, within days of payday. */
export function looksLikePay(
  money: Pick<IncomingMoney, 'day' | 'amount'>,
  income: Money,
  cycle: Pick<PayCycle, 'start' | 'payday'>,
): boolean {
  if (income <= 0 || money.amount < Math.ceil(income * PAY_SHARE)) return false;
  const near = (payday: LocalDate) => Math.abs(diffDays(money.day, payday)) <= PAY_DAYS;
  return near(cycle.start) || near(cycle.payday);
}

/** What pay brought beyond the plan: it is money in of its own, for the user to place. */
export function payExtra(amount: Money, income: Money): Money {
  return income > 0 ? Math.max(0, amount - income) : 0;
}

/** Whether pay above the plan by `extra` is worth offering to make the plan's income. */
export function offersPlanUpdate(extra: Money, income: Money): boolean {
  return income > 0 && extra >= income * PLAN_UPDATE_SHARE;
}

/** Money in this big next to the month's income: the companion notices. */
export function isBigMoneyIn(amount: Money, income: Money): boolean {
  return income > 0 && amount >= income * BIG_SHARE;
}

/** A spend money in may give back: spending, still counted, not already given back. */
export interface GivableSpend {
  readonly id: string;
  readonly day: LocalDate;
  readonly amount: Money;
  readonly merchant: string;
  readonly status: SpendStatus;
  readonly direction?: SpendDirection | null | undefined;
  readonly note?: string | null | undefined;
  readonly forWork?: boolean | undefined;
  /** Already answered by a refund or a payback. */
  readonly givenBack?: boolean | undefined;
}

const REFUND_WORDS = [
  'refund',
  'refunded',
  'reversal',
  'chargeback',
  'hoan tien',
  'hoan tra',
  'tra lai tien',
  'hoan phi',
].map((word) => ` ${word} `);

/** Whether a sender, note or memo says the money is a refund. */
export function namesRefund(text: string): boolean {
  const folded = ` ${foldWords(text)} `;
  return REFUND_WORDS.some((word) => folded.includes(word));
}

function givable(spend: GivableSpend, day: LocalDate, days: number): boolean {
  if (spend.direction === 'in' || spend.givenBack === true) return false;
  if (spend.status !== 'kept' && spend.status !== 'caught') return false;
  const back = diffDays(day, spend.day);
  return back >= 0 && back <= days;
}

function sameShop(a: string, b: string): boolean {
  const x = merchantKeyOf(a);
  const y = merchantKeyOf(b);
  if (x.length < 3 || y.length < 3) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/**
 * The spend a refund gives back, or null. It must say it is a refund (the email was read as one,
 * or a refund word is in its text) or come from the same shop for the exact amount; it reaches
 * back `REFUND_DAYS`, for a spend of at least its amount (a part refund). The same shop wins over
 * an amount alone; then the exact amount; then the nearest day.
 */
export function refundFor(money: IncomingMoney, spends: readonly GivableSpend[]): string | null {
  const said =
    money.hint === 'refund' ||
    namesRefund(`${money.merchant} ${money.note ?? ''} ${money.memo ?? ''}`);
  let best: { id: string; score: number } | null = null;
  for (const spend of spends) {
    if (!givable(spend, money.day, REFUND_DAYS) || spend.amount < money.amount) continue;
    const shop = sameShop(spend.merchant, money.merchant);
    const exact = spend.amount === money.amount;
    if (!(said && (shop || exact)) && !(shop && exact)) continue;
    const score = (shop ? 4 : 0) + (exact ? 2 : 0) - diffDays(money.day, spend.day) / 1000;
    if (best === null || score > best.score) best = { id: spend.id, score };
  }
  return best?.id ?? null;
}

/**
 * The spend a payback answers, or null: the exact amount of a work claim from the last
 * `CLAIM_DAYS`, or of a spend with a note (a split saves one naming the total) from the last
 * `PAYBACK_DAYS`. The nearest day wins.
 */
export function paybackFor(money: IncomingMoney, spends: readonly GivableSpend[]): string | null {
  let best: GivableSpend | null = null;
  for (const spend of spends) {
    if (spend.amount !== money.amount) continue;
    const claim = spend.forWork === true && givable(spend, money.day, CLAIM_DAYS);
    const split =
      spend.status === 'kept' &&
      (spend.note ?? '').trim() !== '' &&
      givable(spend, money.day, PAYBACK_DAYS);
    if (!claim && !split) continue;
    if (best === null || spend.day > best.day) best = spend;
  }
  return best?.id ?? null;
}

/** What the close asks about money in before it is placed, if it looks like anything. */
export type MoneyInAsk =
  | { readonly kind: 'pay' }
  | { readonly kind: 'refund'; readonly spendId: string }
  | { readonly kind: 'payback'; readonly spendId: string };

/**
 * The one question the close asks about money in: the pay first, then a refund, then a payback.
 * Money that looks like none of them is an ordinary card, to spread or save.
 */
export function moneyInAsk(
  money: IncomingMoney,
  context: {
    readonly income: Money;
    readonly cycle: Pick<PayCycle, 'start' | 'payday'>;
    readonly spends: readonly GivableSpend[];
  },
): MoneyInAsk | null {
  if (money.hint !== 'refund' && looksLikePay(money, context.income, context.cycle)) {
    return { kind: 'pay' };
  }
  const refund = refundFor(money, context.spends);
  if (refund !== null) return { kind: 'refund', spendId: refund };
  const payback = paybackFor(money, context.spends);
  return payback === null ? null : { kind: 'payback', spendId: payback };
}

/**
 * What a money-in card shows before it is placed: tomorrow's line as it is, and if the money were
 * spread over the days left. With no day left after today, spreading lands on today alone.
 */
export function spreadPreview(
  day: { readonly free: Money; readonly tomorrow: Money },
  amount: Money,
  daysLeft: number,
  currency: Currency = VND,
): { readonly asIs: Money; readonly spread: Money; readonly days: number } {
  const days = Math.max(1, daysLeft);
  return {
    asIs: day.tomorrow,
    spread: Math.max(0, floorToStep((day.free + amount) / days, currency)),
    days,
  };
}

/** Where money saved for Future you is put: its goals, by the share each takes of Future you. */
export const FUTURE_YOU = 'futureYou';

/**
 * Money saved for Future you, split between its goals by their shares (evenly when none has one),
 * in whole minor units: what rounding leaves goes to the goal with the largest share. No goal, no
 * split: Future you has nowhere to keep it.
 */
export function futureYouSplit(
  amount: Money,
  goals: readonly { readonly id: string; readonly share: number | null }[],
): Readonly<Record<string, Money>> {
  if (goals.length === 0 || amount <= 0) return {};
  const shares = goals.map((g) => Math.max(0, g.share ?? 0));
  const total = shares.reduce((a, b) => a + b, 0);
  const weights = total > 0 ? shares.map((s) => s / total) : goals.map(() => 1 / goals.length);
  const parts = weights.map((w) => Math.floor(amount * w));
  let largest = 0;
  weights.forEach((w, i) => {
    if (w > (weights[largest] ?? 0)) largest = i;
  });
  parts[largest] = (parts[largest] ?? 0) + amount - parts.reduce((a, b) => a + b, 0);
  const split: Record<string, Money> = {};
  goals.forEach((goal, i) => {
    const part = parts[i] ?? 0;
    if (part > 0) split[goal.id] = part;
  });
  return split;
}

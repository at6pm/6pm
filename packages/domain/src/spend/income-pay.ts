import type { MerchantRuleRow } from '../contracts/local-rows';
import type { MoneyIn } from './money-in';
import type { Money } from '../money/currency';
import { basePays, payEvents, type Income } from '../plan/incomes';
import type { Payday } from '../plan/pay-cycle';
import { addDays, diffDays, type LocalDate } from '../time/local-date';

/** Money in at least this share of the plan's income, near payday, is asked about as the pay. */
export const PAY_SHARE = 0.7;
/** How far from payday (either side) the pay may land and still be asked about. */
export const PAY_DAYS = 3;

/** The days between two of a rhythm's pays, about. */
function periodDays(income: Income): number {
  switch (income.rhythm.kind) {
    case 'weekly':
      return 7;
    case 'everyTwoWeeks':
      return 14;
    case 'twiceMonthly':
      return 15;
    case 'monthly':
      return 30;
    case 'none':
      return 0;
  }
}

/**
 * How far from its date an income's pay may land and still be asked about as that pay: three days,
 * or a quarter of the time between its pays when that is less (a day for a weekly pay), so a pay
 * is never taken for the one before or after it.
 */
export function payDaysOf(income: Income): number {
  return Math.min(PAY_DAYS, Math.floor(periodDays(income) / 4));
}

/**
 * The income money in looks like the pay of: one with a counted-on amount, of which it is at
 * least `PAY_SHARE`, landing within `payDaysOf` that income's own pay dates. Of several, the one
 * whose amount is nearest. Null when it looks like none of them.
 */
export function payIncomeFor(
  money: { readonly day: LocalDate; readonly amount: Money },
  incomes: readonly Income[],
  anchor: Payday,
): Income | null {
  let best: Income | null = null;
  for (const income of incomes) {
    if (income.amount <= 0 || money.amount < Math.ceil(income.amount * PAY_SHARE)) continue;
    const days = payDaysOf(income);
    const near = payEvents([income], addDays(money.day, -days), addDays(money.day, days), anchor);
    if (!near.some((pay) => Math.abs(diffDays(money.day, pay.day)) <= days)) continue;
    if (
      best === null ||
      Math.abs(money.amount - income.amount) < Math.abs(money.amount - best.amount)
    ) {
      best = income;
    }
  }
  return best;
}

/**
 * Where money in from no remembered sender belongs, and how sure 6pm is of it:
 * - `pay`: it looks like the pay of an income with a counted-on amount (`payIncomeFor`),
 * - `landing`: nothing is counted on, so money in is what the month lives on: the pay of an income
 *   that only lands (one not from work first, as a person's money comes before their takings),
 * - `spread`: neither; ordinary money in, spread over the days.
 */
export type IncomeMatch =
  | { readonly kind: 'pay'; readonly incomeId: string }
  | { readonly kind: 'landing'; readonly incomeId: string }
  | { readonly kind: 'spread' };

/**
 * The one rule for money in that nobody has placed yet, used for money typed into Quick add and
 * for money in the close asks about (by bank alert, mail or any other way). For someone whose
 * money only lands, money in counts as landed, so it sets the bills aside and makes the number;
 * spread, it would sit beside a month that says nothing has landed.
 */
export function incomeMatchOf(
  money: { readonly day: LocalDate; readonly amount: Money },
  incomes: readonly Income[] | undefined,
  anchor: Payday,
): IncomeMatch {
  if (incomes === undefined || money.amount <= 0) return { kind: 'spread' };
  const pay = payIncomeFor(money, incomes, anchor);
  if (pay !== null) return { kind: 'pay', incomeId: pay.id };
  if (incomes.some((income) => income.amount > 0)) return { kind: 'spread' };
  const landing = incomes.find((income) => income.fromWork !== true) ?? incomes[0];
  return landing === undefined ? { kind: 'spread' } : { kind: 'landing', incomeId: landing.id };
}

/**
 * The month's income the companion and the bonus measure money in against: the plan's own for a
 * plan never asked about its incomes, else what the counted-on incomes bring in a usual month.
 */
export function monthlyIncomeOf(plan: {
  readonly income: Money;
  readonly incomes?: readonly Income[] | undefined;
}): Money {
  if (plan.incomes === undefined) return plan.income;
  return plan.incomes.reduce((sum, i) => sum + Math.max(0, i.amount) * basePays(i.rhythm), 0);
}

/**
 * Where money from a sender went last time, as the close offers it again: spread, saved in a jar,
 * or one of the plan's incomes' pay. Refunds and paybacks answer a spend, not a sender, so they are
 * never remembered.
 */
export interface RememberedPlace {
  readonly moneyIn: 'spread' | 'saved' | 'pay';
  /** For `saved`: the jar it went to. */
  readonly savedTo: string | null;
  /** For `pay`: the income it was. */
  readonly incomeId: string | null;
}

/**
 * What a sender's rule remembers about its money, if anything usable: a jar that is gone, or an
 * income no longer in the plan, is not offered.
 */
export function rememberedPlaceOf(
  rule: Pick<MerchantRuleRow, 'moneyIn' | 'savedTo' | 'incomeId'> | null | undefined,
  live: { readonly jars: ReadonlySet<string>; readonly incomes: ReadonlySet<string> },
): RememberedPlace | null {
  if (!rule) return null;
  switch (rule.moneyIn) {
    case 'spread':
      return { moneyIn: 'spread', savedTo: null, incomeId: null };
    case 'saved':
      return rule.savedTo != null && live.jars.has(rule.savedTo)
        ? { moneyIn: 'saved', savedTo: rule.savedTo, incomeId: null }
        : null;
    case 'pay':
      return rule.incomeId != null && live.incomes.has(rule.incomeId)
        ? { moneyIn: 'pay', savedTo: null, incomeId: rule.incomeId }
        : null;
    case 'refund':
    case 'payback':
    case null:
    case undefined:
      return null;
  }
}

/**
 * What a sender's rule remembers once money in from it is placed: the placing itself when it is
 * one a sender repeats (spread, saved, an income's pay), else nothing new.
 */
export function placeToRemember(placed: {
  readonly moneyIn?: MoneyIn | null | undefined;
  readonly savedTo?: string | null | undefined;
  readonly incomeId?: string | null | undefined;
}): RememberedPlace | null {
  switch (placed.moneyIn) {
    case 'spread':
      return { moneyIn: 'spread', savedTo: null, incomeId: null };
    case 'saved':
      return placed.savedTo ? { moneyIn: 'saved', savedTo: placed.savedTo, incomeId: null } : null;
    case 'pay':
      return placed.incomeId ? { moneyIn: 'pay', savedTo: null, incomeId: placed.incomeId } : null;
    case 'refund':
    case 'payback':
    case null:
    case undefined:
      return null;
  }
}

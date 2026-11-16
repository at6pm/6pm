import type { ForeignAmount } from '../capture/foreign-price';
import { roundToStep, toMajor, toMinor, type Currency, type Money } from '../money/currency';
import { tenthHeldBack } from '../spend/held-back';
import { isRate, rateNumber } from '../travel/fx';
import { foreignToHome } from '../travel/home-fx';

/**
 * A plan moving from one home currency to another: everything it holds is counted again in the
 * new one. `rate` is new-home units for one unit of the old home, an exact decimal string as
 * `homeRate` answers it.
 */
export interface HomeChange {
  readonly from: Currency;
  readonly to: Currency;
  readonly rate: string;
}

/** A change that can be made: two different currencies and a usable rate. */
export function isHomeChange(change: HomeChange): boolean {
  return change.from.code !== change.to.code && isRate(change.rate);
}

/** Minor units written as an exact decimal of major units: 1234 cents is "12.34". */
function majorText(amount: Money, currency: Currency): string {
  const digits = String(amount).padStart(currency.minorDigits + 1, '0');
  if (currency.minorDigits === 0) return digits;
  return `${digits.slice(0, -currency.minorDigits)}.${digits.slice(-currency.minorDigits)}`;
}

/**
 * An amount of the old home in the new one, to the nearest minor unit, halves away from zero. An
 * amount that was something never becomes nothing: it is at least one minor unit. Money that left
 * a jar (a negative move) keeps its sign.
 */
export function inNewHome(amount: Money, change: HomeChange): Money {
  if (amount === 0) return 0;
  const size = Math.abs(amount);
  const counted = foreignToHome(majorText(size, change.from), change.rate, change.to) ?? 0;
  const kept = Math.max(1, counted);
  return amount < 0 ? -kept : kept;
}

/**
 * An amount the person plans with (money in, a bill, a jar's goal, what a jar takes each payday)
 * in the new home, to the nearest step, since that is what its wheels and keypads count in. One
 * that was something is at least one step.
 */
export function plannedInNewHome(amount: Money, change: HomeChange): Money {
  if (amount <= 0) return 0;
  return Math.max(change.to.step, roundToStep(inNewHome(amount, change), change.to));
}

/** The parts of a spend (or money in) that are counted in the home currency. */
export interface SpendMoney {
  readonly amount: Money;
  readonly foreignAmount: ForeignAmount | null;
  readonly fromPotAmount?: Money | null | undefined;
}

/**
 * A spend in the new home.
 * - One paid in what is now home (a receipt in đồng on a plan that counted in dollars) goes back
 *   to the amount that was printed, exactly, and is foreign no longer. One that was still waiting
 *   for a rate is priced by this.
 * - One paid in a third currency keeps its printed amount; its home amount is converted and its
 *   rate becomes new-home units for one unit.
 * - Everything else is converted.
 * What a jar covered is converted too, and is never more than the spend.
 */
export function spendInNewHome(spend: SpendMoney, change: HomeChange): Required<SpendMoney> {
  const foreign = spend.foreignAmount;
  const covered = (amount: Money): Money | null =>
    spend.fromPotAmount == null ? null : Math.min(amount, inNewHome(spend.fromPotAmount, change));
  if (foreign !== null && foreign.currency === change.to.code) {
    const amount = toMinor(foreign.amount, change.to);
    return { amount, foreignAmount: null, fromPotAmount: covered(amount) };
  }
  const amount = inNewHome(spend.amount, change);
  if (foreign === null) return { amount, foreignAmount: null, fromPotAmount: covered(amount) };
  return {
    amount,
    foreignAmount: { ...foreign, rate: foreign.rate * rateNumber(change.rate) },
    fromPotAmount: covered(amount),
  };
}

/**
 * What a client held back from money in, in the new home. A tenth stays exactly a tenth of what
 * landed (so it still reads as "10%" and the sender's share is still remembered); a typed amount
 * is converted.
 */
export function heldBackInNewHome(
  heldBack: Money,
  landed: { readonly before: Money; readonly after: Money },
  change: HomeChange,
): Money {
  if (heldBack <= 0) return 0;
  if (heldBack === tenthHeldBack(landed.before)) return tenthHeldBack(landed.after);
  return inNewHome(heldBack, change);
}

/** The parts of a plan that are money. */
export interface PlanMoney {
  readonly income: Money;
  readonly futureYou: Money;
  readonly spentSincePayday?: Money | undefined;
  /** Every income, when the plan keeps them: what each pay brings. */
  readonly incomes?: readonly { readonly amount: Money }[] | undefined;
}

/** A plan's money in the new home: what was planned to the step, what was spent to the unit. */
export function planInNewHome<P extends PlanMoney>(plan: P, change: HomeChange): P {
  const income = plannedInNewHome(plan.income, change);
  return {
    ...plan,
    income,
    // Future you never takes more than what comes in, even after both were rounded.
    futureYou: Math.min(income, plannedInNewHome(plan.futureYou, change)),
    ...(plan.spentSincePayday === undefined
      ? {}
      : { spentSincePayday: inNewHome(plan.spentSincePayday, change) }),
    // Each pay to the step, as its wheels count; one counted only as it lands stays at nothing.
    ...(plan.incomes === undefined
      ? {}
      : {
          incomes: plan.incomes.map((pay) => ({
            ...pay,
            amount: plannedInNewHome(pay.amount, change),
          })),
        }),
  };
}

/** What one unit of the old home is in the new one, as major units: for the line that says so. */
export function homeChangeSample(change: HomeChange): { from: Money; to: Money } {
  // A whole amount of the dearer currency, so neither side reads as zero: $1 is 25.400₫.
  const perUnit = rateNumber(change.rate);
  if (perUnit >= 1) {
    const from = change.from.minorPerMajor;
    return { from, to: inNewHome(from, change) };
  }
  const to = change.to.minorPerMajor;
  const from = Math.max(
    1,
    Math.round((toMajor(to, change.to) / perUnit) * change.from.minorPerMajor),
  );
  return { from, to };
}

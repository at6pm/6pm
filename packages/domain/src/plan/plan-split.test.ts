import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { floorToStep, VND } from '../money/currency';
import type { CountedSpend } from '../spend/spend';
import { addDays, type LocalDate } from '../time/local-date';
import { dailyNumber, type DailyNumberInput, type MonthPlan } from './daily-number';
import { joinedCycle } from './joined-cycle';
import { payCycleOn, type Payday } from './pay-cycle';
import { planSplit, type MathsRowKind, type PlanSplit, type PlanSplitInput } from './plan-split';

/** The Plan canvas's month: 17,4tr in, 4,2tr of bills, 4,5tr into jars, 8,7tr free. */
const plan: MonthPlan = {
  income: 17_400_000,
  bills: 4_200_000,
  futureYou: 2_100_000,
  occasions: 2_400_000,
  topUps: 0,
};
const payday: Payday = { kind: 'lastDay' };

type Dated = CountedSpend & { readonly day: LocalDate };
const spend = (day: LocalDate, amount: number, extra: Partial<CountedSpend> = {}): Dated => ({
  day,
  amount,
  category: 'Food',
  status: 'kept',
  ...extra,
});

/** A split for `today`, with the input built the way the app builds it from the spends. */
function splitOn(
  today: LocalDate,
  spends: readonly Dated[],
  options: { joinedOn?: LocalDate; answer?: number; plan?: MonthPlan } = {},
): { split: PlanSplit; input: DailyNumberInput } {
  const cycle = payCycleOn(today, payday);
  const joined = joinedCycle(cycle, {
    on: options.joinedOn ?? null,
    spentSincePayday: options.answer ?? null,
  });
  const notDaily = new Set<string>();
  const input: DailyNumberInput = {
    plan: options.plan ?? plan,
    spentBefore: spends
      .filter((s) => s.day < today && s.day >= cycle.start)
      .reduce((sum, s) => sum + s.amount - (s.fromPot ? (s.fromPotAmount ?? s.amount) : 0), 0),
    today: spends.filter((s) => s.day === today),
    notDaily,
    daysLeft: cycle.daysLeft,
    share: joined.share,
    beforeJoining: joined.beforeJoining,
  };
  const at: PlanSplitInput = {
    input,
    cycle,
    today,
    spends: spends.filter((s) => s.day >= cycle.start && s.day <= today),
    joinedOn: options.joinedOn ?? null,
  };
  return { split: planSplit(at), input };
}

const kinds = (split: PlanSplit) => split.maths.map((r) => r.kind);
const amountOf = (split: PlanSplit, kind: MathsRowKind) =>
  split.maths.find((r) => r.kind === kind)?.amount;
/** The rows above `kind`, added up. */
const sumAbove = (split: PlanSplit, kind: MathsRowKind) =>
  split.maths
    .slice(
      0,
      split.maths.findIndex((r) => r.kind === kind),
    )
    .reduce((sum, r) => sum + (r.amount ?? 0), 0);

/** The receipt lands on the line: rows down to Left make Left, and Left over the days is the line. */
function expectMathsToLandOnLine(split: PlanSplit, input: DailyNumberInput) {
  const day = dailyNumber(input);
  const divide = split.maths.find((r) => r.kind === 'divide');
  expect(divide?.amount).toBe(day.line);
  expect(divide?.count).toBe(input.daysLeft + 1);
  const left = amountOf(split, 'left') ?? amountOf(split, 'free') ?? 0;
  if (split.maths.some((r) => r.kind === 'left')) expect(sumAbove(split, 'left')).toBe(left);
  expect(left).toBe(day.startFree);
  expect(Math.max(0, floorToStep(left / (divide?.count ?? 1), VND))).toBe(split.line);
}

const sumOfParts = (split: PlanSplit) =>
  split.parts.filter((p) => p.kind !== 'over').reduce((sum, p) => sum + p.amount, 0);

describe('planSplit', () => {
  it('splits the middle of the cycle into Bills, Pots and Free, and lands on Today’s line', () => {
    const spends = [spend('2026-10-02', 400_000), spend('2026-10-05', 600_000)];
    const { split, input } = splitOn('2026-10-09', [...spends, spend('2026-10-09', 120_000)]);
    expect(split.parts.map((p) => [p.kind, p.amount])).toEqual([
      ['bills', 4_200_000],
      ['pots', 4_500_000],
      ['free', 8_700_000],
    ]);
    expect(sumOfParts(split)).toBe(split.pay);
    expect(split.line).toBe(dailyNumber(input).line);
    expect(kinds(split)).toEqual(['free', 'spentBefore', 'left', 'divide']);
    expect(amountOf(split, 'spentBefore')).toBe(-1_000_000);
    expect(amountOf(split, 'left')).toBe(7_700_000);
    // ÷ 23 days: 9 October through payday on the 31st.
    expect(split.line).toBe(334_000);
    expectMathsToLandOnLine(split, input);
    expect(split.first).toBe(false);
    expect(split.overspent).toBe(false);
    expect(split.lastDay).toBe(false);
  });

  it('draws one day per day of the cycle: past by spend, today, then the days to come', () => {
    const { split } = splitOn('2026-10-09', [spend('2026-10-02', 334_000)]);
    expect(split.days).toHaveLength(31);
    expect(split.days[0]?.day).toBe('2026-09-30');
    expect(split.days.at(-1)?.day).toBe('2026-10-30');
    expect(split.days.filter((d) => d.kind === 'past')).toHaveLength(9);
    expect(split.days.find((d) => d.kind === 'today')?.day).toBe('2026-10-09');
    expect(split.days.filter((d) => d.kind === 'future')).toHaveLength(21);
    const second = split.days.find((d) => d.day === '2026-10-02');
    expect(second?.spent).toBe(334_000);
    expect(second?.level).toBeGreaterThan(0.9);
    expect(split.days.find((d) => d.day === '2026-10-03')?.level).toBe(0);
  });

  it('leaves what a jar covered out of a day’s dot, as the number does', () => {
    const { split } = splitOn('2026-10-09', [
      spend('2026-10-04', 1_200_000, { fromPot: 'dalat', fromPotAmount: 1_200_000 }),
    ]);
    expect(split.days.find((d) => d.day === '2026-10-04')?.spent).toBe(0);
  });

  it('starts the day after payday with nothing spent: free over every day to payday', () => {
    const { split, input } = splitOn('2026-11-01', []);
    expect(split.daysSincePayday).toBe(1);
    expect(kinds(split)).toEqual(['free', 'divide']);
    expect(amountOf(split, 'free')).toBe(8_700_000);
    expect(split.line).toBe(dailyNumber(input).line);
    expectMathsToLandOnLine(split, input);
    expect(split.days[0]?.kind).toBe('past');
    expect(split.days[1]?.kind).toBe('today');
  });

  it('past the plan: an Over part after Free, and the maths adds up to the over', () => {
    const spends = [spend('2026-10-20', 6_000_000), spend('2026-10-24', 3_000_000)];
    const { split, input } = splitOn('2026-10-26', [...spends, spend('2026-10-26', 300_000)]);
    const day = dailyNumber(input);
    expect(split.overspent).toBe(true);
    expect(split.over).toBe(600_000);
    expect(split.line).toBe(day.line);
    expect(split.line).toBe(0);
    expect(split.parts.map((p) => p.kind)).toEqual(['bills', 'pots', 'free', 'over']);
    expect(split.parts.at(-1)?.amount).toBe(600_000);
    expect(kinds(split)).toEqual(['free', 'spentSoFar', 'over', 'untouched']);
    expect(amountOf(split, 'spentSoFar')).toBe(-9_300_000);
    expect(sumAbove(split, 'over')).toBe(-split.over);
    expect(amountOf(split, 'untouched')).toBeNull();
    // Days from the one that went past the plan tint warm; earlier ones do not.
    expect(split.days.find((d) => d.day === '2026-10-20')?.kind).toBe('past');
    expect(split.days.find((d) => d.day === '2026-10-24')?.kind).toBe('over');
    expect(split.days.find((d) => d.day === '2026-10-25')?.kind).toBe('over');
    expect(split.days.find((d) => d.day === '2026-10-26')?.kind).toBe('today');
  });

  it('payday tomorrow: what is left over today and payday, then the new pay', () => {
    const { split, input } = splitOn('2026-10-30', [spend('2026-10-10', 7_860_000)]);
    expect(split.lastDay).toBe(true);
    expect(split.daysLeft).toBe(1);
    expect(kinds(split)).toEqual(['free', 'spentBefore', 'left', 'divide', 'tomorrow']);
    expect(amountOf(split, 'left')).toBe(840_000);
    expect(split.line).toBe(420_000);
    expect(amountOf(split, 'tomorrow')).toBe(plan.income);
    expectMathsToLandOnLine(split, input);
    expect(split.days.at(-1)?.kind).toBe('today');
  });

  it('a first month: Before as its own part, no dots before joining, Since you joined', () => {
    const joinedOn = '2026-10-08';
    const first: MonthPlan = { ...plan, bills: 3_600_000, occasions: 0 };
    const { split, input } = splitOn('2026-10-09', [spend('2026-10-08', 300_000)], {
      joinedOn,
      answer: 2_400_000,
      plan: first,
    });
    expect(split.first).toBe(true);
    expect(split.before).toBe(2_400_000);
    expect(split.parts.map((p) => [p.kind, p.amount])).toEqual([
      ['bills', 3_600_000],
      ['pots', 2_100_000],
      ['before', 2_400_000],
      ['free', 9_300_000],
    ]);
    expect(sumOfParts(split)).toBe(split.pay);
    expect(kinds(split)).toEqual(['free', 'before', 'sinceJoined', 'left', 'divide']);
    expect(amountOf(split, 'free')).toBe(11_700_000);
    expect(amountOf(split, 'before')).toBe(-2_400_000);
    expect(split.line).toBe(dailyNumber(input).line);
    expectMathsToLandOnLine(split, input);
    expect(split.days.filter((d) => d.kind === 'none').map((d) => d.day)).toEqual(
      Array.from({ length: 8 }, (_, k) => addDays('2026-09-30', k)),
    );
    expect(split.days.find((d) => d.day === joinedOn)?.kind).toBe('past');
  });

  it('a first month with no answer counts the even-pace estimate as Before', () => {
    const { split, input } = splitOn('2026-10-09', [], { joinedOn: '2026-10-08' });
    expect(split.before).toBeGreaterThan(0);
    expect(split.free + split.before).toBe(8_700_000);
    expectMathsToLandOnLine(split, input);
  });

  it('puts money in on the pay and top-ups in the jars, so the parts still make the pay', () => {
    const { split, input } = splitOn('2026-10-09', [
      spend('2026-10-03', 500_000, { direction: 'in' }),
    ]);
    const withTopUp = { ...input, moneyIn: 500_000, plan: { ...plan, topUps: 200_000 } };
    const cycle = payCycleOn('2026-10-09', payday);
    const s = planSplit({
      input: withTopUp,
      cycle,
      today: '2026-10-09',
      spends: [],
      joinedOn: null,
    });
    expect(split.pay).toBe(plan.income);
    expect(s.pay).toBe(17_900_000);
    expect(s.pots).toBe(4_700_000);
    expect(sumOfParts(s)).toBe(s.pay);
    expectMathsToLandOnLine(s, withTopUp);
  });

  it('always shows Today’s line and adds up to it, whatever the month', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 60_000_000 }),
        fc.integer({ min: 0, max: 20_000_000 }),
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.integer({ min: 0, max: 30_000_000 }),
        fc.integer({ min: 0, max: 3_000_000 }),
        fc.integer({ min: 0, max: 30 }),
        (income, bills, futureYou, spent, today, offset) => {
          const day = addDays('2026-09-30', offset);
          const month: MonthPlan = { income, bills, futureYou, occasions: 0, topUps: 0 };
          const spends = [...(offset > 0 ? [spend('2026-09-30', spent)] : []), spend(day, today)];
          const { split, input } = splitOn(day, spends, { plan: month });
          const number = dailyNumber(input);
          expect(split.line).toBe(number.line);
          expect(split.overspent).toBe(number.overspent);
          if (split.overspent) {
            expect(sumAbove(split, 'over')).toBe(-split.over);
            expect(split.maths.some((r) => r.kind === 'divide')).toBe(false);
          } else {
            expectMathsToLandOnLine(split, input);
          }
          expect(split.maths.filter((r) => r.result)).toHaveLength(1);
        },
      ),
    );
  });
});

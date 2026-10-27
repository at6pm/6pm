import { describe, expect, it } from 'vitest';

import { dailyNumber, type MonthPlan } from '../plan/daily-number';
import { payCycleOn } from '../plan/pay-cycle';
import { currencyOf } from '../money/currency';
import {
  addsToFree,
  futureYouSplit,
  isBigMoneyIn,
  looksLikePay,
  moneyInAsk,
  offersPlanUpdate,
  paybackFor,
  payExtra,
  refundFor,
  spreadPreview,
  sumMoneyIn,
  type GivableSpend,
} from './money-in';
import { countsTowardDay, sumCounted, type CountedSpend } from './spend';

/** The prototype's Friday 9 October: payday 31 Oct, 2.365.000₫ spent 1–8 Oct. */
const plan: MonthPlan = {
  income: 17_400_000,
  bills: 4_200_000,
  futureYou: 2_000_000,
  occasions: 750_000,
  topUps: 0,
};
const payday = { kind: 'sameDay', day: 31 } as const;
const daysLeft = payCycleOn('2026-10-09', payday).daysLeft;

describe('money in and the daily number', () => {
  const friday: CountedSpend[] = [
    { amount: 25_000, category: 'Food', status: 'kept' },
    { amount: 2_000_000, category: 'Food', status: 'caught', direction: 'in' },
  ];

  it('is never spending, waiting or kept', () => {
    expect(countsTowardDay(friday[1]!, new Set())).toBe(false);
    expect(sumCounted(friday, new Set())).toBe(25_000);
  });

  it('changes nothing until it is kept', () => {
    expect(addsToFree({ amount: 2_000_000, status: 'caught', direction: 'in' })).toBe(false);
    expect(addsToFree({ amount: 2_000_000, status: 'skipped', direction: 'in' })).toBe(false);
  });

  it('adds to free money once kept as spread, saved, a refund, or with nothing said', () => {
    for (const moneyIn of ['spread', 'saved', 'refund', null] as const) {
      expect(addsToFree({ amount: 1, status: 'kept', direction: 'in', moneyIn })).toBe(true);
    }
  });

  it('never adds the pay the plan already counts, nor a payback', () => {
    expect(addsToFree({ amount: 1, status: 'kept', direction: 'in', moneyIn: 'pay' })).toBe(false);
    expect(addsToFree({ amount: 1, status: 'kept', direction: 'in', moneyIn: 'payback' })).toBe(
      false,
    );
    expect(addsToFree({ amount: 1, status: 'kept', moneyIn: 'spread' })).toBe(false);
  });

  it('sums only what adds to free money', () => {
    expect(
      sumMoneyIn([
        { amount: 2_000_000, status: 'kept', direction: 'in', moneyIn: 'spread' },
        { amount: 18_000_000, status: 'kept', direction: 'in', moneyIn: 'pay' },
        { amount: 349_000, status: 'kept', direction: 'in', moneyIn: 'refund' },
        { amount: 500_000, status: 'caught', direction: 'in' },
        { amount: 45_000, status: 'kept' },
      ]),
    ).toBe(2_349_000);
  });

  it('spreads 2tr over the 22 days left: tomorrow rises by its share', () => {
    const base = {
      plan,
      spentBefore: 2_365_000,
      today: [],
      notDaily: new Set<string>(),
      daysLeft,
    };
    const before = dailyNumber(base);
    const after = dailyNumber({ ...base, moneyIn: 2_000_000 });
    expect(after.startFree - before.startFree).toBe(2_000_000);
    expect(after.tomorrow).toBe(Math.floor((before.free + 2_000_000) / daysLeft / 1000) * 1000);
  });

  it('holds today when money is saved: the top-up takes back what it added', () => {
    const base = {
      plan,
      spentBefore: 2_365_000,
      today: [],
      notDaily: new Set<string>(),
      daysLeft,
    };
    const saved = dailyNumber({
      ...base,
      plan: { ...plan, topUps: 2_000_000 },
      moneyIn: 2_000_000,
    });
    expect(saved.line).toBe(dailyNumber(base).line);
  });

  it('ignores a money-in total that is not a number or below zero', () => {
    const base = { plan, spentBefore: 0, today: [], notDaily: new Set<string>(), daysLeft };
    expect(dailyNumber({ ...base, moneyIn: Number.NaN }).startFree).toBe(
      dailyNumber(base).startFree,
    );
    expect(dailyNumber({ ...base, moneyIn: -5 }).startFree).toBe(dailyNumber(base).startFree);
  });
});

describe('the pay', () => {
  const cycle = payCycleOn('2026-10-27', { kind: 'sameDay', day: 27 });

  it('is most of the income within three days of payday', () => {
    expect(looksLikePay({ day: '2026-10-27', amount: 19_500_000 }, 18_000_000, cycle)).toBe(true);
    expect(looksLikePay({ day: '2026-10-25', amount: 12_600_000 }, 18_000_000, cycle)).toBe(true);
    expect(looksLikePay({ day: '2026-10-27', amount: 12_599_999 }, 18_000_000, cycle)).toBe(false);
    expect(looksLikePay({ day: '2026-11-03', amount: 18_000_000 }, 18_000_000, cycle)).toBe(false);
    expect(looksLikePay({ day: '2026-11-25', amount: 18_000_000 }, 18_000_000, cycle)).toBe(true);
  });

  it('is never asked about with no income in the plan', () => {
    expect(looksLikePay({ day: '2026-10-27', amount: 1 }, 0, cycle)).toBe(false);
  });

  it('gives what came beyond the plan as an extra, and offers the plan only past 5%', () => {
    expect(payExtra(19_500_000, 18_000_000)).toBe(1_500_000);
    expect(payExtra(17_000_000, 18_000_000)).toBe(0);
    expect(offersPlanUpdate(1_500_000, 18_000_000)).toBe(true);
    expect(offersPlanUpdate(800_000, 18_000_000)).toBe(false);
  });

  it('calls money in big from a fifth of the income', () => {
    expect(isBigMoneyIn(3_600_000, 18_000_000)).toBe(true);
    expect(isBigMoneyIn(3_599_999, 18_000_000)).toBe(false);
  });
});

describe('refunds and paybacks', () => {
  const earbuds: GivableSpend = {
    id: 'earbuds',
    day: '2026-10-21',
    amount: 349_000,
    merchant: 'Shopee',
    status: 'kept',
  };
  const pizza: GivableSpend = {
    id: 'pizza',
    day: '2026-10-20',
    amount: 250_000,
    merchant: "Pizza 4P's",
    status: 'kept',
    note: 'Split 4 ways · 1.000.000₫ in all',
  };
  const taxi: GivableSpend = {
    id: 'taxi',
    day: '2026-08-01',
    amount: 420_000,
    merchant: 'Grab',
    status: 'kept',
    forWork: true,
  };
  const spends = [earbuds, pizza, taxi];

  it('finds the spend a shop refunds, whole or in part', () => {
    const money = { day: '2026-10-27', amount: 349_000, merchant: 'Shopee' };
    expect(refundFor(money, spends)).toBe('earbuds');
    expect(refundFor({ ...money, amount: 100_000, hint: 'refund' }, spends)).toBe('earbuds');
  });

  it('needs a refund word or the same shop for the exact amount', () => {
    const stranger = { day: '2026-10-27', amount: 349_000, merchant: 'Lan Nguyễn' };
    expect(refundFor(stranger, spends)).toBeNull();
    expect(refundFor({ ...stranger, memo: 'HOAN TIEN DON 2210' }, spends)).toBe('earbuds');
    expect(refundFor({ ...stranger, amount: 100_000, merchant: 'Shopee' }, spends)).toBeNull();
  });

  it('never gives back money in, a spend given back already, or one from too long ago', () => {
    const money = { day: '2026-10-27', amount: 349_000, merchant: 'Shopee' };
    expect(refundFor(money, [{ ...earbuds, givenBack: true }])).toBeNull();
    expect(refundFor(money, [{ ...earbuds, direction: 'in' }])).toBeNull();
    expect(refundFor(money, [{ ...earbuds, day: '2026-08-01' }])).toBeNull();
    expect(refundFor(money, [{ ...earbuds, status: 'skipped' }])).toBeNull();
  });

  it('matches a friend paying back a split, and a work claim repaid', () => {
    const lan = { day: '2026-10-27', amount: 250_000, merchant: 'Lan Nguyễn' };
    expect(paybackFor(lan, spends)).toBe('pizza');
    expect(paybackFor({ ...lan, amount: 420_000, merchant: 'Mây Xanh JSC' }, spends)).toBe('taxi');
    expect(paybackFor({ ...lan, amount: 251_000 }, spends)).toBeNull();
    expect(paybackFor({ ...lan, day: '2026-11-20' }, spends)).toBeNull();
  });

  it('asks about the pay first, then a refund, then a payback', () => {
    const cycle = payCycleOn('2026-10-27', { kind: 'sameDay', day: 27 });
    const context = { income: 18_000_000, cycle, spends };
    const at = { day: '2026-10-27', merchant: 'Shopee' };
    expect(moneyInAsk({ ...at, amount: 19_500_000 }, context)).toEqual({ kind: 'pay' });
    expect(moneyInAsk({ ...at, amount: 349_000 }, context)).toEqual({
      kind: 'refund',
      spendId: 'earbuds',
    });
    expect(moneyInAsk({ ...at, amount: 250_000, merchant: 'Lan' }, context)).toEqual({
      kind: 'payback',
      spendId: 'pizza',
    });
    expect(moneyInAsk({ ...at, amount: 2_000_000, merchant: 'Lan' }, context)).toBeNull();
  });

  it('never takes a refund email for the pay', () => {
    const cycle = payCycleOn('2026-10-27', { kind: 'sameDay', day: 27 });
    const big = { ...earbuds, amount: 20_000_000 };
    const money = {
      day: '2026-10-27',
      amount: 19_000_000,
      merchant: 'Shopee',
      hint: 'refund' as const,
    };
    expect(moneyInAsk(money, { income: 18_000_000, cycle, spends: [big] })).toEqual({
      kind: 'refund',
      spendId: 'earbuds',
    });
  });
});

describe('spreadPreview', () => {
  it('shows tomorrow as it is and with the money spread over the days left', () => {
    const preview = spreadPreview({ free: 7_766_000, tomorrow: 353_000 }, 2_000_000, 22);
    expect(preview).toEqual({ asIs: 353_000, spread: 443_000, days: 22 });
  });

  it('lands on one day when payday is tomorrow', () => {
    expect(spreadPreview({ free: 100_000, tomorrow: 0 }, 50_000, 0).days).toBe(1);
  });

  it('floors to the home currency step', () => {
    const usd = currencyOf('USD');
    expect(spreadPreview({ free: 10_050, tomorrow: 0 }, 1_000, 3, usd).spread).toBe(3_600);
  });
});

describe('futureYouSplit', () => {
  it('splits by share, rounding left to the largest', () => {
    expect(
      futureYouSplit(1_000_001, [
        { id: 'cushion', share: 0.6 },
        { id: 'laptop', share: 0.4 },
      ]),
    ).toEqual({ cushion: 600_001, laptop: 400_000 });
  });

  it('splits evenly when no goal has a share, and gives nothing with no goal', () => {
    expect(
      futureYouSplit(300, [
        { id: 'a', share: null },
        { id: 'b', share: null },
        { id: 'c', share: 0 },
      ]),
    ).toEqual({ a: 100, b: 100, c: 100 });
    expect(futureYouSplit(300, [])).toEqual({});
  });
});

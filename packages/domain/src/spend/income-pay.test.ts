import { describe, expect, it } from 'vitest';

import { learnedRule, rememberedRule } from '../capture/merchant-rule';
import type { Income } from '../plan/incomes';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import {
  monthlyIncomeOf,
  payDaysOf,
  payIncomeFor,
  rememberedPlaceOf,
  type RememberedPlace,
} from './income-pay';
import { moneyInAsk, paybackFor, type GivableSpend } from './money-in';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };
const shifts: Income = {
  id: 'shifts',
  name: null,
  rhythm: { kind: 'weekly', weekday: 4 },
  amount: 4_000_000,
};
const site: Income = {
  id: 'site',
  name: null,
  rhythm: { kind: 'everyTwoWeeks', anchor: '2026-11-06' },
  amount: 7_000_000,
};
const salary: Income = {
  id: 'salary',
  name: null,
  rhythm: { kind: 'monthly', day: 25 },
  amount: 15_000_000,
};
const jobs: Income = { id: 'jobs', name: null, rhythm: { kind: 'none' }, amount: 0 };

describe('how far a pay may land from its date', () => {
  it('is three days, or a quarter of the time between pays when that is less', () => {
    expect(payDaysOf(shifts)).toBe(1);
    expect(payDaysOf(site)).toBe(3);
    expect(payDaysOf({ ...shifts, rhythm: { kind: 'twiceMonthly', days: [15, 'last'] } })).toBe(3);
    expect(payDaysOf(salary)).toBe(3);
    expect(payDaysOf(jobs)).toBe(0);
  });
});

describe('payIncomeFor', () => {
  it('takes money near a weekly pay’s own Friday as that pay, and nothing two days off', () => {
    const money = (day: string, amount = 4_000_000) => ({ day, amount });
    expect(payIncomeFor(money('2026-11-13'), [shifts], CALENDAR)).toBe(shifts);
    expect(payIncomeFor(money('2026-11-14'), [shifts], CALENDAR)).toBe(shifts);
    expect(payIncomeFor(money('2026-11-15'), [shifts], CALENDAR)).toBeNull();
    // At least seven tenths of the pay, measured by the amount per pay, not the month.
    expect(payIncomeFor(money('2026-11-13', 2_800_000), [shifts], CALENDAR)).toBe(shifts);
    expect(payIncomeFor(money('2026-11-13', 2_700_000), [shifts], CALENDAR)).toBeNull();
  });

  it('picks the income whose amount is nearest when two fit, and never money that only lands', () => {
    // 20 Nov is both a Friday and a fortnight's pay day.
    expect(payIncomeFor({ day: '2026-11-20', amount: 6_800_000 }, [shifts, site], CALENDAR)).toBe(
      site,
    );
    expect(payIncomeFor({ day: '2026-11-20', amount: 4_100_000 }, [shifts, site], CALENDAR)).toBe(
      shifts,
    );
    expect(payIncomeFor({ day: '2026-11-20', amount: 9_000_000 }, [jobs], CALENDAR)).toBeNull();
  });
});

describe('monthlyIncomeOf', () => {
  it('is the plan’s own income until it holds its incomes, then what they bring in a month', () => {
    expect(monthlyIncomeOf({ income: 18_000_000 })).toBe(18_000_000);
    expect(monthlyIncomeOf({ income: 18_000_000, incomes: [shifts, site, jobs] })).toBe(
      16_000_000 + 14_000_000,
    );
  });
});

const cycle = payCycleOn('2026-11-13', CALENDAR);
const earbuds: GivableSpend = {
  id: 'earbuds',
  day: '2026-11-02',
  amount: 450_000,
  merchant: 'Shopee',
  status: 'kept',
};

describe('the close asks about a pay of the plan’s incomes', () => {
  const ask = (money: { day: string; amount: number; merchant?: string }, incomes: Income[]) =>
    moneyInAsk(
      { merchant: 'Quán Gió', ...money },
      {
        income: monthlyIncomeOf({ income: 0, incomes }),
        cycle,
        spends: [],
        incomes,
        anchor: CALENDAR,
      },
    );

  it('offers the one counted income without asking which', () => {
    expect(ask({ day: '2026-11-13', amount: 4_000_000 }, [shifts, jobs])).toEqual({
      kind: 'pay',
      incomeId: 'shifts',
    });
  });

  it('asks nothing of money that looks like no pay', () => {
    expect(ask({ day: '2026-11-11', amount: 4_000_000 }, [shifts])).toBeNull();
  });
});

describe('a remembered placement', () => {
  const saved: RememberedPlace = { moneyIn: 'saved', savedTo: 'dalat', incomeId: null };
  const ask = (
    money: { amount: number; merchant: string; memo?: string },
    remembered: RememberedPlace | null,
  ) =>
    moneyInAsk(
      { day: '2026-11-13', ...money },
      { income: 18_000_000, cycle, spends: [earbuds], remembered },
    );

  it('is offered for money from the same sender', () => {
    expect(ask({ amount: 500_000, merchant: 'Mẹ' }, saved)).toEqual({
      kind: 'remembered',
      place: saved,
    });
  });

  it('offers a remembered pay as that income’s pay', () => {
    expect(
      ask(
        { amount: 3_000_000, merchant: 'Studio Mây' },
        {
          moneyIn: 'pay',
          savedTo: null,
          incomeId: 'jobs',
        },
      ),
    ).toEqual({ kind: 'pay', incomeId: 'jobs' });
  });

  it('gives way to a refund: money that gives a spend back still wins', () => {
    expect(ask({ amount: 450_000, merchant: 'Shopee' }, saved)).toEqual({
      kind: 'refund',
      spendId: 'earbuds',
    });
  });

  it('gives way to owed lines paid back', () => {
    const owed = moneyInAsk(
      { day: '2026-11-13', amount: 300_000, merchant: 'Linh' },
      {
        income: 18_000_000,
        cycle,
        spends: [],
        remembered: saved,
        owed: [
          {
            id: 'line-1',
            spendId: 'dinner',
            name: 'Linh',
            amount: 300_000,
            day: '2026-11-10',
          },
        ],
      },
    );
    expect(owed?.kind).toBe('payback');
  });

  it('is never offered for a jar that is gone or an income no longer in the plan', () => {
    const live = { jars: new Set(['dalat']), incomes: new Set(['shifts']) };
    expect(
      rememberedPlaceOf({ moneyIn: 'saved', savedTo: 'gone', incomeId: null }, live),
    ).toBeNull();
    expect(rememberedPlaceOf({ moneyIn: 'pay', savedTo: null, incomeId: 'old' }, live)).toBeNull();
    expect(
      rememberedPlaceOf({ moneyIn: 'refund', savedTo: null, incomeId: null }, live),
    ).toBeNull();
    expect(rememberedPlaceOf(null, live)).toBeNull();
    expect(rememberedPlaceOf({ moneyIn: 'spread', savedTo: null, incomeId: null }, live)).toEqual({
      moneyIn: 'spread',
      savedTo: null,
      incomeId: null,
    });
  });
});

describe('a sender’s rule', () => {
  it('is made for a sender with none, and keeps what it remembers when it is re-filed', () => {
    const made = rememberedRule(null, ' Studio Mây ', 'income', {
      moneyIn: 'pay',
      savedTo: null,
      incomeId: 'jobs',
    });
    expect(made).toEqual({
      merchantKey: 'studio mây',
      merchant: 'Studio Mây',
      categoryId: 'income',
      learnedTimes: 0,
      setByUser: false,
      moneyIn: 'pay',
      savedTo: null,
      incomeId: 'jobs',
    });
    expect(learnedRule(made, 'Studio Mây', 'work')).toMatchObject({
      categoryId: 'work',
      learnedTimes: 1,
      moneyIn: 'pay',
      incomeId: 'jobs',
    });
    expect(
      rememberedRule(null, '  ', 'income', { moneyIn: 'spread', savedTo: null, incomeId: null }),
    ).toBeNull();
  });
});

describe('a claim repaid', () => {
  it('is never matched for someone who works for themselves', () => {
    const cost: GivableSpend = { ...earbuds, id: 'ink', merchant: 'Mực in', forWork: true };
    const money = { day: '2026-11-13', amount: 450_000, merchant: 'Khách' };
    expect(paybackFor(money, [cost])).toBe('ink');
    expect(paybackFor(money, [cost], { claims: false })).toBeNull();
    expect(moneyInAsk(money, { income: 0, cycle, spends: [cost], work: true })).toBeNull();
  });
});

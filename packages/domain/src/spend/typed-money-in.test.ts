import { describe, expect, it } from 'vitest';

import { merchantKeyOf } from '../capture/merchant-rule';
import type { MerchantRuleRow } from '../contracts/local-rows';
import type { Income } from '../plan/incomes';
import { coverDays } from '../plan/landed';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import { landingDays, lastMoneyIn, rememberedSenders, typedMoneyIn } from './typed-money-in';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };
const salary: Income = {
  id: 'salary',
  name: null,
  rhythm: { kind: 'monthly', day: 25 },
  amount: 15_000_000,
};
const jobs: Income = { id: 'jobs', name: null, rhythm: { kind: 'none' }, amount: 0 };

describe('where typed money in goes', () => {
  const day = '2026-11-25';

  it('goes where a remembered sender’s money went last time', () => {
    const anchor = CALENDAR;
    expect(
      typedMoneyIn(
        { day, amount: 500_000 },
        { remembered: { moneyIn: 'saved', savedTo: 'trip', incomeId: null }, anchor },
      ),
    ).toEqual({ moneyIn: 'saved', savedTo: 'trip', asLastTime: true });
    expect(
      typedMoneyIn(
        { day, amount: 500_000 },
        { remembered: { moneyIn: 'spread', savedTo: null, incomeId: null }, anchor },
      ),
    ).toEqual({ moneyIn: 'spread', asLastTime: true });
    expect(
      typedMoneyIn(
        { day: '2026-11-03', amount: 1_500_000 },
        {
          remembered: { moneyIn: 'pay', savedTo: null, incomeId: 'jobs' },
          incomes: [salary, jobs],
          anchor,
        },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'jobs', asLastTime: true });
  });

  it('is a counted income’s pay when a new sender’s money looks like it', () => {
    expect(
      typedMoneyIn(
        { day, amount: 15_000_000 },
        { remembered: null, incomes: [salary, jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'salary', asLastTime: false });
  });

  it('is spread over the days otherwise', () => {
    // Far from the pay's date, too small to be it, or a plan that holds no incomes.
    expect(
      typedMoneyIn(
        { day: '2026-11-12', amount: 15_000_000 },
        { remembered: null, incomes: [salary, jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'spread', asLastTime: false });
    expect(
      typedMoneyIn(
        { day, amount: 2_000_000 },
        { remembered: null, incomes: [salary, jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'spread', asLastTime: false });
    expect(
      typedMoneyIn({ day, amount: 15_000_000 }, { remembered: null, anchor: CALENDAR }),
    ).toEqual({ moneyIn: 'spread', asLastTime: false });
  });

  it('is a landing for someone whose money only lands, so the month counts it', () => {
    // 18.000.000 typed in with nothing counted on: it is what landed, not money beside the month.
    expect(
      typedMoneyIn(
        { day: '2026-11-15', amount: 18_000_000 },
        { remembered: null, incomes: [jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'jobs', asLastTime: false });
    // A person's own money comes before takings from work of their own.
    const shop: Income = { ...jobs, id: 'shop', fromWork: true };
    expect(
      typedMoneyIn(
        { day: '2026-11-15', amount: 300_000 },
        { remembered: null, incomes: [shop, jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'jobs', asLastTime: false });
    expect(
      typedMoneyIn(
        { day: '2026-11-15', amount: 300_000 },
        { remembered: null, incomes: [shop], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'shop', asLastTime: false });
    // Said to be a pay ("It landed" on the close's payday card), it is that pay, as last time or not.
    expect(
      typedMoneyIn(
        { day: '2026-11-22', amount: 4_000_000 },
        {
          remembered: { moneyIn: 'spread', savedTo: null, incomeId: null },
          incomes: [salary, jobs],
          anchor: CALENDAR,
          expected: 'salary',
        },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'salary', asLastTime: false });
    expect(
      typedMoneyIn(
        { day: '2026-11-22', amount: 4_000_000 },
        { remembered: null, incomes: [jobs], anchor: CALENDAR, expected: 'gone' },
      ),
    ).toEqual({ moneyIn: 'pay', incomeId: 'jobs', asLastTime: false });
    // Nothing typed is nothing placed.
    expect(
      typedMoneyIn(
        { day: '2026-11-15', amount: 0 },
        { remembered: null, incomes: [jobs], anchor: CALENDAR },
      ),
    ).toEqual({ moneyIn: 'spread', asLastTime: false });
  });
});

describe('the senders "Who from" offers', () => {
  const rule = (merchant: string, over: Partial<MerchantRuleRow> = {}): MerchantRuleRow => ({
    merchantKey: merchantKeyOf(merchant),
    merchant,
    categoryId: 'other',
    learnedTimes: 1,
    setByUser: false,
    moneyIn: 'spread',
    ...over,
  });
  const live = { jars: new Set(['trip']), incomes: new Set(['jobs']) };

  it('puts the most recent first, those never seen last by name, and drops unusable places', () => {
    const rules = [
      rule('Cô Diệp'),
      rule('Studio Mây', { moneyIn: 'pay', incomeId: 'jobs', work: true }),
      rule('Anh Minh', { moneyIn: 'saved', savedTo: 'trip' }),
      rule('Old jar', { moneyIn: 'saved', savedTo: 'gone' }),
      rule('Shop', { moneyIn: null }),
      rule('Bảo'),
    ];
    const lastIn = lastMoneyIn([
      { merchant: 'Studio Mây', at: '2026-11-08T04:05:00.000Z' },
      { merchant: 'Anh Minh', at: '2026-11-01T02:00:00.000Z' },
      { merchant: 'ANH MINH', at: '2026-11-20T09:40:00.000Z' },
    ]);
    const senders = rememberedSenders(rules, lastIn, live);
    expect(senders.map((s) => s.merchant)).toEqual(['Anh Minh', 'Studio Mây', 'Bảo', 'Cô Diệp']);
    expect(senders[1]).toMatchObject({
      work: true,
      place: { moneyIn: 'pay', savedTo: null, incomeId: 'jobs' },
    });
    expect(senders[0]?.work).toBe(false);
  });
});

describe('what money that lands adds at the cap', () => {
  const day = '2026-11-21';
  const cover = {
    day,
    pool: 11_050_000,
    line: 300_000,
    cycle: payCycleOn(day, CALENDAR),
    anchor: CALENDAR,
    bills: [],
    jars: 0,
  };

  it('adds days, not money: 1.500.000 at 300.000 a day is five more, to 31 December', () => {
    expect(coverDays(cover)).toBe(36);
    expect(landingDays({ ...cover, amount: 1_500_000, cap: 300_000 })).toEqual({
      days: 5,
      to: '2026-12-31',
    });
  });

  it('takes what the coming months set aside on the days it reaches', () => {
    // 500.000 into jars on 1 December and again on 1 January: the second comes out of the money
    // that lands, so 2.100.000 adds six days, not seven.
    const withJars = { ...cover, jars: 500_000, pool: 11_550_000 };
    expect(coverDays(withJars)).toBe(36);
    expect(landingDays({ ...withJars, amount: 2_100_000, cap: 300_000 })).toEqual({
      days: 6,
      to: '2027-01-01',
    });
  });

  it('says nothing below the cap, with no cap, or with nothing added', () => {
    expect(landingDays({ ...cover, line: 250_000, amount: 1_500_000, cap: 300_000 })).toBeNull();
    expect(landingDays({ ...cover, amount: 1_500_000, cap: null })).toBeNull();
    expect(landingDays({ ...cover, amount: 0, cap: 300_000 })).toBeNull();
    expect(landingDays({ ...cover, amount: 40_000, cap: 300_000 })).toBeNull();
  });
});

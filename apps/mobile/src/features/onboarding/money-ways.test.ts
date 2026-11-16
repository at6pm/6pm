import { describe, expect, it } from '@jest/globals';

import { payEvents } from '@6pm/domain';

import {
  answersOfPlan,
  fortnightAnchor,
  lastsTo,
  moneyPages,
  planOfAnswers,
  startingWays,
  toggleWay,
  type MoneyWaysAnswers,
} from './money-ways';

const TODAY = '2026-11-15';
const start = startingWays(17_400_000, 4_000_000);
const answers = (over: Partial<MoneyWaysAnswers>): MoneyWaysAnswers => ({ ...start, ...over });

describe('How does money reach you?', () => {
  it('keeps the picks in the order the cards stand', () => {
    expect(toggleWay(['sell'], 'salary')).toEqual(['salary', 'sell']);
    expect(toggleWay(['salary', 'weekly'], 'salary')).toEqual(['weekly']);
  });

  it('asks each follow-up in turn, the ways that only land sharing one page', () => {
    expect(moneyPages(answers({ ways: [] }))).toEqual(['ways']);
    expect(moneyPages(answers({ ways: ['salary', 'weekly'] }))).toEqual(['ways', 'salary', 'pay']);
    expect(moneyPages(answers({ ways: ['landed', 'sell'] }))).toEqual(['ways', 'asItComes']);
    expect(moneyPages(answers({ ways: ['sell'] }))).toEqual(['ways', 'asItComes']);
    // "It varies" on the salary's strip leads to "Make it last until".
    expect(moneyPages(answers({ ways: ['salary'], payday: { kind: 'varies' } }))).toEqual([
      'ways',
      'salary',
      'asItComes',
    ]);
  });
});

describe('the plan the answers make', () => {
  it('saves a salary on a day it knows exactly as before: no incomes', () => {
    expect(
      planOfAnswers(answers({ ways: ['salary'], payday: { kind: 'sameDay', day: 30 } }), TODAY),
    ).toEqual({
      income: 17_400_000,
      payday: { kind: 'sameDay', day: 30 },
      incomes: null,
    });
  });

  it('holds a weekly pay, anchored on the calendar month, its month counted as four pays', () => {
    const plan = planOfAnswers(answers({ ways: ['weekly'] }), TODAY);
    expect(plan).toEqual({
      income: 16_000_000,
      payday: { kind: 'sameDay', day: 1 },
      incomes: {
        incomes: [
          { id: 'pay', name: null, rhythm: { kind: 'weekly', weekday: 4 }, amount: 4_000_000 },
        ],
        lastUntil: null,
        work: false,
      },
    });
  });

  it('anchors the month on a salary that leads, beside a weekly side pay', () => {
    const plan = planOfAnswers(
      answers({ ways: ['salary', 'weekly'], payday: { kind: 'lastDay' }, payAmount: 1_000_000 }),
      TODAY,
    );
    expect(plan.payday).toEqual({ kind: 'lastDay' });
    expect(plan.income).toBe(17_400_000 + 4_000_000);
  });

  it('counts a salary whose payday varies, and selling, as money that lands', () => {
    const plan = planOfAnswers(
      answers({
        ways: ['salary', 'sell'],
        payday: { kind: 'varies' },
        lastFor: { kind: 'days', days: 14 },
      }),
      TODAY,
    );
    expect(plan).toEqual({
      income: 0,
      payday: { kind: 'sameDay', day: 1 },
      incomes: {
        incomes: [
          { id: 'salary', name: null, rhythm: { kind: 'none' }, amount: 0 },
          { id: 'work', name: null, rhythm: { kind: 'none' }, amount: 0, fromWork: true },
        ],
        lastUntil: '2026-11-29',
        work: true,
      },
    });
  });

  it('starts a fortnight on this coming weekday or the one after', () => {
    // Sunday 15 Nov: the coming Friday is the 20th.
    expect(fortnightAnchor(TODAY, 4, false)).toBe('2026-11-20');
    expect(fortnightAnchor(TODAY, 4, true)).toBe('2026-11-27');
    const plan = planOfAnswers(
      answers({ ways: ['weekly'], every: 'everyTwoWeeks', fortnightAfter: true }),
      TODAY,
    );
    expect(plan.incomes?.incomes[0]?.rhythm).toEqual({
      kind: 'everyTwoWeeks',
      anchor: '2026-11-27',
    });
  });

  it('says the month’s end is its last day, and a picked day is that day', () => {
    const calendar = { kind: 'sameDay', day: 1 } as const;
    const landed = [{ id: 'landed', name: null, rhythm: { kind: 'none' }, amount: 0 }] as const;
    expect(lastsTo({ kind: 'monthEnd' }, TODAY, calendar, landed)).toBe('2026-11-30');
    expect(lastsTo({ kind: 'days', days: 7 }, TODAY, calendar, landed)).toBe('2026-11-22');
    expect(lastsTo({ kind: 'date', date: '2026-12-20' }, TODAY, calendar, landed)).toBe(
      '2026-12-20',
    );
  });

  it('names the counted pay’s day beside a salary, as the number divides to it', () => {
    const answers: MoneyWaysAnswers = {
      ...startingWays(15_000_000, 4_000_000),
      ways: ['salary', 'landed'],
      payday: { kind: 'sameDay', day: 25 },
    };
    const plan = planOfAnswers(answers, TODAY);
    const incomes = plan.incomes?.incomes ?? [];
    expect(lastsTo({ kind: 'monthEnd' }, TODAY, plan.payday, incomes)).toBe('2026-11-25');
  });
});

describe('the answers a plan already stands on', () => {
  it('ticks each income’s way with what it was saved with, and saves back the same plan', () => {
    const made = [
      answers({ ways: ['weekly'], payAmount: 4_000_000, weekday: 4 }),
      answers({ ways: ['salary', 'sell'], payday: { kind: 'sameDay', day: 30 } }),
      answers({ ways: ['landed'], lastFor: { kind: 'date', date: '2026-12-31' } }),
      answers({ ways: ['weekly'], every: 'twiceMonthly', twiceDays: [10, 25] }),
      answers({ ways: ['salary'], payday: { kind: 'varies' }, income: 9_000_000 }),
    ];
    for (const given of made) {
      const plan = planOfAnswers(given, TODAY);
      const saved = {
        income: plan.income,
        payday: plan.payday,
        ...(plan.incomes
          ? { incomes: plan.incomes.incomes, lastUntil: plan.incomes.lastUntil }
          : {}),
      };
      const again = answersOfPlan(saved, TODAY, start);
      expect(again.ways).toEqual(given.ways);
      expect(planOfAnswers(again, TODAY)).toEqual(plan);
    }
  });

  it('keeps a fortnight’s pays on their days', () => {
    for (const after of [false, true]) {
      const plan = planOfAnswers(
        answers({ ways: ['weekly'], every: 'everyTwoWeeks', weekday: 4, fortnightAfter: after }),
        TODAY,
      );
      const again = answersOfPlan(
        { income: plan.income, payday: plan.payday, incomes: plan.incomes?.incomes },
        '2026-11-23',
        start,
      );
      expect(again).toMatchObject({ every: 'everyTwoWeeks', weekday: 4 });
      const days = (made: typeof plan) =>
        payEvents(made.incomes?.incomes ?? [], '2026-11-23', '2026-12-31').map((e) => e.day);
      expect(days(planOfAnswers(again, '2026-11-23'))).toEqual(days(plan));
    }
  });

  it('is a salary on its payday for a plan never asked about its incomes', () => {
    const again = answersOfPlan({ income: 12_000_000, payday: { kind: 'varies' } }, TODAY, start);
    expect(again).toMatchObject({
      ways: ['salary'],
      income: 12_000_000,
      payday: { kind: 'varies' },
    });
    expect(moneyPages(again)).toEqual(['ways', 'salary', 'asItComes']);
  });
});

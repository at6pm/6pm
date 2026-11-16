import { describe, expect, it } from 'vitest';

import type { MerchantRuleRow } from '../contracts/local-rows';
import { dailyNumber, type DailyNumberInput } from '../plan/daily-number';
import { incomePeriod, type PeriodBill, type PeriodInput } from '../plan/income-period';
import { incomesInEffect, moneyNext, payEvents, type Income } from '../plan/incomes';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import { addDays, type LocalDate } from '../time/local-date';
import { moneyInAsk, paybackFor, type GivableSpend } from './money-in';
import { countsTowardDay } from './spend';
import {
  asItComesIncome,
  bankWorkOf,
  cashTakingsId,
  isClaimBack,
  nextBankWork,
  rememberedWorkRule,
  startingBankWork,
  wageIncome,
  wageLedger,
  walletOfCode,
  workDayOf,
  workDaysOf,
  workLanded,
  workMarkOf,
  workMonth,
  workOwed,
  workTotals,
  type WorkRow,
  type WorkSetting,
} from './work';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };
const FRI = '2026-11-13';

/** Ngân sells bánh from home: MB is always work, Techcombank sometimes, MoMo never. */
const NGAN: WorkSetting = {
  mode: 'asItComes',
  banks: { MB: 'always', TCB: 'sometimes', MOMO: 'never', CASH: 'sometimes' },
};
const shop = asItComesIncome(null);

const takings = (day: LocalDate, amount: number, over: Partial<WorkRow> = {}): WorkRow => ({
  day,
  amount,
  status: 'kept',
  direction: 'in',
  forWork: true,
  source: 'alert',
  ...over,
});
const cost = (day: LocalDate, amount: number, over: Partial<WorkRow> = {}): WorkRow => ({
  day,
  amount,
  status: 'kept',
  direction: 'out',
  forWork: true,
  source: 'alert',
  ...over,
});

/**
 * Fri 13 Nov as the canvas draws it: six transfers to MB and Chị Thảo's 850.000 to Techcombank
 * (1.490.000), the cash typed at the close (610.000), and three costs (1.150.000).
 */
const friday: WorkRow[] = [
  ...[150_000, 120_000, 100_000, 100_000, 90_000, 80_000].map((a) => takings(FRI, a)),
  takings(FRI, 850_000),
  takings(FRI, 610_000, { source: 'cash' }),
  cost(FRI, 412_000),
  cost(FRI, 538_000),
  cost(FRI, 200_000),
];

describe('the work mark', () => {
  it('reads each bank’s answer from the wallet a spend keeps', () => {
    expect(walletOfCode('MB')).toBe('MB Bank');
    expect(walletOfCode('CASH')).toBe('Cash');
    expect(walletOfCode('name:Chase')).toBe('Chase');
    expect(bankWorkOf('MBBank', NGAN.banks)).toBe('always');
    expect(bankWorkOf('MB Bank', NGAN.banks)).toBe('always');
    expect(bankWorkOf('Techcombank', NGAN.banks)).toBe('sometimes');
    expect(bankWorkOf('Cash', NGAN.banks)).toBe('sometimes');
    expect(bankWorkOf('VPBank', NGAN.banks)).toBeNull();
    expect(bankWorkOf(null, NGAN.banks)).toBeNull();
  });

  it('cycles blank → dashed → solid → blank, and starts every bank and cash dashed', () => {
    expect(nextBankWork('never')).toBe('sometimes');
    expect(nextBankWork('sometimes')).toBe('always');
    expect(nextBankWork('always')).toBe('never');
    expect(startingBankWork(['MB', 'TCB', 'MOMO'])).toEqual({
      MB: 'sometimes',
      TCB: 'sometimes',
      MOMO: 'sometimes',
      CASH: 'sometimes',
    });
    expect(startingBankWork(['MB', 'CASH'], { MB: 'always' })).toEqual({
      MB: 'always',
      CASH: 'sometimes',
    });
  });

  it('arrives inked on “always”, is offered on “sometimes”, and never on “never”', () => {
    const at = (wallet: string, rule?: Pick<MerchantRuleRow, 'work'>) =>
      workMarkOf({ work: NGAN, wallet, rule });
    expect(at('MBBank')).toBe('inked');
    expect(at('Techcombank')).toBe('offered');
    expect(at('MoMo')).toBe('none');
    // A bank never answered is asked about like "sometimes".
    expect(at('VPBank')).toBe('offered');
    // Remembered either way: stamped, it arrives inked; left blank, it stops being offered.
    expect(at('Techcombank', { work: true })).toBe('inked');
    expect(at('Techcombank', { work: false })).toBe('none');
    // The bank's own answer wins over a shop's.
    expect(at('MoMo', { work: true })).toBe('none');
    expect(at('MBBank', { work: false })).toBe('inked');
  });

  it('offers nothing to someone who has not turned work on', () => {
    expect(workMarkOf({ work: undefined, wallet: 'MBBank', rule: { work: true } })).toBe('none');
    expect(workMarkOf({ work: null, wallet: 'Techcombank' })).toBe('none');
  });

  it('remembers a shop or sender either way, keeping what its rule already knew', () => {
    const rule: MerchantRuleRow = {
      merchantKey: 'chị thảo',
      merchant: 'Chị Thảo',
      categoryId: 'income',
      learnedTimes: 0,
      setByUser: false,
      moneyIn: 'spread',
    };
    expect(rememberedWorkRule(rule, 'Chị Thảo', 'income', true)).toEqual({ ...rule, work: true });
    expect(rememberedWorkRule(null, ' Bách Hoá Xanh ', 'groceries', false)).toEqual({
      merchantKey: 'bách hoá xanh',
      merchant: 'Bách Hoá Xanh',
      categoryId: 'groceries',
      learnedTimes: 0,
      setByUser: false,
      work: false,
    });
    expect(rememberedWorkRule(null, '  ', 'groceries', true)).toBeNull();
  });
});

describe('a work cost and the number', () => {
  it('never counts toward the day, for anyone', () => {
    expect(
      countsTowardDay(
        { amount: 412_000, category: 'groceries', status: 'kept', forWork: true },
        new Set(),
      ),
    ).toBe(false);
  });

  it('is a claim back only for someone who has not turned work on', () => {
    expect(isClaimBack({ forWork: true }, false)).toBe(true);
    expect(isClaimBack({ forWork: true }, true)).toBe(false);
    expect(isClaimBack({ forWork: false }, false)).toBe(false);
  });

  const claim: GivableSpend = {
    id: 'bhx',
    day: '2026-11-10',
    amount: 412_000,
    merchant: 'Bách Hoá Xanh',
    status: 'kept',
    forWork: true,
  };
  const money = { day: FRI, amount: 412_000, merchant: 'Chị Thảo' };

  it('is never read as a claim repaid once work is on (`for_work` means a work cost then)', () => {
    expect(paybackFor(money, [claim])).toBe('bhx');
    expect(paybackFor(money, [claim], { claims: false })).toBeNull();
    const context = { income: 0, cycle: payCycleOn(FRI, CALENDAR), spends: [claim] };
    expect(moneyInAsk(money, context)).toEqual({ kind: 'payback', spendId: 'bhx' });
    expect(moneyInAsk(money, { ...context, work: true })).toBeNull();
  });

  it('still lets a split be paid back with work on', () => {
    const split: GivableSpend = { ...claim, id: 'dinner', forWork: false, note: 'Split 3 ways' };
    expect(paybackFor(money, [claim, split], { claims: false })).toBe('dinner');
  });
});

describe('a seller’s day: Ngân, Fri 13 Nov', () => {
  it('adds the transfers, the cash and the costs into what the work kept', () => {
    const day = workDayOf(friday, FRI);
    expect(day).toEqual({
      day: FRI,
      transfers: 7,
      caught: 1_490_000,
      cash: 610_000,
      takings: 2_100_000,
      costCount: 3,
      costs: 1_150_000,
      kept: 950_000,
    });
  });

  it('leaves out what was not mine or deleted, and anything not stamped', () => {
    const rows = [
      ...friday,
      takings(FRI, 500_000, { status: 'skipped' }),
      cost(FRI, 90_000, { status: 'deleted' }),
      takings(FRI, 200_000, { forWork: false }),
      cost(FRI, 45_000, { forWork: false }),
    ];
    expect(workDayOf(rows, FRI).kept).toBe(950_000);
  });

  it('keeps one cash line a day under the day’s own id', () => {
    expect(cashTakingsId(FRI)).toBe('takings-cash-2026-11-13');
  });

  it('lists only the days with work, oldest first', () => {
    const rows = [...friday, takings('2026-11-12', 1_120_000), cost('2026-11-12', 695_000)];
    expect(workDaysOf(rows, '2026-11-09', '2026-11-15').map((d) => [d.day, d.kept])).toEqual([
      ['2026-11-12', 425_000],
      [FRI, 950_000],
    ]);
  });
});

describe('what work kept lands at the close', () => {
  const closed = new Set<LocalDate>(['2026-11-12', FRI]);

  it('counts closed days only, takings once kept and costs as they come', () => {
    const rows = [...friday, takings('2026-11-14', 900_000), cost('2026-11-14', 100_000)];
    expect(workLanded(rows, closed, '2026-11-01', '2026-11-14')).toBe(950_000);
    // Takings still caught on a closed day wait for the next close.
    const late = [...friday, takings(FRI, 300_000, { status: 'caught' })];
    expect(workLanded(late, closed, '2026-11-01', FRI)).toBe(950_000);
    // A cost not yet confirmed already counts, as unconfirmed spending does.
    const waiting = [...friday, cost(FRI, 50_000, { status: 'caught' })];
    expect(workLanded(waiting, closed, '2026-11-01', FRI)).toBe(900_000);
  });

  it('takes a day that cost more than it took from the days that kept money', () => {
    const stock = [cost('2026-11-12', 400_000), ...friday];
    expect(workLanded(stock, closed, '2026-11-01', FRI)).toBe(550_000);
  });

  it('never goes below nothing: a month that lost money leaves the person’s number alone', () => {
    expect(workLanded([cost(FRI, 2_000_000)], closed, '2026-11-01', FRI)).toBe(0);
  });
});

describe('the work’s month: November to the 13th', () => {
  /** In 24,6tr, out 13,9tr, kept 10,7tr, spread over the thirteen days. */
  const month: WorkRow[] = [
    ...Array.from({ length: 12 }, (_, i) => takings(addDays('2026-11-01', i), 22_500_000 / 12)),
    ...Array.from({ length: 12 }, (_, i) => cost(addDays('2026-11-01', i), 12_750_000 / 12)),
    ...friday,
  ];

  it('is in, out and kept', () => {
    expect(workTotals(month, '2026-11-01', FRI)).toEqual({
      in: 24_600_000,
      out: 13_900_000,
      kept: 10_700_000,
    });
  });

  it('as it comes: what was kept is what landed', () => {
    const closed = new Set(Array.from({ length: 13 }, (_, i) => addDays('2026-11-01', i)));
    expect(
      workMonth({
        rows: month,
        closed,
        from: '2026-11-01',
        to: FRI,
        work: NGAN,
        incomes: [shop],
        anchor: CALENDAR,
      }),
    ).toEqual({
      in: 24_600_000,
      out: 13_900_000,
      kept: 10_700_000,
      landed: 10_700_000,
      waiting: 0,
    });
  });

  it('paying herself 1.500.000 each Saturday: the wages land and the rest waits', () => {
    const wage = wageIncome(shop, 1_500_000, 5);
    expect(wage).toEqual({
      id: 'work',
      name: null,
      rhythm: { kind: 'weekly', weekday: 5 },
      amount: 1_500_000,
      fromWork: true,
    });
    // The wage is paid from what the shop kept on the days closed before it.
    const closed = new Set(Array.from({ length: 13 }, (_, i) => addDays('2026-11-01', i)));
    expect(
      wageLedger({
        incomes: [wage],
        rows: month,
        closed,
        from: '2026-11-01',
        to: FRI,
        anchor: CALENDAR,
      }).paid,
    ).toEqual([{ incomeId: 'work', day: '2026-11-07', amount: 1_500_000 }]);
    expect(
      workMonth({
        rows: month,
        closed,
        from: '2026-11-01',
        to: FRI,
        work: { ...NGAN, mode: 'payMyself' },
        incomes: [wage],
        anchor: CALENDAR,
      }),
    ).toEqual({
      in: 24_600_000,
      out: 13_900_000,
      kept: 10_700_000,
      landed: 1_500_000,
      waiting: 9_200_000,
    });
  });

  it('who has not paid: owed lines on a work spend, oldest first', () => {
    const spends = new Map([
      ['banh', { forWork: true }],
      ['dinner', { forWork: false }],
    ]);
    const lines = [
      { id: 'b', spendId: 'banh', day: '2026-11-11' },
      { id: 'd', spendId: 'dinner', day: '2026-11-05' },
      { id: 'a', spendId: 'banh', day: '2026-11-07' },
    ];
    expect(workOwed(lines, spends).map((l) => l.id)).toEqual(['a', 'b']);
  });
});

describe('the seller’s number (the canvas’s Fri 13 Nov)', () => {
  /** Rent and the rest 3,6tr, jars 1tr: bills and jars 4,6tr. */
  const bills: PeriodBill[] = [
    { amount: 3_000_000, dueDay: 5, paidCycle: null },
    { amount: 600_000, dueDay: 20, paidCycle: null },
  ];
  /** Twelve closed days this month: 3,97tr spent by the person (never the shop). */
  const spentDays = Array.from({ length: 12 }, (_, i) => ({
    day: addDays('2026-11-01', i),
    spent: i === 0 ? 3_970_000 - 330_000 * 11 : 330_000,
  }));

  function numberOn(workKept: number, today: DailyNumberInput['today'] = []) {
    const input: PeriodInput = {
      day: FRI,
      cycle: payCycleOn(FRI, CALENDAR),
      anchor: CALENDAR,
      incomes: [shop],
      bills,
      jars: 1_000_000,
      joinedOn: '2026-09-01',
      lastUntil: null,
      placed: [],
      inHand: 6_800_000,
      closedDays: spentDays,
      workKept,
    };
    const period = incomePeriod(input);
    return {
      period,
      day: dailyNumber({
        plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
        period: {
          credited: period.credited,
          reserved: period.reserved,
          cap: period.cap,
          minDays: period.minDays,
          ahead: period.ahead,
        },
        moneyIn: period.workMoneyIn,
        spentBefore: 3_970_000,
        today,
        notDaily: new Set(),
        daysLeft: period.daysLeft,
      }),
    };
  }

  it('lands what work kept as money that only lands: carried, kept, less bills and jars', () => {
    const { period, day } = numberOn(9_750_000);
    expect(period.kind).toBe('landed');
    expect(period.credited).toBe(16_550_000);
    expect(period.reserved).toBe(4_600_000);
    expect(period.workMoneyIn).toBe(0);
    expect(day.startFree).toBe(7_980_000);
    // Through Mon 30 Nov, today included: 18 days; her cap is 1,5 × 330.833 = 496.000.
    expect(period.cap).toBe(496_000);
    expect(period.daysLeft).toBe(17);
    expect(day.line).toBe(443_000);
  });

  it('Friday’s 950.000 kept adds to the days from tomorrow, up to her cap', () => {
    const spent = [{ amount: 240_000, category: 'food', status: 'kept' as const }];
    const before = numberOn(9_750_000, spent).day;
    const after = numberOn(9_750_000 + 950_000, spent).day;
    expect(before.tomorrow).toBe(455_000);
    expect(after.tomorrow).toBe(496_000);
    expect(after.tomorrow - before.tomorrow).toBe(41_000);
  });

  it('beside a counted pay, what work kept is money in, not this month’s pay', () => {
    const salary: Income = {
      id: 'salary',
      name: null,
      rhythm: { kind: 'monthly', day: 30 },
      amount: 17_400_000,
    };
    const period = incomePeriod({
      day: FRI,
      cycle: payCycleOn(FRI, { kind: 'sameDay', day: 30 }),
      anchor: { kind: 'sameDay', day: 30 },
      incomes: [salary, shop],
      bills,
      jars: 1_000_000,
      lastUntil: null,
      workKept: 950_000,
    });
    expect(period.kind).toBe('monthly');
    expect(period.credited).toBe(17_400_000);
    expect(period.workMoneyIn).toBe(950_000);
  });

  it('with no work kept, the period is as it was', () => {
    const { period } = numberOn(0);
    expect(period.credited).toBe(6_800_000);
  });
});

describe('Pay myself takes effect at the next close (2.500.000 each Saturday)', () => {
  const SUN = '2026-11-15';
  const SAT = '2026-11-21';
  /** Sunday's close: takings 2.250.000, work costs 550.000, kept 1.700.000. */
  const sunday = [takings(SUN, 2_250_000), cost(SUN, 550_000)];
  const ledger = (
    from: LocalDate,
    rows: readonly WorkRow[],
    closedDays: LocalDate[],
    to: LocalDate,
  ) =>
    wageLedger({
      incomes: [wageIncome(shop, 2_500_000, 5, from)],
      rows,
      closed: new Set(closedDays),
      from: '2026-11-01',
      to,
      anchor: CALENDAR,
    });

  it('starts the wage at the next close: no wage before it, and none paid at once', () => {
    const wage = wageIncome(shop, 2_500_000, 5, SUN);
    expect(wage.from).toBe(SUN);
    // Saturday 14 is before the switch: not a pay, so nothing is "paid yesterday".
    expect(payEvents([wage], '2026-11-01', '2026-11-28', CALENDAR).map((e) => e.day)).toEqual([
      SAT,
      '2026-11-28',
    ]);
    // Until the first wage comes the plan is counted as before.
    expect(incomesInEffect([wage], SUN)).toEqual([]);
    expect(incomesInEffect([wage], '2026-11-20')).toEqual([]);
    expect(incomesInEffect([wage], SAT)).toEqual([wage]);
    expect(moneyNext(SUN, payCycleOn(SUN, CALENDAR), [wage], null).on).toBe('2026-11-30');
    // Changing the wage later keeps the day it began.
    expect(wageIncome(wage, 3_000_000, 4, '2026-11-20').from).toBe(SUN);
  });

  it('pays what the shop holds when it holds less: 1.700.000 of 2.500.000, 800.000 owed', () => {
    expect(ledger(SUN, sunday, [SUN], SAT)).toEqual({
      paid: [{ incomeId: 'work', day: SAT, amount: 1_700_000 }],
      owed: 800_000,
      held: 0,
      since: SUN,
    });
    expect(
      workMonth({
        rows: sunday,
        closed: new Set([SUN]),
        from: '2026-11-01',
        to: SAT,
        work: { ...NGAN, mode: 'payMyself' },
        incomes: [wageIncome(shop, 2_500_000, 5, SUN)],
        anchor: CALENDAR,
      }),
    ).toMatchObject({ kept: 1_700_000, landed: 1_700_000, waiting: 0 });
  });

  it('pays what is owed first with the next wage, never leaving the shop below nothing', () => {
    const week = [...sunday, takings('2026-11-23', 3_400_000), cost('2026-11-23', 400_000)];
    // Saturday 28 owes 2.500.000 and the 800.000 carried; the shop holds 3.000.000.
    expect(ledger(SUN, week, [SUN, '2026-11-23'], '2026-11-28')).toEqual({
      paid: [
        { incomeId: 'work', day: SAT, amount: 1_700_000 },
        { incomeId: 'work', day: '2026-11-28', amount: 3_000_000 },
      ],
      owed: 300_000,
      held: 0,
      since: SUN,
    });
    // A good week pays the wage whole and what is above it waits with the shop.
    const good = [...week, takings('2026-11-24', 2_000_000)];
    expect(ledger(SUN, good, [SUN, '2026-11-23', '2026-11-24'], '2026-11-28')).toMatchObject({
      owed: 0,
      held: 1_700_000,
    });
  });

  it('switched after Sunday closed: Sunday’s 1.700.000 already landed; the wage starts Monday', () => {
    const MON = '2026-11-16';
    expect(ledger(MON, sunday, [SUN], SAT)).toEqual({
      paid: [{ incomeId: 'work', day: SAT, amount: 0 }],
      owed: 2_500_000,
      held: 0,
      since: MON,
    });
    expect(
      workMonth({
        rows: sunday,
        closed: new Set([SUN]),
        from: '2026-11-01',
        to: SAT,
        work: { ...NGAN, mode: 'payMyself' },
        incomes: [wageIncome(shop, 2_500_000, 5, MON)],
        anchor: CALENDAR,
      }),
    ).toMatchObject({ landed: 1_700_000, waiting: 0 });
  });
});

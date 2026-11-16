import { describe, expect, it } from 'vitest';

import { dailyNumber, type DailyNumberInput } from '../plan/daily-number';
import { incomePeriod, type PeriodInput } from '../plan/income-period';
import { hasPayday } from '../plan/next-pay';
import { incomesOfMonth, SALARY_INCOME_ID, type Income } from '../plan/incomes';
import { payCycleOn, type Payday } from '../plan/pay-cycle';
import { asItComesIncome, isFreelanceIncome, workMoneyOn, workTotals } from './work';
import {
  heldBackList,
  workYearCsv,
  yearWork,
  type WorkYearCsvLabels,
  type YearWorkRow,
} from './work-year';

const CALENDAR: Payday = { kind: 'sameDay', day: 1 };

/** Vy, a freelancer: money that comes when it comes. */
const landed: Income = { id: 'landed', name: null, rhythm: { kind: 'none' }, amount: 0 };
/** A salary whose day varies: counted as it lands, but a salary, not a client's money. */
const varies: Income = { id: SALARY_INCOME_ID, name: null, rhythm: { kind: 'none' }, amount: 0 };
const monthly: Income = {
  id: SALARY_INCOME_ID,
  name: null,
  rhythm: { kind: 'monthly', day: 25 },
  amount: 18_000_000,
};
const weekly: Income = {
  id: 'pay',
  name: null,
  rhythm: { kind: 'weekly', weekday: 4 },
  amount: 4_000_000,
};

describe('work money: who has it', () => {
  it('a freelancer has it from the answer "It comes when it comes", with nothing more asked', () => {
    expect(isFreelanceIncome(landed)).toBe(true);
    expect(workMoneyOn({ incomes: [landed] })).toBe(true);
  });

  it('a seller has it', () => {
    expect(workMoneyOn({ incomes: [asItComesIncome(null)], work: { mode: 'asItComes' } })).toBe(
      true,
    );
  });

  it('a monthly salary with no work, a salary that varies and a weekly pay have none of it', () => {
    expect(workMoneyOn({})).toBe(false);
    expect(workMoneyOn({ incomes: undefined })).toBe(false);
    expect(workMoneyOn({ incomes: [monthly] })).toBe(false);
    expect(workMoneyOn({ incomes: [varies] })).toBe(false);
    expect(workMoneyOn({ incomes: [weekly] })).toBe(false);
    expect(isFreelanceIncome(varies)).toBe(false);
    expect(isFreelanceIncome(asItComesIncome(null))).toBe(false);
  });
});

/** Work rows: kept unless said, stamped, by alert. */
const workIn = (day: string, amount: number, over: Partial<YearWorkRow> = {}): YearWorkRow => ({
  day,
  amount,
  status: 'kept',
  direction: 'in',
  forWork: true,
  source: 'alert',
  ...over,
});
const workCost = (day: string, amount: number, over: Partial<YearWorkRow> = {}): YearWorkRow => ({
  ...workIn(day, amount, over),
  direction: 'out',
  ...over,
});

describe('what counts: kept money, never money still waiting for the close', () => {
  // Sunday closed: 8.500.000 of takings kept, 400.000 of costs. Tuesday: 1.000.000 caught, waiting.
  const rows: YearWorkRow[] = [
    workIn('2026-11-15', 8_500_000),
    workCost('2026-11-15', 400_000),
    workIn('2026-11-16', 1_500_000),
    workIn('2026-11-17', 1_000_000, { status: 'caught' }),
    workCost('2026-11-17', 90_000, { status: 'caught' }),
  ];

  it('the Work card and the Diary’s week leave the waiting takings out', () => {
    expect(workTotals(rows, '2026-11-01', '2026-11-17')).toEqual({
      in: 10_000_000,
      out: 400_000,
      kept: 9_600_000,
    });
  });

  it('the year, its held-back list and its file leave them out too', () => {
    const held = [
      ...rows,
      workIn('2026-11-17', 18_000_000, { status: 'caught', heldBack: 2_000_000 }),
    ];
    expect(yearWork(held, 2026)).toMatchObject({
      billed: 10_000_000,
      heldBack: 0,
      costs: 400_000,
      kept: 9_600_000,
    });
    expect(heldBackList(held, 2026)).toEqual([]);
    const labels: WorkYearCsvLabels = {
      income: {
        date: 'd',
        from: 'f',
        job: 'j',
        billed: 'b',
        heldBack: 'h',
        landed: 'l',
        certificate: 'c',
      },
      costs: { date: 'd', to: 't', category: 'c', amount: 'a', note: 'n' },
    };
    const csv = workYearCsv(
      held.map((r, i) => ({ ...r, id: `r${i}`, merchant: 'X' })),
      2026,
      labels,
    );
    expect(csv.incomeRows).toBe(2);
  });

  it('counts the same money once it is kept', () => {
    const kept = rows.map((r) => ({ ...r, status: 'kept' as const }));
    expect(workTotals(kept, '2026-11-01', '2026-11-17')).toMatchObject({
      in: 11_000_000,
      out: 490_000,
    });
    expect(yearWork(kept, 2026).billed).toBe(11_000_000);
  });
});

describe('a wage started part-way through a month that only lands', () => {
  const wage: Income = {
    id: 'work',
    name: null,
    rhythm: { kind: 'weekly', weekday: 1 },
    amount: 4_500_000,
    fromWork: true,
    from: '2026-11-16',
  };

  it('is a landing in the month it began in, and the weekly pay it was set as after', () => {
    expect(incomesOfMonth([wage], '2026-11-17', '2026-11-01')).toEqual([{ ...wage, amount: 0 }]);
    expect(incomesOfMonth([wage], '2026-12-01', '2026-12-01')).toEqual([wage]);
  });

  it('is left as it was beside a pay that is counted on, or begun on the month’s first day', () => {
    expect(incomesOfMonth([weekly, wage], '2026-11-17', '2026-11-01')).toEqual([weekly, wage]);
    const fromFirst = { ...wage, from: '2026-11-01' };
    expect(incomesOfMonth([fromFirst], '2026-11-17', '2026-11-01')).toEqual([fromFirst]);
  });

  it('keeps the month as money that lands: the jars hold what they held', () => {
    // The seller’s Tuesday: Sunday kept 8.100.000 as it came; the first wage paid 1.500.000.
    const day = '2026-11-17';
    const input: PeriodInput = {
      day,
      cycle: payCycleOn(day, CALENDAR),
      anchor: CALENDAR,
      incomes: incomesOfMonth([wage], day, '2026-11-01'),
      bills: [{ amount: 3_000_000, dueDay: 26, paidCycle: null }],
      jars: 500_000,
      joinedOn: '2026-11-01',
      lastUntil: null,
      placed: [{ incomeId: 'work', day, amount: 1_500_000 }],
      workKept: 8_100_000,
      closedDays: [],
    };
    const period = incomePeriod(input);
    expect(period).toMatchObject({
      kind: 'landed',
      credited: 9_600_000,
      reserved: 3_500_000,
      bills: 3_000_000,
      jars: 500_000,
      on: '2026-11-30',
    });
    // As a weekly pay from Tuesday it would have been a quarter of the jars and a slip "left from
    // last week" of everything Sunday kept.
    const asWeekly = incomePeriod({ ...input, incomes: [wage] });
    expect(asWeekly.kind).toBe('counted');
    expect(asWeekly.jars).toBe(125_000);
  });
});

describe('a closed day keeps the line it closed with', () => {
  const base: DailyNumberInput = {
    plan: { income: 0, bills: 0, futureYou: 0, occasions: 0, topUps: 0 },
    spentBefore: 0,
    // The freelancer’s Sunday: 300.000 spent on a 276.000 line, 24.000 over.
    today: [{ amount: 300_000, category: 'food', status: 'kept' }],
    notDaily: new Set(),
    daysLeft: 15,
    period: { credited: 4_416_000, reserved: 0 },
  };

  it('stays over when money reaches the days during the close, which tomorrow gets', () => {
    const open = dailyNumber(base);
    expect(open).toMatchObject({ line: 276_000, safe: -24_000 });
    // The close keeps 1.800.000 more: the day stays 24.000 over, tomorrow has it.
    const closed = dailyNumber({
      ...base,
      period: { credited: 6_216_000, reserved: 0, closedLine: open.line },
    });
    expect(closed).toMatchObject({ line: 276_000, safe: -24_000, spent: 300_000 });
    expect(closed.tomorrow).toBe(394_000);
    // Without it the day’s own line moved after its close.
    expect(dailyNumber({ ...base, period: { credited: 6_216_000, reserved: 0 } }).line).toBe(
      388_000,
    );
  });
});

describe('the jars fill each payday, or each month', () => {
  it('each month for money that only lands, each payday for a pay counted on', () => {
    expect(hasPayday({ incomes: [landed] })).toBe(false);
    expect(hasPayday({ incomes: [varies] })).toBe(false);
    expect(hasPayday({ incomes: [weekly] })).toBe(true);
    expect(hasPayday({ incomes: [monthly, landed] })).toBe(true);
    // A plan never asked is as it always was.
    expect(hasPayday({})).toBe(true);
  });
});

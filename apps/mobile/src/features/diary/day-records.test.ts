import { describe, expect, it } from '@jest/globals';

import { formatVnd, restateClosedDays, type SpendRow } from '@6pm/domain';

import type { Labels } from '../today/today-view';
import { countedSpendOf } from './jar-lines';
import { dayRecordsOf, dayRowViews, type DayRecordsData } from './day-records';

const DAY = '2026-11-14';

const spend = (id: string, amount: number, extra: Partial<SpendRow> = {}): SpendRow => ({
  id,
  day: DAY,
  at: `${DAY}T05:00:00.000Z`,
  amount,
  categoryId: 'food',
  merchant: id,
  note: null,
  source: 'qr',
  status: 'kept',
  previousStatus: null,
  wallet: null,
  forWork: false,
  detail: null,
  foreignAmount: null,
  createdAt: `${DAY}T05:00:00.000Z`,
  updatedAt: `${DAY}T05:00:00.000Z`,
  ...extra,
});

const data = (spends: SpendRow[], extra: Partial<DayRecordsData> = {}): DayRecordsData => ({
  spends,
  givenBack: {},
  voided: [],
  closed: true,
  ...extra,
});

const labels: Labels = {
  source: (s) => s,
  tag: () => null,
  time: (iso) => iso.slice(11, 16),
  money: { full: formatVnd },
};
const words = {
  back: (day: string) => `BACK ${day}`,
  voided: (why: 'failed' | 'reversal') => why.toUpperCase(),
};

describe('dayRecordsOf', () => {
  it('totals a closed day as its receipt and the calendar restate it', () => {
    const spends = [
      spend('lunch', 120_000),
      // The jar held 30k of the coffee: only the rest counted that day.
      spend('coffee', 50_000, { fromPot: 'dalat', fromPotAmount: 30_000 }),
      spend('rent', 4_000_000, { paysBill: 'rent' }),
      spend('tools', 90_000, { forWork: true }),
      spend('gift', 300_000, { categoryId: 'gifts' }),
      spend('waiting', 40_000, { status: 'caught' }),
      spend('notMine', 70_000, { status: 'skipped' }),
      spend('pay', 9_000_000, { direction: 'in' }),
    ];
    const notDaily = new Set(['gifts']);
    const day = dayRecordsOf(data(spends), notDaily);
    expect(day.total).toBe(140_000);
    const [restated] = restateClosedDays(
      [{ day: DAY, spent: 0 }],
      spends.map((s) => ({ ...countedSpendOf(s), day: s.day })),
      notDaily,
      { from: DAY, to: DAY },
    );
    expect(day.total).toBe(restated?.spent);
    // Every record shows, counted or not; only kept ones have jar lines under them.
    expect(day.records).toHaveLength(spends.length);
    expect(day.kept.map((s) => s.id)).not.toContain('waiting');
    expect(day.brought).toBe(false);
  });

  it('follows an edit and a delete on a closed day', () => {
    const before = dayRecordsOf(data([spend('lunch', 120_000), spend('taxi', 60_000)]), new Set());
    expect(before.total).toBe(180_000);
    const after = dayRecordsOf(data([spend('lunch', 100_000)]), new Set());
    expect(after.total).toBe(100_000);
  });

  it('counts a brought-in day as the calendar outlines it', () => {
    const day = dayRecordsOf(
      data(
        [
          spend('pho', 55_000, { source: 'import' }),
          spend('salary', 1_000_000, { source: 'import', direction: 'in' }),
        ],
        {
          closed: false,
        },
      ),
      new Set(),
    );
    expect(day.brought).toBe(true);
    expect(day.total).toBe(55_000);
  });
});

describe('dayRowViews', () => {
  it('tags a spend given back and lists voided payments struck through after the rest', () => {
    const day = dayRecordsOf(
      data([spend('shoes', 800_000), spend('lunch', 60_000)], {
        givenBack: { shoes: '2026-11-15' },
        voided: [{ spend: spend('double', 60_000, { status: 'deleted' }), why: 'reversal' }],
      }),
      new Set(),
    );
    const views = dayRowViews(day, { shoes: '2026-11-15' }, [], labels, words);
    expect(views.rows.map((r) => [r.id, r.tag])).toEqual([
      ['shoes', 'BACK 2026-11-15'],
      ['lunch', null],
    ]);
    expect(views.voided).toEqual([
      expect.objectContaining({
        id: 'double',
        skipped: true,
        reviewable: false,
        first: false,
        tag: 'REVERSAL',
      }),
    ]);
  });

  it('draws a voided payment as the first row when nothing else is left', () => {
    const day = dayRecordsOf(
      data([], {
        voided: [{ spend: spend('double', 60_000, { status: 'deleted' }), why: 'failed' }],
      }),
      new Set(),
    );
    const views = dayRowViews(day, {}, [], labels, words);
    expect(views.rows).toEqual([]);
    expect(views.voided[0]?.first).toBe(true);
    expect(day.total).toBe(0);
  });
});

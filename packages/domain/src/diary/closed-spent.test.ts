import { describe, expect, it } from 'vitest';

import { restateClosedDays } from './closed-spent';

const kept = (day: string, amount: number, more: object = {}) => ({
  day,
  amount,
  category: 'food',
  status: 'kept' as const,
  ...more,
});
const loaded = { from: '2026-10-01', to: '2026-10-31' };

describe('restateClosedDays', () => {
  it('adds a spend kept on a closed day after its close', () => {
    const closed = [{ day: '2026-10-19', spent: 413_269, line: 500_000 }];
    const spends = [kept('2026-10-19', 413_269), kept('2026-10-19', 41_000)];
    expect(restateClosedDays(closed, spends, new Set(), loaded)).toEqual([
      { day: '2026-10-19', spent: 454_269, line: 500_000 },
    ]);
  });

  it('counts only what the receipt lists: kept, spending, daily', () => {
    const closed = [{ day: '2026-10-20', spent: 0 }];
    const spends = [
      kept('2026-10-20', 50_000),
      kept('2026-10-20', 9_000, { status: 'caught' }),
      kept('2026-10-20', 20_000, { status: 'skipped' }),
      kept('2026-10-20', 300_000, { direction: 'in' }),
      kept('2026-10-20', 70_000, { forWork: true }),
      kept('2026-10-20', 200_000, { paysBill: 'rent' }),
      kept('2026-10-20', 80_000, { category: 'rent' }),
    ];
    expect(restateClosedDays(closed, spends, new Set(['rent']), loaded)[0]?.spent).toBe(50_000);
  });

  it('keeps the stored total for days whose spends were not loaded', () => {
    const closed = [{ day: '2026-09-30', spent: 120_000 }];
    expect(restateClosedDays(closed, [], new Set(), loaded)[0]?.spent).toBe(120_000);
  });

  it('returns the same row when nothing changed', () => {
    const row = { day: '2026-10-21', spent: 32_000 };
    expect(restateClosedDays([row], [kept('2026-10-21', 32_000)], new Set(), loaded)[0]).toBe(row);
  });
});

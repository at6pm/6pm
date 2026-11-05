import { describe, expect, it } from 'vitest';

import { paydayPreview } from './payday-preview';
import { FUTURE_YOU_POT_ID } from './pots';

const pot = {
  kind: 'occasion' as const,
  goal: 6_000_000,
  neededBy: '2027-01',
  share: null,
  paused: false,
  monthly: null,
  archivedAt: null,
};

const futureYouJar = {
  ...pot,
  id: FUTURE_YOU_POT_ID,
  kind: 'goal' as const,
  goal: 0,
  neededBy: null,
};

const base = {
  payday: '2026-11-30',
  rule: { kind: 'lastDay' as const },
  income: 20_000_000,
  futureYou: 2_000_000,
  bills: [{ amount: 3_000_000, paidCycle: null }],
  pots: [
    futureYouJar,
    { ...pot, id: 'dalat' },
    { ...pot, id: 'phone', goal: 0, neededBy: null, monthly: 500_000 },
  ],
  saved: { dalat: 3_000_000 },
};

describe("payday's notification", () => {
  it('adds up what every jar takes on the payday and the line it leaves to the next one', () => {
    // Đà Lạt still misses 3tr with December's the last payday before its month: all of it; the
    // phone jar 500k; Future you 2tr. 11,5tr free over the 32 days to 31 Dec.
    expect(paydayPreview(base)).toEqual({ jars: 5_500_000, daily: 359_000, until: '2026-12-31' });
  });

  it('leaves out a jar already full, one paused and one deleted', () => {
    const preview = paydayPreview({
      ...base,
      pots: [
        futureYouJar,
        { ...pot, id: 'dalat' },
        { ...pot, id: 'phone', goal: 0, neededBy: null, monthly: 500_000, paused: true },
        { ...pot, id: 'gone', archivedAt: '2026-11-01T00:00:00.000Z' },
      ],
      saved: { dalat: 6_000_000, gone: 0 },
    });
    expect(preview.jars).toBe(2_000_000);
  });

  it('stops counting a bill past its last month', () => {
    const ended = paydayPreview({
      ...base,
      bills: [{ amount: 3_000_000, paidCycle: null, lastMonth: '2026-11' }],
    });
    // 14,5tr free over 32 days.
    expect(ended.daily).toBe(453_000);
  });
});

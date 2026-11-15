import { describe, expect, it } from 'vitest';

import { foldRuns } from './runs';

interface Line {
  readonly kind: 'payday' | 'spent' | 'started';
  readonly amount: number;
  readonly day: string;
}

const keyOf = (line: Line) => (line.kind === 'payday' ? `payday:${line.amount}` : null);

describe('folding a history where it repeats', () => {
  it('folds five paydays of the same amount into one run, and leaves the start alone', () => {
    const lines: Line[] = [
      ...['09-30', '08-31', '07-31', '06-30', '05-31'].map((d) => ({
        kind: 'payday' as const,
        amount: 500_000,
        day: `2026-${d}`,
      })),
      { kind: 'started', amount: 3_500_000, day: '2026-05-31' },
    ];
    const runs = foldRuns(lines, keyOf);
    expect(runs.map((r) => [r.items.length, r.total])).toEqual([
      [5, 2_500_000],
      [1, 3_500_000],
    ]);
  });

  it('breaks a run at a different amount or at a spend between', () => {
    const runs = foldRuns<Line>(
      [
        { kind: 'payday', amount: 500_000, day: '2026-10-31' },
        { kind: 'payday', amount: 500_000, day: '2026-09-30' },
        { kind: 'spent', amount: 200_000, day: '2026-09-12' },
        { kind: 'payday', amount: 500_000, day: '2026-08-31' },
        { kind: 'payday', amount: 400_000, day: '2026-07-31' },
      ],
      keyOf,
    );
    expect(runs.map((r) => r.items.length)).toEqual([2, 1, 1, 1]);
  });

  it('never folds lines that stand alone, even the same', () => {
    const spent = { kind: 'spent' as const, amount: 50_000, day: '2026-10-01' };
    expect(foldRuns([spent, spent], keyOf)).toHaveLength(2);
    expect(foldRuns([], keyOf)).toEqual([]);
  });
});

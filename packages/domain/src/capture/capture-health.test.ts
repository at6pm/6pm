import { describe, expect, it } from 'vitest';

import { addDays } from '../time/local-date';
import {
  captureAccuracy,
  firstCatchCardDue,
  foldCaptureFix,
  heartbeat,
  isCaughtSource,
  wayQuiet,
} from './capture-health';

const today = '2026-10-10';
const ago = (n: number) => addDays(today, -n);
/** One catch on each of these days ago. */
const on = (...days: number[]) => days.map(ago);

describe('heartbeat', () => {
  it('counts catches per day for the last 14 days, today last', () => {
    const beats = heartbeat([...on(0, 0, 1, 13), ago(14), addDays(today, 1)], today);
    expect(beats).toHaveLength(14);
    expect(beats[13]).toBe(2);
    expect(beats[12]).toBe(1);
    expect(beats[0]).toBe(1);
    expect(beats.reduce((a, b) => a + b, 0)).toBe(4);
  });
});

describe('wayQuiet', () => {
  it('is quiet after 3 empty days that follow 5 or more catches', () => {
    expect(wayQuiet(on(3, 4, 5, 6, 7), today)).toEqual({ days: 3, catches: 5 });
  });

  it('is not quiet with fewer than 3 empty days', () => {
    expect(wayQuiet(on(2, 4, 5, 6, 7), today)).toBeNull();
  });

  it('is never quiet for a way that caught only now and then, or never', () => {
    expect(wayQuiet(on(3, 6, 9, 12), today)).toBeNull();
    expect(wayQuiet([], today)).toBeNull();
  });

  it('counts only the 14 days up to the last catch', () => {
    // Four catches a fortnight before the last one do not make the way busy.
    expect(wayQuiet(on(4, 20, 21, 22, 23), today)).toBeNull();
    expect(wayQuiet(on(4, 10, 11, 12, 13), today)).toEqual({ days: 4, catches: 5 });
  });

  it('stays quiet as the silence goes on', () => {
    expect(wayQuiet(on(30, 31, 32, 33, 34), today)).toEqual({ days: 30, catches: 5 });
  });

  it('is not quiet while the way is seen running, even with nothing caught', () => {
    // The shortcut read an alert yesterday and skipped it: the automation works.
    expect(wayQuiet(on(5, 6, 7, 8, 9), today, ago(1))).toBeNull();
    expect(wayQuiet(on(5, 6, 7, 8, 9), today, ago(3))).toEqual({ days: 3, catches: 5 });
  });
});

describe('firstCatchCardDue', () => {
  it('shows from the morning after "later", until a catch', () => {
    const later = { state: 'later', day: today, at: `${today}T11:00:00.000Z` } as const;
    expect(firstCatchCardDue(later, today)).toBe(false);
    expect(firstCatchCardDue(later, addDays(today, 1))).toBe(true);
    expect(firstCatchCardDue({ state: 'caught', at: '' }, addDays(today, 1))).toBe(false);
  });

  it('never shows for someone who did not choose later', () => {
    expect(firstCatchCardDue(null, addDays(today, 3))).toBe(false);
  });
});

describe('isCaughtSource', () => {
  it('takes what arrives on its own, never what was typed or said', () => {
    expect(
      ['shared', 'applePay', 'alert', 'email', 'qr'].every((s) => isCaughtSource(s as never)),
    ).toBe(true);
    expect(isCaughtSource('manual')).toBe(false);
    expect(isCaughtSource('voice')).toBe(false);
    expect(isCaughtSource('cash')).toBe(false);
  });
});

describe('foldCaptureFix', () => {
  const spend = { id: 's1', day: today, amount: 1_250_000, merchant: 'Circle K' };

  it('records an amount or a shop changed by hand, with what was read', () => {
    expect(foldCaptureFix(null, spend, { amount: 125_000 })).toEqual({
      id: 's1',
      day: today,
      amount: { from: 1_250_000, to: 125_000 },
    });
    expect(foldCaptureFix(null, spend, { merchant: 'Bách hoá Xanh' })?.merchant).toEqual({
      from: 'Circle K',
      to: 'Bách hoá Xanh',
    });
  });

  it('does not count a category, note or status change as a miss', () => {
    expect(foldCaptureFix(null, spend, {})).toBeNull();
    expect(foldCaptureFix(null, spend, { amount: 1_250_000, merchant: ' Circle K ' })).toBeNull();
  });

  it('keeps the first reading through later edits', () => {
    const once = foldCaptureFix(null, spend, { amount: 120_000 });
    const edited = { ...spend, amount: 120_000 };
    expect(foldCaptureFix(once, edited, { amount: 125_000 })?.amount).toEqual({
      from: 1_250_000,
      to: 125_000,
    });
  });

  it('drops a fix put back the way it was read', () => {
    const once = foldCaptureFix(null, spend, { amount: 120_000 });
    expect(foldCaptureFix(once, { ...spend, amount: 120_000 }, { amount: 1_250_000 })).toBeNull();
  });

  it('does not count a name typed where none was read', () => {
    expect(foldCaptureFix(null, { ...spend, merchant: '' }, { merchant: 'Phở Hoà' })).toBeNull();
  });
});

describe('captureAccuracy', () => {
  const reads = Array.from({ length: 50 }, (_, n) => ({ id: `r${n}`, looked: n === 7 }));
  const fix = (id: string) => ({ id, day: today, amount: { from: 1, to: 2 } });

  it('counts receipts read right the first time', () => {
    const shown = captureAccuracy(reads, [fix('r11'), fix('r29'), fix('r41')]);
    expect(shown).toMatchObject({ total: 50, right: 47, looked: 1 });
    expect(shown.fixes.map((f) => f.id)).toEqual(['r41', 'r29', 'r11']);
  });

  it('never counts a fix to a receipt read in another month', () => {
    expect(captureAccuracy(reads.slice(0, 10), [fix('r41')])).toMatchObject({
      total: 10,
      right: 10,
      fixes: [],
    });
  });

  it('counts a receipt fixed twice once', () => {
    const both = { ...fix('r3'), merchant: { from: 'A', to: 'B' } };
    expect(captureAccuracy(reads, [both]).right).toBe(49);
  });
});

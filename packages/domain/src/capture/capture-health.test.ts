import { describe, expect, it } from 'vitest';

import { addDays } from '../time/local-date';
import {
  captureAccuracy,
  firstCatchEnded,
  firstCatchReminder,
  firstCatchStateSchema,
  foldCaptureFix,
  foldFirstCatch,
  heartbeat,
  isCaughtSource,
  isSelfRunningSource,
  leaveFirstCatch,
  putFirstCatchAway,
  wayQuiet,
  type FirstCatchAway,
  type FirstCatchState,
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

describe('firstCatchReminder', () => {
  const tomorrow = addDays(today, 1);
  const at = `${today}T12:00:00`;
  const later: FirstCatchState = { state: 'later', day: today, at };
  const due = (state: FirstCatchState | null, on = tomorrow) =>
    firstCatchReminder({ state, today: on, setUp: false });

  it('shows from the morning after the catching step was skipped', () => {
    expect(due(later, today)).toBeNull();
    expect(due(later)).toBe('notSetUp');
    expect(due(later, addDays(today, 40))).toBe('notSetUp');
  });

  it('goes on after a shared receipt or a scanned code was caught', () => {
    for (const source of ['shared', 'qr'] as const) {
      const state = foldFirstCatch(null, { source, at, day: today });
      expect(state).toMatchObject({ state: 'caught', source, day: today });
      expect(due(state, today)).toBeNull();
      expect(due(state)).toBe('notSetUp');
    }
  });

  it('ends for good the first time a way that runs by itself catches something', () => {
    for (const source of ['alert', 'applePay', 'email'] as const) {
      const state = foldFirstCatch(later, { source, at, day: tomorrow });
      expect(firstCatchEnded(state)).toBe(true);
      expect(due(state, addDays(today, 30))).toBeNull();
      // Nothing afterwards brings it back: a later share, or leaving the step again.
      expect(foldFirstCatch(state, { source: 'shared', at, day: tomorrow })).toBe(state);
      expect(leaveFirstCatch(state, { day: tomorrow, at })).toBe(state);
    }
  });

  it('never counts a typed or a spoken spend', () => {
    expect(isSelfRunningSource('manual')).toBe(false);
    expect(isSelfRunningSource('voice')).toBe(false);
    expect(isSelfRunningSource('cash')).toBe(false);
    expect(isSelfRunningSource('shared')).toBe(false);
    expect(isSelfRunningSource('qr')).toBe(false);
  });

  it('says it is waiting once a way that runs by itself is set up', () => {
    expect(firstCatchReminder({ state: later, today: tomorrow, setUp: true })).toBe('waiting');
    expect(firstCatchReminder({ state: later, today, setUp: true })).toBeNull();
  });

  it('keeps the day the reminder began when a share lands after onboarding', () => {
    const after = foldFirstCatch(later, { source: 'shared', at, day: addDays(today, 5) });
    expect(after).toMatchObject({ state: 'later', day: today });
    expect(due(after)).toBe('notSetUp');
    // A way that runs by itself landing later keeps that day too.
    const ended = foldFirstCatch(later, { source: 'alert', at, day: addDays(today, 5) });
    expect(ended).toMatchObject({ state: 'caught', source: 'alert', day: today });
  });

  it('keeps the ways walked through every change', () => {
    const walked = leaveFirstCatch(null, { day: today, at, ways: ['wallet'] });
    expect(walked.ways).toEqual(['wallet']);
    const shared = foldFirstCatch(walked, { source: 'shared', at, day: today, ways: ['alerts'] });
    expect(shared.ways).toEqual(['wallet', 'alerts']);
    expect(leaveFirstCatch(shared, { day: tomorrow, at, ways: ['wallet'] })).toEqual({
      state: 'later',
      day: tomorrow,
      at,
      ways: ['wallet', 'alerts'],
    });
  });

  describe('a state kept before sources were told apart', () => {
    const old = firstCatchStateSchema.parse({ state: 'caught', at });

    it('starts the reminder for a catch that was a share or a scan', () => {
      expect(firstCatchEnded(old)).toBe(false);
      expect(due(old, today)).toBeNull();
      expect(due(old)).toBe('notSetUp');
    });

    it('never shows once the spends say a way that runs by itself caught something', () => {
      const found = foldFirstCatch(old, { source: 'alert', at, day: today });
      expect(firstCatchEnded(found)).toBe(true);
      expect(due(found)).toBeNull();
    });

    it('still reads "later" with its ways, and shows at once with no day to go by', () => {
      const kept = firstCatchStateSchema.parse({ ...later, ways: ['wallet'] });
      expect(due(kept)).toBe('notSetUp');
      expect(due({ state: 'caught', at: '' }, today)).toBe('notSetUp');
    });
  });

  describe('a phone that kept no state', () => {
    it('shows from the morning after 6pm was set up', () => {
      const from = (started: string | null, on: string) =>
        firstCatchReminder({ state: null, today: on, started, setUp: false });
      expect(from(today, today)).toBeNull();
      expect(from(today, tomorrow)).toBe('notSetUp');
      expect(from(null, today)).toBe('notSetUp');
    });
  });

  describe('put away with "Not now"', () => {
    const on = (away: FirstCatchAway | null, day: string) =>
      firstCatchReminder({ state: later, today: day, setUp: false, away });

    it('stays away for seven days, then comes back', () => {
      const away = putFirstCatchAway(null, tomorrow);
      expect(away).toEqual({ times: 1, day: tomorrow });
      expect(on(away, tomorrow)).toBeNull();
      expect(on(away, addDays(tomorrow, 6))).toBeNull();
      expect(on(away, addDays(tomorrow, 7))).toBe('notSetUp');
    });

    it('stays away for good once put away three times', () => {
      const second = putFirstCatchAway(putFirstCatchAway(null, tomorrow), addDays(tomorrow, 7));
      expect(second.times).toBe(2);
      expect(on(second, addDays(tomorrow, 14))).toBe('notSetUp');
      const third = putFirstCatchAway(second, addDays(tomorrow, 14));
      expect(third).toEqual({ times: 3, day: addDays(tomorrow, 14) });
      expect(on(third, addDays(tomorrow, 21))).toBeNull();
      expect(on(third, addDays(tomorrow, 400))).toBeNull();
    });
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

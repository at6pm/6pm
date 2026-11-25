import { describe, expect, it } from 'vitest';

import type { SpendSource } from '../spend/spend';
import {
  closedInsideNumber,
  ratingAfterClose,
  ratingAtFirstCatch,
  ratingSpacingAllows,
  type CloseRatingInput,
  type FirstCatchRatingInput,
  type RatingHistory,
} from './rating-ask';

const now = new Date('2026-11-25T11:30:00.000Z');

const daysBefore = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const hoursBefore = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

const never: RatingHistory = { asks: [], firstCatchAsked: false };

/** A bank alert caught an hour ago, seen on a settled Today, never asked before. */
const seen: FirstCatchRatingInput = {
  firstCatch: { source: 'alert', at: hoursBefore(1), deleted: false },
  today: 'settled',
  history: never,
  now,
};

/** A good close on the seventh closed day, never asked before. */
const closed: CloseRatingInput = { closedDays: 7, dayWithinNumber: true, history: never, now };

describe('ratingAtFirstCatch', () => {
  it('asks at the first catch from a way that runs by itself', () => {
    for (const source of ['alert', 'applePay', 'email'] as const) {
      expect(
        ratingAtFirstCatch({ ...seen, firstCatch: { source, at: hoursBefore(1), deleted: false } }),
      ).toBe(true);
    }
  });

  it('never asks for a spend typed, said, shared or scanned', () => {
    const others: SpendSource[] = ['manual', 'voice', 'shared', 'qr', 'cash', 'import'];
    for (const source of others) {
      expect(
        ratingAtFirstCatch({ ...seen, firstCatch: { source, at: hoursBefore(1), deleted: false } }),
      ).toBe(false);
    }
    expect(ratingAtFirstCatch({ ...seen, firstCatch: null })).toBe(false);
  });

  it('never asks for a catch taken back, which may have been read wrong', () => {
    expect(
      ratingAtFirstCatch({
        ...seen,
        firstCatch: { source: 'alert', at: hoursBefore(1), deleted: true },
      }),
    ).toBe(false);
  });

  it('asks once in the life of the phone', () => {
    const asked = { asks: [daysBefore(400)], firstCatchAsked: true };
    expect(ratingAtFirstCatch({ ...seen, history: asked })).toBe(false);
  });

  it('never asks while something is over Today, or when Today was come back to', () => {
    expect(ratingAtFirstCatch({ ...seen, today: 'covered' })).toBe(false);
    expect(ratingAtFirstCatch({ ...seen, today: 'interrupted' })).toBe(false);
  });

  it('asks only while the catch is fresh', () => {
    const at = (days: number) => ({
      ...seen,
      firstCatch: { source: 'alert' as const, at: daysBefore(days), deleted: false },
    });
    expect(ratingAtFirstCatch(at(2.9))).toBe(true);
    expect(ratingAtFirstCatch(at(3))).toBe(true);
    expect(ratingAtFirstCatch(at(3.1))).toBe(false);
    expect(ratingAtFirstCatch(at(60))).toBe(false);
  });

  it('holds back when the catch time cannot be read or sits in the future', () => {
    expect(
      ratingAtFirstCatch({ ...seen, firstCatch: { source: 'alert', at: 'soon', deleted: false } }),
    ).toBe(false);
    expect(
      ratingAtFirstCatch({
        ...seen,
        firstCatch: { source: 'alert', at: daysBefore(-1), deleted: false },
      }),
    ).toBe(false);
  });

  it('keeps to the spacing after an ask made at a close', () => {
    const recent = { asks: [daysBefore(3)], firstCatchAsked: false };
    expect(ratingAtFirstCatch({ ...seen, history: recent })).toBe(false);
    const older = { asks: [daysBefore(10)], firstCatchAsked: false };
    expect(ratingAtFirstCatch({ ...seen, history: older })).toBe(true);
  });
});

describe('ratingAfterClose', () => {
  it('asks after a good close from the seventh closed day on', () => {
    expect(ratingAfterClose(closed)).toBe(true);
    expect(ratingAfterClose({ ...closed, closedDays: 40 })).toBe(true);
  });

  it('never asks before a closed week, so the third close is left to Max', () => {
    expect(ratingAfterClose({ ...closed, closedDays: 0 })).toBe(false);
    expect(ratingAfterClose({ ...closed, closedDays: 3 })).toBe(false);
    expect(ratingAfterClose({ ...closed, closedDays: 6 })).toBe(false);
  });

  it('never asks after a day that went over', () => {
    expect(ratingAfterClose({ ...closed, dayWithinNumber: false })).toBe(false);
  });

  it('asks a closed week after the first catch asked, and not sooner', () => {
    const caught = (days: number) => ({ asks: [daysBefore(days)], firstCatchAsked: true });
    expect(ratingAfterClose({ ...closed, history: caught(6) })).toBe(false);
    expect(ratingAfterClose({ ...closed, history: caught(7) })).toBe(true);
  });
});

describe('ratingSpacingAllows', () => {
  it('allows the first ask at any time', () => {
    expect(ratingSpacingAllows(never, now)).toBe(true);
  });

  it('waits 120 days between asks from the second on', () => {
    const twice = (days: number) => ({
      asks: [daysBefore(days + 30), daysBefore(days)],
      firstCatchAsked: true,
    });
    expect(ratingSpacingAllows(twice(1), now)).toBe(false);
    expect(ratingSpacingAllows(twice(119), now)).toBe(false);
    expect(ratingSpacingAllows(twice(120), now)).toBe(true);
  });

  it('never asks more than three times in any 365 days, as the system allows', () => {
    const three = {
      asks: [daysBefore(360), daysBefore(240), daysBefore(121)],
      firstCatchAsked: true,
    };
    expect(ratingSpacingAllows(three, now)).toBe(false);
    const aged = {
      asks: [daysBefore(366), daysBefore(240), daysBefore(121)],
      firstCatchAsked: true,
    };
    expect(ratingSpacingAllows(aged, now)).toBe(true);
  });

  it('holds back when an ask cannot be read or sits in the future', () => {
    expect(ratingSpacingAllows({ asks: ['not a time'], firstCatchAsked: false }, now)).toBe(false);
    expect(ratingSpacingAllows({ asks: [daysBefore(-30)], firstCatchAsked: false }, now)).toBe(
      false,
    );
  });
});

describe('closedInsideNumber', () => {
  it('is a day that spent no more than its line', () => {
    expect(closedInsideNumber({ spent: 120_000, line: 150_000, overspent: false })).toBe(true);
    expect(closedInsideNumber({ spent: 150_000, line: 150_000, overspent: false })).toBe(true);
    expect(closedInsideNumber({ spent: 0, line: 150_000, overspent: false })).toBe(true);
  });

  it('is never a day over its line', () => {
    expect(closedInsideNumber({ spent: 151_000, line: 150_000, overspent: false })).toBe(false);
  });

  it('is never a day in a cycle whose free money is gone', () => {
    expect(closedInsideNumber({ spent: 0, line: 0, overspent: true })).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { closedInsideNumber, shouldAskForRating, type RatingAskInput } from './rating-ask';

const now = new Date('2026-11-01T11:30:00.000Z');

/** A good close on the third day, never asked before. */
const due: RatingAskInput = {
  closedDays: 3,
  dayWithinNumber: true,
  lastAskedAt: null,
  lastAskedVersion: null,
  version: '2.1.0',
  now,
};

const daysBefore = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

describe('shouldAskForRating', () => {
  it('asks after a good close from the third closed day on', () => {
    expect(shouldAskForRating(due)).toBe(true);
    expect(shouldAskForRating({ ...due, closedDays: 40 })).toBe(true);
  });

  it('never asks before the third closed day', () => {
    expect(shouldAskForRating({ ...due, closedDays: 0 })).toBe(false);
    expect(shouldAskForRating({ ...due, closedDays: 2 })).toBe(false);
  });

  it('never asks after a day that went over', () => {
    expect(shouldAskForRating({ ...due, dayWithinNumber: false })).toBe(false);
  });

  it('asks at most once per app version', () => {
    expect(
      shouldAskForRating({ ...due, lastAskedAt: daysBefore(400), lastAskedVersion: '2.1.0' }),
    ).toBe(false);
    expect(
      shouldAskForRating({ ...due, lastAskedAt: daysBefore(400), lastAskedVersion: '2.0.0' }),
    ).toBe(true);
  });

  it('waits 120 days after the last ask, even in a new version', () => {
    const asked = { ...due, lastAskedVersion: '2.0.0', version: '2.2.0' };
    expect(shouldAskForRating({ ...asked, lastAskedAt: daysBefore(1) })).toBe(false);
    expect(shouldAskForRating({ ...asked, lastAskedAt: daysBefore(119) })).toBe(false);
    expect(shouldAskForRating({ ...asked, lastAskedAt: daysBefore(120) })).toBe(true);
    expect(shouldAskForRating({ ...asked, lastAskedAt: daysBefore(200) })).toBe(true);
  });

  it('holds back when the version or the last ask cannot be read', () => {
    expect(shouldAskForRating({ ...due, version: null })).toBe(false);
    expect(shouldAskForRating({ ...due, version: '' })).toBe(false);
    expect(
      shouldAskForRating({ ...due, lastAskedAt: 'not a time', lastAskedVersion: '2.0.0' }),
    ).toBe(false);
  });

  it('holds back when the last ask sits in the future, as after the clock moved back', () => {
    expect(
      shouldAskForRating({ ...due, lastAskedAt: daysBefore(-30), lastAskedVersion: '2.0.0' }),
    ).toBe(false);
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

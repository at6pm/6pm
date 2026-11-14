import { describe, expect, it } from 'vitest';

import { maxOfferAfterClose, type MaxOfferInput } from './max-offer';

const now = new Date('2026-11-14T11:30:00.000Z');

/** A good close on the third day, by someone who has never been offered anything. */
const third: MaxOfferInput = {
  closedDays: 3,
  dayWithinNumber: true,
  member: false,
  serious: false,
  maxOfferedAt: null,
  backupOfferedAt: null,
  now,
};

const daysBefore = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

/** A good close a week in, by someone who saw Max four days ago. */
const week: MaxOfferInput = { ...third, closedDays: 7, maxOfferedAt: daysBefore(4) };

describe('maxOfferAfterClose', () => {
  it('shows Max after a good close from the third closed day on', () => {
    expect(maxOfferAfterClose(third)).toBe('max');
    expect(maxOfferAfterClose({ ...third, closedDays: 40 })).toBe('max');
  });

  it('shows nothing before the third closed day', () => {
    expect(maxOfferAfterClose({ ...third, closedDays: 0 })).toBeNull();
    expect(maxOfferAfterClose({ ...third, closedDays: 2 })).toBeNull();
  });

  it('shows nothing after a day that went over, to a member, or in serious mode', () => {
    expect(maxOfferAfterClose({ ...third, dayWithinNumber: false })).toBeNull();
    expect(maxOfferAfterClose({ ...third, member: true })).toBeNull();
    expect(maxOfferAfterClose({ ...third, serious: true })).toBeNull();
    expect(maxOfferAfterClose({ ...week, dayWithinNumber: false })).toBeNull();
    expect(maxOfferAfterClose({ ...week, member: true })).toBeNull();
    expect(maxOfferAfterClose({ ...week, serious: true })).toBeNull();
  });

  it('shows Max once', () => {
    expect(maxOfferAfterClose({ ...third, maxOfferedAt: daysBefore(1) })).toBeNull();
    expect(
      maxOfferAfterClose({ ...third, closedDays: 6, maxOfferedAt: daysBefore(30) }),
    ).toBeNull();
  });

  it('offers the backup from the seventh closed day, three days after Max was shown', () => {
    expect(maxOfferAfterClose(week)).toBe('backup');
    expect(maxOfferAfterClose({ ...week, closedDays: 6 })).toBeNull();
    expect(maxOfferAfterClose({ ...week, maxOfferedAt: daysBefore(2) })).toBeNull();
    expect(maxOfferAfterClose({ ...week, maxOfferedAt: daysBefore(3) })).toBe('backup');
  });

  it('leaves days between the two for someone with many days closed already', () => {
    const longTimer = { ...third, closedDays: 30 };
    expect(maxOfferAfterClose(longTimer)).toBe('max');
    expect(
      maxOfferAfterClose({ ...longTimer, closedDays: 31, maxOfferedAt: daysBefore(1) }),
    ).toBeNull();
    expect(maxOfferAfterClose({ ...longTimer, closedDays: 33, maxOfferedAt: daysBefore(3) })).toBe(
      'backup',
    );
  });

  it('offers the backup once', () => {
    expect(maxOfferAfterClose({ ...week, backupOfferedAt: daysBefore(1) })).toBeNull();
    expect(
      maxOfferAfterClose({ ...week, closedDays: 90, backupOfferedAt: daysBefore(80) }),
    ).toBeNull();
  });

  it('holds the backup offer back when the first offer cannot be read or is in the future', () => {
    expect(maxOfferAfterClose({ ...week, maxOfferedAt: 'not a date' })).toBeNull();
    expect(maxOfferAfterClose({ ...week, maxOfferedAt: daysBefore(-2) })).toBeNull();
  });
});

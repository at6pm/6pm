import { describe, expect, it } from '@jest/globals';

import type { PlannedNotification } from '@6pm/domain';

import { dataOf } from './close-reminder-sync';

describe('what a notification carries for the phone', () => {
  it('carries the way gone quiet and the moment it was placed for, to the minute', () => {
    const at = new Date(2026, 10, 27, 9, 0);
    const notice: PlannedNotification = {
      kind: 'capture',
      id: 'capture-quiet:alert',
      day: '2026-11-27',
      at,
      way: 'alert',
      bank: 'MB Bank',
      days: 3,
    };
    expect(dataOf(notice)).toEqual({ way: 'alert', at: at.toISOString() });
  });
});

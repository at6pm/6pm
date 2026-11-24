import { describe, expect, it } from '@jest/globals';

import { reminderWaysOf, selfRunningSetUp } from './first-catch-ways';

describe('the ways Today’s reminder is about', () => {
  it('shows bank alerts and the Wallet automation where the phone has them', () => {
    expect(reminderWaysOf({ bankAlerts: true, wallet: true })).toEqual(['alerts', 'wallet']);
    expect(reminderWaysOf({ bankAlerts: false, wallet: true })).toEqual(['wallet']);
    expect(reminderWaysOf({ bankAlerts: true, wallet: false })).toEqual(['alerts']);
  });

  it('has nothing to remind a phone with neither', () => {
    expect(reminderWaysOf({ bankAlerts: false, wallet: false })).toEqual([]);
  });
});

describe('whether a way that runs by itself is set up', () => {
  const none = { walked: [], alertAccess: null, alertRead: false } as const;

  it('is not set up with nothing walked and nothing read', () => {
    expect(selfRunningSetUp(none)).toBe(false);
    expect(selfRunningSetUp({ ...none, walked: ['share', 'scan'] })).toBe(false);
  });

  it('is set up once a Shortcut way or mail forwarding was walked', () => {
    for (const way of ['alerts', 'wallet', 'email']) {
      expect(selfRunningSetUp({ ...none, walked: [way] })).toBe(true);
    }
  });

  it('is set up once the Shortcut has passed an alert on, even one it skipped', () => {
    expect(selfRunningSetUp({ ...none, alertRead: true })).toBe(true);
  });

  it('follows Android’s Notification access where the phone has it', () => {
    expect(selfRunningSetUp({ ...none, alertAccess: true })).toBe(true);
    expect(selfRunningSetUp({ ...none, alertAccess: false })).toBe(false);
    // Switched off again: an alert read before does not make it set up.
    expect(selfRunningSetUp({ ...none, alertAccess: false, alertRead: true })).toBe(false);
  });
});

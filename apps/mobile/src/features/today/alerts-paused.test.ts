import { describe, expect, it } from '@jest/globals';

import { alertsPaused } from './alerts-paused';

const had = { access: false, seenOn: true, alertRead: false, reminderUp: false } as const;

describe('Today saying bank alerts are paused', () => {
  it('says so when Notification access is off on a phone that had bank alerts set up', () => {
    expect(alertsPaused(had)).toBe(true);
    expect(alertsPaused({ ...had, seenOn: false, alertRead: true })).toBe(true);
  });

  it('stops the moment access is back', () => {
    expect(alertsPaused({ ...had, access: true })).toBe(false);
  });

  it('never nags someone who never set bank alerts up', () => {
    expect(alertsPaused({ ...had, seenOn: false, alertRead: false })).toBe(false);
  });

  it('leaves the asking to the first-catch reminder while it is up', () => {
    expect(alertsPaused({ ...had, reminderUp: true })).toBe(false);
  });

  it('is never said where alerts do not come through a listener (the iPhone)', () => {
    expect(alertsPaused({ ...had, access: null })).toBe(false);
  });
});

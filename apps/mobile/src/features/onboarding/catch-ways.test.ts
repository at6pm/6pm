import { describe, expect, it } from '@jest/globals';

import { currencyOf, VND } from '@6pm/domain';

import { catchWaysFor, readyWays } from './catch-ways';

describe('the ways onboarding shows', () => {
  it('offers receipt email in server mode', () => {
    expect(catchWaysFor(VND)).toEqual(['scan', 'share', 'wallet', 'email', 'add', 'lock']);
    expect(catchWaysFor(VND, 'server')).toContain('email');
  });

  it('leaves receipt email out in on-device mode, where it does not exist', () => {
    const ways = catchWaysFor(VND, 'device');
    expect(ways).toEqual(['scan', 'share', 'wallet', 'add', 'lock']);
    expect(readyWays(ways)).toBe(4);
    expect(catchWaysFor(currencyOf('USD'), 'device')).toEqual(['share', 'wallet', 'add', 'lock']);
  });

  it('leaves out the ways a phone without their native piece cannot do', () => {
    const bare = { scan: false, share: false, wallet: false, widgets: false, alertListener: false };
    const ways = catchWaysFor(VND, 'server', bare);
    expect(ways).toEqual(['email', 'add']);
    expect(readyWays(ways)).toBe(1);
    expect(catchWaysFor(VND, 'device', bare)).toEqual(['add']);
  });

  it('offers bank alerts where Android’s notification listener reads them, set up once', () => {
    const android = {
      scan: true,
      share: false,
      wallet: false,
      widgets: false,
      alertListener: true,
    };
    const ways = catchWaysFor(VND, 'server', android);
    expect(ways).toEqual(['scan', 'alerts', 'email', 'add']);
    expect(readyWays(ways)).toBe(2);
    expect(catchWaysFor(VND)).not.toContain('alerts');
  });
});

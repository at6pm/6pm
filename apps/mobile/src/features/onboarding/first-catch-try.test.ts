import { describe, expect, it } from '@jest/globals';

import { BANKS } from '@6pm/domain';

import { ownBankOf, wayTryOf } from './first-catch-try';

const iphone = { os: 'ios', testAlert: true };
/** An iPhone build from before it could post a test alert, or iOS before 27. */
const olderIphone = { os: 'ios', testAlert: false };
const android = { os: 'android', testAlert: true };
/** A bank 6pm can open on the iPhone. */
const bank = BANKS.find((b) => b.ios !== null);

describe('what a way’s tile does when tapped', () => {
  it('sends a test alert for bank alerts on Android, whatever bank the person picked', () => {
    expect(wayTryOf('alerts', null, android)).toEqual({ kind: 'test' });
    expect(wayTryOf('alerts', bank?.id ?? null, android)).toEqual({ kind: 'test' });
  });

  it('does nothing for bank alerts on an Android build that cannot post one', () => {
    expect(wayTryOf('alerts', bank?.id ?? null, { os: 'android', testAlert: false })).toBeNull();
  });

  it('sends a test alert on the iPhone too, and never opens the bank over it', () => {
    expect(wayTryOf('alerts', null, iphone)).toEqual({ kind: 'test' });
    expect(wayTryOf('alerts', bank?.id ?? null, iphone)).toEqual({ kind: 'test' });
  });

  it('opens the person’s bank on an iPhone that cannot send a test alert', () => {
    expect(bank).toBeDefined();
    expect(wayTryOf('alerts', bank?.id ?? null, olderIphone)).toEqual({
      kind: 'open',
      url: bank?.ios?.scheme,
    });
    expect(wayTryOf('alerts', null, olderIphone)).toBeNull();
  });

  it('opens Photos to share from and Wallet to pay with, as before', () => {
    for (const phone of [iphone, olderIphone]) {
      expect(wayTryOf('share', null, phone)).toEqual({ kind: 'open', url: 'photos-redirect://' });
      expect(wayTryOf('wallet', null, phone)).toEqual({ kind: 'open', url: 'shoebox://' });
    }
  });

  it('takes the first of the person’s banks 6pm can open', () => {
    expect(ownBankOf([])).toBeNull();
    expect(ownBankOf(['no-such-bank', bank?.id ?? ''])).toBe(bank?.id);
  });
});

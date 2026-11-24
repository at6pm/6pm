import { describe, expect, it } from '@jest/globals';

import { BANKS } from '@6pm/domain';

import { ownBankOf, wayTryOf } from './first-catch-try';

const iphone = { os: 'ios', testAlert: false };
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

  it('opens the person’s bank on the iPhone, and never sends a test alert there', () => {
    expect(bank).toBeDefined();
    expect(wayTryOf('alerts', bank?.id ?? null, iphone)).toEqual({
      kind: 'open',
      url: bank?.ios?.scheme,
    });
    expect(wayTryOf('alerts', null, iphone)).toBeNull();
    // Even if a build said it could: the iPhone's alerts come through a Shortcut.
    expect(wayTryOf('alerts', null, { os: 'ios', testAlert: true })).toBeNull();
    expect(wayTryOf('alerts', bank?.id ?? null, { os: 'ios', testAlert: true })?.kind).toBe('open');
  });

  it('opens Photos to share from and Wallet to pay with, as before', () => {
    expect(wayTryOf('share', null, iphone)).toEqual({ kind: 'open', url: 'photos-redirect://' });
    expect(wayTryOf('wallet', null, iphone)).toEqual({ kind: 'open', url: 'shoebox://' });
  });

  it('takes the first of the person’s banks 6pm can open', () => {
    expect(ownBankOf([])).toBeNull();
    expect(ownBankOf(['no-such-bank', bank?.id ?? ''])).toBe(bank?.id);
  });
});

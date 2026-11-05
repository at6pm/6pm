import { describe, expect, it } from '@jest/globals';

import { currencyOf, VND } from '@6pm/domain';

import { catchWaysFor, listenWaysOf, readyWays, setupCardsOf } from './catch-ways';

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

  it('offers bank alerts on an iPhone whose Shortcuts can run on a notification', () => {
    const ios27 = {
      scan: true,
      share: true,
      wallet: true,
      widgets: true,
      alertListener: false,
      bankAlerts: true,
    };
    expect(catchWaysFor(VND, 'server', ios27)).toEqual([
      'scan',
      'share',
      'wallet',
      'alerts',
      'email',
      'add',
      'lock',
    ]);
  });
});

describe('the ways onboarding waits on', () => {
  const all = catchWaysFor(VND, 'server', {
    scan: true,
    share: true,
    wallet: true,
    widgets: true,
    alertListener: false,
    bankAlerts: true,
  });

  it('offers only the ways that were set up, sharing needing none', () => {
    expect(listenWaysOf(all, [])).toEqual(['share']);
    expect(listenWaysOf(all, ['wallet'])).toEqual(['share', 'wallet']);
    expect(listenWaysOf(all, ['alerts', 'wallet', 'email'])).toEqual(['alerts', 'share', 'wallet']);
  });

  it('offers nothing a phone cannot do', () => {
    const android = catchWaysFor(VND, 'server', {
      scan: true,
      share: false,
      wallet: false,
      widgets: false,
      alertListener: true,
    });
    expect(listenWaysOf(android, [])).toEqual([]);
    expect(listenWaysOf(android, ['alerts'])).toEqual(['alerts']);
  });
});

describe('the set-up cards while waiting for a first catch', () => {
  const iphone = catchWaysFor(VND, 'server', {
    scan: true,
    share: true,
    wallet: true,
    widgets: true,
    alertListener: false,
    bankAlerts: true,
  });
  const android = catchWaysFor(VND, 'server', {
    scan: true,
    share: false,
    wallet: false,
    widgets: false,
    alertListener: true,
  });

  it('offers both automations on an iPhone until each is set up', () => {
    expect(setupCardsOf(iphone, listenWaysOf(iphone, []), null, false)).toEqual([
      'alerts',
      'wallet',
    ]);
    expect(setupCardsOf(iphone, listenWaysOf(iphone, ['wallet']), null, false)).toEqual(['alerts']);
    expect(setupCardsOf(iphone, listenWaysOf(iphone, ['alerts', 'wallet']), null, false)).toEqual(
      [],
    );
  });

  it('offers Notification access on Android only while it is off', () => {
    expect(setupCardsOf(android, listenWaysOf(android, []), false, true)).toEqual(['alerts']);
    expect(setupCardsOf(android, listenWaysOf(android, ['alerts']), true, true)).toEqual([]);
    expect(setupCardsOf(android, listenWaysOf(android, []), null, true)).toEqual([]);
  });

  it('offers nothing a phone does not show', () => {
    expect(setupCardsOf(catchWaysFor(VND), [], null, false)).toEqual(['wallet']);
  });
});

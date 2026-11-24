import { describe, expect, it } from '@jest/globals';

import { bankAlertShortcutFor, WORLD_SHORTCUT } from './bank-alert-shortcut-country';

const LINKS = {
  VN: 'https://www.icloud.com/shortcuts/vn',
  US: 'https://www.icloud.com/shortcuts/us',
  BR: 'https://www.icloud.com/shortcuts/br',
  [WORLD_SHORTCUT]: 'https://www.icloud.com/shortcuts/world',
};

describe('bankAlertShortcutFor', () => {
  it('gives a phone its country’s shortcut, by its region first', () => {
    expect(bankAlertShortcutFor({ region: 'US', currency: 'USD', timeZone: null }, LINKS)).toBe(
      LINKS.US,
    );
    // A Brazilian phone on a trip to New York: one vote each, the region first.
    const trip = { region: 'BR', currency: 'BRL', timeZone: 'America/New_York' };
    expect(bankAlertShortcutFor(trip, LINKS)).toBe(LINKS.BR);
  });

  it('reads the currency or the clock when the region says nothing', () => {
    expect(bankAlertShortcutFor({ region: null, currency: 'BRL', timeZone: null }, LINKS)).toBe(
      LINKS.BR,
    );
    const clock = { region: null, currency: null, timeZone: 'America/Chicago' };
    expect(bankAlertShortcutFor(clock, LINKS)).toBe(LINKS.US);
  });

  it('gives Vietnam’s whenever the phone points at Vietnam at all', () => {
    const vietnam = { region: 'VN', currency: 'VND', timeZone: 'Asia/Ho_Chi_Minh' };
    expect(bankAlertShortcutFor(vietnam, LINKS)).toBe(LINKS.VN);
    // Set to the US, used in Saigon.
    const usInVietnam = { region: 'US', currency: 'USD', timeZone: 'Asia/Ho_Chi_Minh' };
    expect(bankAlertShortcutFor(usInVietnam, LINKS)).toBe(LINKS.VN);
  });

  it('gives the world’s where 6pm has no list, or none is published yet', () => {
    const argentina = { region: 'AR', currency: 'ARS', timeZone: null };
    expect(bankAlertShortcutFor(argentina, LINKS)).toBe(LINKS[WORLD_SHORTCUT]);
    const sweden = { region: 'SE', currency: 'SEK', timeZone: 'Europe/Stockholm' };
    expect(bankAlertShortcutFor(sweden, LINKS)).toBe(LINKS[WORLD_SHORTCUT]);
    expect(bankAlertShortcutFor({ region: null, currency: null, timeZone: null }, LINKS)).toBe(
      LINKS[WORLD_SHORTCUT],
    );
  });

  it('falls back to Vietnam’s while no other is published, and to none without links', () => {
    const only = { VN: LINKS.VN };
    expect(bankAlertShortcutFor({ region: 'SE', currency: null, timeZone: null }, only)).toBe(
      LINKS.VN,
    );
    expect(bankAlertShortcutFor({ region: 'US', currency: null, timeZone: null }, {})).toBeNull();
  });
});

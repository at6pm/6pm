import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  ALERT_REPEAT_WINDOW_MS,
  alertFingerprint,
  heardAlertId,
  heardKeyOf,
  repeatsAlert,
  type AlertSighting,
} from './alert-repeat';

const RANDOM = '0f1e2d3c-4b5a-4968-a7b6-c5d4e3f2a1b0';
const OTHER_RANDOM = '11111111-2222-4333-9444-555555555555';

const alert = (balance: string) => ({
  app: 'MB Bank',
  title: 'Thông báo biến động số dư',
  body: `TK 0123xxx456|GD: -92,000VND 28/10/26 17:09|SD: ${balance}VND|ND: QANDSD8634 MOMO`,
});

const first = alert('1,234,567');
const at = (ms: number) => new Date(Date.parse('2026-10-28T10:09:21.374Z') + ms).toISOString();
const sighting = (over: Partial<AlertSighting> = {}): AlertSighting => ({
  source: 'alert',
  id: heardAlertId(first, RANDOM),
  at: at(0),
  detail: 'MB Bank',
  amount: 92_000,
  ...over,
});

describe('alertFingerprint', () => {
  it('reads the app and the words, spaces evened out, never the date', () => {
    expect(alertFingerprint(first)).toMatch(/^[0-9a-f]{12}$/);
    expect(alertFingerprint({ ...first, body: ` ${first.body.replace('|', ' |')} ` })).not.toBe(
      alertFingerprint(first),
    );
    expect(alertFingerprint({ ...first, body: `  ${first.body}\n` })).toBe(alertFingerprint(first));
    expect(alertFingerprint({ ...first, date: at(60_000) })).toBe(alertFingerprint(first));
    expect(alertFingerprint({ ...first, app: 'Techcombank' })).not.toBe(alertFingerprint(first));
  });

  it('tells two payments of the same amount apart by the balance after each', () => {
    expect(alertFingerprint(alert('1,142,567'))).not.toBe(alertFingerprint(first));
  });
});

describe('heardAlertId', () => {
  it('is a version 8 UUID that starts with the fingerprint, the rest drawn at random', () => {
    const id = heardAlertId(first, RANDOM);
    expect(z.uuid().safeParse(id).success).toBe(true);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(heardKeyOf(id)).toBe(alertFingerprint(first));
    expect(heardAlertId(first, OTHER_RANDOM)).not.toBe(id);
    expect(heardKeyOf(heardAlertId(first, OTHER_RANDOM))).toBe(heardKeyOf(id));
  });

  it('finds no fingerprint in any other id', () => {
    expect(heardKeyOf(RANDOM)).toBeNull();
    expect(heardKeyOf(null)).toBeNull();
    expect(heardKeyOf('')).toBeNull();
  });
});

describe('repeatsAlert', () => {
  it('knows one notification caught twice, a minute apart (17:09 and 17:10)', () => {
    const again = sighting({ id: heardAlertId(first, OTHER_RANDOM), at: at(61_000) });
    expect(repeatsAlert(again, sighting())).toBe(true);
    expect(repeatsAlert(sighting(), again)).toBe(true);
  });

  it('keeps two payments of the same amount from one bank in one minute two', () => {
    const second = sighting({ id: heardAlertId(alert('1,142,567'), OTHER_RANDOM), at: at(20_000) });
    expect(repeatsAlert(second, sighting())).toBe(false);
  });

  it('lets the same words come back as a new payment once the window has passed', () => {
    const later = (ms: number) =>
      repeatsAlert(sighting({ id: heardAlertId(first, OTHER_RANDOM), at: at(ms) }), sighting());
    expect(later(ALERT_REPEAT_WINDOW_MS)).toBe(true);
    expect(later(ALERT_REPEAT_WINDOW_MS + 1)).toBe(false);
  });

  it('knows an alert from before ids carried a fingerprint by its bank, amount and instant', () => {
    const old = sighting({ id: RANDOM });
    expect(repeatsAlert(sighting({ id: OTHER_RANDOM }), old)).toBe(true);
    // A sighting on another spend keeps no amount of its own.
    expect(repeatsAlert(sighting({ id: OTHER_RANDOM }), { ...old, amount: undefined })).toBe(true);
    expect(repeatsAlert(sighting({ id: OTHER_RANDOM, at: at(1) }), old)).toBe(false);
    expect(repeatsAlert(sighting({ id: OTHER_RANDOM, amount: 92_001 }), old)).toBe(false);
    expect(repeatsAlert(sighting({ id: OTHER_RANDOM, detail: 'Techcombank' }), old)).toBe(false);
  });

  it('never takes a time printed to the minute as one notification', () => {
    const minute = '2026-10-28T10:09:00.000Z';
    expect(
      repeatsAlert(
        sighting({ id: OTHER_RANDOM, at: minute }),
        sighting({ id: RANDOM, at: minute }),
      ),
    ).toBe(false);
  });

  it('only ever compares alerts', () => {
    expect(repeatsAlert(sighting({ source: 'applePay' }), sighting())).toBe(false);
    expect(repeatsAlert(sighting(), sighting({ source: 'email' }))).toBe(false);
  });
});

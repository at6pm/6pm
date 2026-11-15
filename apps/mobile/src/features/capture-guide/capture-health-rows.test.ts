import { describe, expect, it } from '@jest/globals';

import { addDays } from '@6pm/domain';

import type { CatchSeen } from '../../data/first-catch';
import { healthRows, healthSection, HEALTH_WAYS } from './capture-health-rows';

const today = '2026-10-10';
const seen = (
  source: CatchSeen['source'],
  daysAgo: number,
  detail: string | null = null,
): CatchSeen => {
  const day = addDays(today, -daysAgo);
  return { source, day, at: `${day}T05:00:00.000Z`, detail };
};
const row = (catches: CatchSeen[], way: (typeof HEALTH_WAYS)[number], more = {}) =>
  healthRows({ catches, today, ways: HEALTH_WAYS, lastAlert: null, off: [], ...more }).find(
    (r) => r.way === way,
  );

describe('each way’s heartbeat in Settings', () => {
  const busyMb = [3, 4, 5, 6, 7, 8].map((d) => seen('alert', d, 'MB Bank'));

  it('calls a busy bank alert way gone flat for 3 days quiet, with its bank', () => {
    const alerts = row(busyMb, 'alerts');
    expect(alerts?.state).toEqual({ kind: 'quiet', quiet: { days: 3, catches: 6 } });
    expect(alerts?.bank).toBe('MB Bank');
    expect(alerts?.beats.slice(-3)).toEqual([0, 0, 0]);
  });

  it('is not quiet while the shortcut is seen reading alerts it skips', () => {
    const lastAlert = {
      day: addDays(today, -1),
      at: `${addDays(today, -1)}T05:00:00.000Z`,
      bank: 'MB Bank',
    };
    expect(row(busyMb, 'alerts', { lastAlert })?.state.kind).toBe('caught');
  });

  it('never calls a way the person starts themselves quiet', () => {
    const shares = [3, 4, 5, 6, 7, 8].map((d) => seen('shared', d));
    expect(row(shares, 'share')?.state.kind).toBe('caught');
  });

  it('says a self-running way that never caught is not set up, the rest ready', () => {
    expect(row([], 'wallet')?.state.kind).toBe('notSetUp');
    expect(row([], 'share')?.state.kind).toBe('ready');
    expect(row([], 'email', { off: ['email'] })?.state.kind).toBe('off');
  });
});

describe('the section Settings draws', () => {
  const section = (catches: CatchSeen[], more = {}) =>
    healthSection({ catches, today, ways: HEALTH_WAYS, lastAlert: null, off: [], ...more });

  it('puts the way that caught last first and the ways to set up at the foot', () => {
    const { rows } = section([seen('qr', 2), seen('email', 0), seen('voice', 5)]);
    expect(rows.map((r) => r.way)).toEqual(['email', 'scan', 'voice', 'share', 'alerts', 'wallet']);
  });

  it('keeps a quiet way in its own place', () => {
    const busyMb = [3, 4, 5, 6, 7, 8].map((d) => seen('alert', d, 'MB Bank'));
    const { rows } = section([...busyMb, seen('qr', 1), seen('email', 0)]);
    expect(rows.map((r) => r.way)).toEqual(['email', 'scan', 'alerts', 'share', 'voice', 'wallet']);
  });

  it('counts every catch on the strips', () => {
    expect(
      section([seen('qr', 0), seen('qr', 1), seen('shared', 13), seen('shared', 20)]).total,
    ).toBe(3);
  });

  it('lights today for a catch made after midnight, before the money day turns', () => {
    const tomorrow = addDays(today, 1);
    const [y = 0, m = 1, d = 1] = tomorrow.split('-').map(Number);
    const late = {
      source: 'qr',
      day: tomorrow,
      at: new Date(y, m - 1, d, 0, 40).toISOString(),
      detail: null,
    } as const;
    expect(
      section([late])
        .rows.find((r) => r.way === 'scan')
        ?.beats.at(-1),
    ).toBe(1);
  });
});

import { describe, expect, it } from '@jest/globals';

import { addDays } from '@6pm/domain';

import type { CatchSeen } from '../../data/first-catch';
import { healthRows, HEALTH_WAYS } from './capture-health-rows';

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

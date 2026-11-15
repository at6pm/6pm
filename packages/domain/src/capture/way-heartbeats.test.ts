import { describe, expect, it } from 'vitest';

import { wayHeartbeats, type CatchArrival } from './way-heartbeats';

const today = '2026-11-14';
/** A catch on a phone-local day and hour, so the test reads the same in any time zone. */
const at = (source: CatchArrival['source'], day: number, hour: number): CatchArrival => ({
  source,
  at: new Date(2026, 10, day, hour, 10).toISOString(),
});

describe('wayHeartbeats', () => {
  it('counts each way’s catches a day for 14 days, today last', () => {
    const { beats, from } = wayHeartbeats(
      [at('qr', 14, 12), at('qr', 14, 18), at('qr', 1, 9), at('shared', 13, 16)],
      ['qr', 'shared'],
      today,
    );
    expect(from).toBe('2026-11-01');
    expect(beats.get('qr')).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]);
    expect(beats.get('shared')?.[12]).toBe(1);
  });

  it('puts a catch after midnight on the money day before it', () => {
    const { beats } = wayHeartbeats([at('alert', 15, 0)], ['alert'], today);
    expect(beats.get('alert')?.[13]).toBe(1);
  });

  it('gives a way with nothing an empty strip, and leaves days outside the 14 out', () => {
    const { beats, total } = wayHeartbeats(
      // Tomorrow's money day, and the day before the first.
      [at('email', 15, 9), { source: 'email', at: new Date(2026, 9, 31, 9).toISOString() }],
      ['email', 'voice'],
      today,
    );
    expect(beats.get('voice')).toEqual(Array.from({ length: 14 }, () => 0));
    expect(beats.get('email')?.every((n) => n === 0)).toBe(true);
    expect(total).toBe(0);
  });

  it('totals only the ways asked for', () => {
    const { total, beats } = wayHeartbeats(
      [at('qr', 10, 12), at('applePay', 11, 12), at('manual', 12, 12)],
      ['qr', 'applePay'],
      today,
    );
    expect(total).toBe(2);
    expect(beats.has('manual')).toBe(false);
  });
});

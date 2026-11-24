import { describe, expect, it, jest } from '@jest/globals';

import {
  noteTestAlertArrived,
  TEST_ALERT_IDLE,
  testAlertArrivedAt,
  testAlertStep,
  watchTestAlerts,
  type TestAlertState,
} from './test-alert';

const AT = '2026-11-22T09:30:02.000Z';

describe('a test alert, as the screen that sent it sees it', () => {
  const sent: TestAlertState = { kind: 'sent', token: 'a' };

  it('is on its way once posted, and arrived when its own token comes in', () => {
    expect(testAlertStep(TEST_ALERT_IDLE, { type: 'sent', token: 'a' })).toEqual(sent);
    expect(testAlertStep(sent, { type: 'arrived', token: 'a', at: AT })).toEqual({
      kind: 'arrived',
      at: AT,
    });
  });

  it('is not proven by another test alert’s arrival', () => {
    expect(testAlertStep(sent, { type: 'arrived', token: 'earlier', at: AT })).toBe(sent);
    expect(testAlertStep(TEST_ALERT_IDLE, { type: 'arrived', token: 'a', at: AT })).toBe(
      TEST_ALERT_IDLE,
    );
  });

  it('is missing when its time runs out, and only its own time', () => {
    expect(testAlertStep(sent, { type: 'timedOut', token: 'a' })).toEqual({
      kind: 'missing',
      token: 'a',
    });
    expect(testAlertStep(sent, { type: 'timedOut', token: 'earlier' })).toBe(sent);
    const arrived: TestAlertState = { kind: 'arrived', at: AT };
    expect(testAlertStep(arrived, { type: 'timedOut', token: 'a' })).toBe(arrived);
  });

  it('is shown as arrived when it comes in after the screen gave up on it', () => {
    const missing = testAlertStep(sent, { type: 'timedOut', token: 'a' });
    expect(testAlertStep(missing, { type: 'arrived', token: 'a', at: AT })).toEqual({
      kind: 'arrived',
      at: AT,
    });
  });

  it('is blocked when 6pm may not post, keeping whether the phone will still ask', () => {
    expect(testAlertStep(TEST_ALERT_IDLE, { type: 'blocked', canAsk: true })).toEqual({
      kind: 'blocked',
      canAsk: true,
    });
    expect(
      testAlertStep({ kind: 'missing', token: 'a' }, { type: 'blocked', canAsk: false }),
    ).toEqual({ kind: 'blocked', canAsk: false });
    // One already on its way was posted: it is not blocked.
    expect(testAlertStep(sent, { type: 'blocked', canAsk: false })).toBe(sent);
  });

  it('has nothing in its way once 6pm may post again, and that changes nothing else', () => {
    expect(testAlertStep({ kind: 'blocked', canAsk: false }, { type: 'allowed' })).toBe(
      TEST_ALERT_IDLE,
    );
    expect(testAlertStep(sent, { type: 'allowed' })).toBe(sent);
  });

  it('can be sent again from any end', () => {
    for (const from of [
      { kind: 'arrived', at: AT },
      { kind: 'missing', token: 'a' },
      { kind: 'blocked', canAsk: false },
    ] satisfies TestAlertState[]) {
      expect(testAlertStep(from, { type: 'sent', token: 'b' })).toEqual({
        kind: 'sent',
        token: 'b',
      });
    }
  });
});

describe('test alerts the import saw arrive', () => {
  it('tells whoever is watching, and keeps when each arrived by its token', () => {
    const told = jest.fn();
    const stop = watchTestAlerts(told);
    expect(testAlertArrivedAt('t1')).toBeNull();
    noteTestAlertArrived('t1', AT);
    expect(told).toHaveBeenCalledTimes(1);
    expect(testAlertArrivedAt('t1')).toBe(AT);
    stop();
    noteTestAlertArrived('t2', AT);
    expect(told).toHaveBeenCalledTimes(1);
    expect(testAlertArrivedAt('t2')).toBe(AT);
  });
});

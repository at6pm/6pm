import { describe, expect, it } from 'vitest';

import {
  CAPTURE_LOG_DAYS,
  captureLogHasExpired,
  captureLogHead,
  captureLogLine,
  captureLogText,
  readCaptureLog,
  type CaptureLogEvent,
} from './capture-log';

const DAY = 24 * 60 * 60_000;
const NOW = new Date('2026-11-15T10:00:00.000Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const event = (loggedAt: string, over: Partial<CaptureLogEvent> = {}): CaptureLogEvent => ({
  loggedAt,
  channel: 'alert',
  handed: { merchant: 'Quan Com Tam Hai' },
  sighting: {
    witness: { kind: 'bank', name: 'MB Bank' },
    channel: 'alert',
    what: 'payment',
    direction: 'out',
    at: loggedAt,
    amount: 55_000,
    currency: 'VND',
  },
  step: 'newRow',
  row: { id: 'row-1', at: loggedAt, merchant: 'Quan Com Tam Hai' },
  ...over,
});

const fileOf = (since: Date, events: readonly CaptureLogEvent[]) =>
  `${captureLogHead(since)}${events.map(captureLogLine).join('')}`;

describe('the capture log file', () => {
  it('reads back what was written, oldest first, with when it was turned on', () => {
    const since = new Date(NOW.getTime() - 3 * DAY);
    const events = [event(ago(2 * DAY)), event(ago(60_000), { step: 'samePayment' })];
    expect(readCaptureLog(fileOf(since, events), NOW)).toEqual({
      since: since.toISOString(),
      events,
    });
  });

  it('keeps what became of an alert’s second reading, and reads a line written without it', () => {
    const events = [
      event(ago(3 * 60_000)),
      event(ago(2 * 60_000), { secondRead: 'changed' }),
      event(ago(60_000), { secondRead: 'failed:timeout' }),
    ];
    const read = readCaptureLog(fileOf(NOW, events), NOW);
    expect(read?.events.map((e) => e.secondRead)).toEqual([undefined, 'changed', 'failed:timeout']);
    expect(read?.events[0]).not.toHaveProperty('secondRead');
    expect(read && captureLogText(read)).toBe(fileOf(NOW, events));
  });

  it(`drops events older than ${CAPTURE_LOG_DAYS} days, keeping the one on the edge`, () => {
    const since = new Date(NOW.getTime() - 30 * DAY);
    const edge = event(ago(CAPTURE_LOG_DAYS * DAY));
    const old = event(ago(CAPTURE_LOG_DAYS * DAY + 1));
    const text = fileOf(since, [old, edge, event(ago(DAY))]);
    expect(readCaptureLog(text, NOW)?.events).toEqual([edge, event(ago(DAY))]);
    expect(captureLogHasExpired(text, NOW)).toBe(true);
    expect(captureLogHasExpired(fileOf(since, [edge]), NOW)).toBe(false);
  });

  it('writes the kept events back as a file that reads the same', () => {
    const since = new Date(NOW.getTime() - 20 * DAY);
    const text = fileOf(since, [event(ago(19 * DAY)), event(ago(DAY))]);
    const kept = readCaptureLog(text, NOW);
    if (!kept) throw new Error('unread');
    const again = captureLogText(kept);
    expect(readCaptureLog(again, NOW)).toEqual(kept);
    expect(captureLogHasExpired(again, NOW)).toBe(false);
  });

  it('skips a line cut short, and refuses a file that is not a capture log', () => {
    const since = new Date(NOW.getTime() - DAY);
    const text = `${fileOf(since, [event(ago(60_000))])}{"loggedAt":"2026-11-15T09`;
    expect(readCaptureLog(text, NOW)?.events).toHaveLength(1);
    expect(readCaptureLog('{"something":"else"}\n', NOW)).toBeNull();
    expect(readCaptureLog('', NOW)).toBeNull();
  });
});

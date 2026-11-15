import { describe, expect, it } from '@jest/globals';

import type { CaptureLogEvent } from '@6pm/domain';

import { createCaptureLog, memoryCaptureLogFile } from './capture-log';

const DAY = 24 * 60 * 60_000;
const START = new Date('2026-11-01T03:00:00.000Z');

const event = (loggedAt: Date, id: string): CaptureLogEvent => ({
  loggedAt: loggedAt.toISOString(),
  channel: 'shared',
  handed: { merchant: 'Tiem Sach Cu' },
  sighting: {
    witness: { kind: 'bank', name: 'Vietcombank' },
    channel: 'shared',
    what: 'payment',
    direction: 'out',
    at: loggedAt.toISOString(),
    amount: 90_000,
    currency: 'VND',
  },
  step: 'newRow',
  row: { id, at: loggedAt.toISOString(), merchant: 'Tiem Sach Cu' },
});

/** A log whose clock the test moves. */
function clockedLog() {
  let now = START;
  const file = memoryCaptureLogFile();
  const log = createCaptureLog(file, () => now);
  return { log, file, move: (ms: number) => (now = new Date(now.getTime() + ms)), now: () => now };
}

describe('the capture log', () => {
  it('is off until it is turned on, and keeps nothing while off', async () => {
    const { log, file } = clockedLog();
    expect(await log.isOn()).toBe(false);
    await log.record(event(START, 'a'));
    expect(file.contents()).toBeNull();
    expect(await log.read()).toBeNull();
  });

  it('keeps every event once on, oldest first, with when it was turned on', async () => {
    const { log, move, now } = clockedLog();
    await log.turnOn();
    await log.record(event(now(), 'a'));
    move(60_000);
    await log.record(event(now(), 'b'));
    const read = await log.read();
    expect(read?.since).toBe(START.toISOString());
    expect(read?.events.map((e) => e.row?.id)).toEqual(['a', 'b']);
  });

  it('drops an event once it is fourteen days old, from the file too', async () => {
    const { log, file, move, now } = clockedLog();
    await log.turnOn();
    await log.record(event(now(), 'old'));
    move(10 * DAY);
    await log.record(event(now(), 'recent'));
    move(4 * DAY + 1);
    await log.record(event(now(), 'new'));
    expect((await log.read())?.events.map((e) => e.row?.id)).toEqual(['recent', 'new']);
    expect(file.contents()).not.toContain('"old"');
  });

  it('sends only what it still keeps', async () => {
    const { log, move, now } = clockedLog();
    await log.turnOn();
    await log.record(event(now(), 'old'));
    move(15 * DAY);
    const text = await log.text();
    expect(text).not.toBeNull();
    expect(text).not.toContain('"old"');
  });

  it('deletes everything it holds when turned off, and stays off', async () => {
    const { log, file, now } = clockedLog();
    await log.turnOn();
    await log.record(event(now(), 'a'));
    await log.turnOff();
    expect(file.contents()).toBeNull();
    expect(await log.isOn()).toBe(false);
    await log.record(event(now(), 'b'));
    expect(file.contents()).toBeNull();
  });

  it('starts again from a file it cannot read, rather than growing it', async () => {
    const file = memoryCaptureLogFile();
    await file.write('not a log\n');
    const log = createCaptureLog(file, () => START);
    expect(await log.isOn()).toBe(false);
    expect(file.contents()).toBeNull();
  });

  it('tells who is listening when it changes', async () => {
    const { log, now } = clockedLog();
    let told = 0;
    const stop = log.subscribe(() => (told += 1));
    await log.turnOn();
    await log.record(event(now(), 'a'));
    stop();
    await log.turnOff();
    expect(told).toBe(2);
  });
});

import { describe, expect, it } from '@jest/globals';

import type { AlertReadWaiting } from '@6pm/domain';

import { createAlertReadsWaiting, memoryAlertReadWaitingFile } from './alert-read-waiting';
import { UNREAD_ALERT_WAIT_MS } from './inbox-import';

// Every name, account and amount here is made up.

const CAME = Date.parse('2026-11-20T04:06:51.000Z');
const entry = (captureId: string, over: Partial<AlertReadWaiting> = {}): AlertReadWaiting => ({
  spendId: captureId,
  captureId,
  at: new Date(CAME).toISOString(),
  words: { app: 'com.VCB', title: 'Thông báo VCB', subtitle: '', body: '-10,000 VND' },
  read: { direction: 'out', amount: 10_000, merchant: '' },
  saved: { merchant: '', categoryId: 'food' },
  ...over,
});

function setup(at = CAME + 60_000) {
  const clock = { now: at };
  const file = memoryAlertReadWaitingFile();
  return { clock, file, waiting: createAlertReadsWaiting(file, () => clock.now) };
}

describe('the alerts waiting for their second reading', () => {
  it('keeps an alert with its words until it is let go, oldest first', async () => {
    const { waiting, file } = setup();
    await waiting.keep(entry('b', { at: new Date(CAME + 5_000).toISOString() }));
    await waiting.keep(entry('a'));
    expect((await waiting.list()).map((e) => e.captureId)).toEqual(['a', 'b']);
    await waiting.drop(['a']);
    expect((await waiting.list()).map((e) => e.captureId)).toEqual(['b']);
    expect(file.contents()).toContain('-10,000 VND');
  });

  it('holds one entry for an alert kept twice', async () => {
    const { waiting } = setup();
    await waiting.keep(entry('a'));
    await waiting.keep(entry('a', { saved: { merchant: 'Circle K', categoryId: 'drinks' } }));
    expect(await waiting.list()).toEqual([
      entry('a', { saved: { merchant: 'Circle K', categoryId: 'drinks' } }),
    ]);
  });

  it('drops an alert two days after it came, and the file with the last one', async () => {
    const { waiting, file, clock } = setup();
    await waiting.keep(entry('a'));
    clock.now = CAME + UNREAD_ALERT_WAIT_MS - 1;
    expect(await waiting.list()).toHaveLength(1);
    clock.now = CAME + UNREAD_ALERT_WAIT_MS;
    expect(await waiting.list()).toEqual([]);
    expect(file.contents()).toBeNull();
  });

  it('leaves no file once nothing waits', async () => {
    const { waiting, file } = setup();
    await waiting.keep(entry('a'));
    await waiting.keep(entry('b'));
    await waiting.drop(['a', 'b']);
    expect(file.contents()).toBeNull();
    await waiting.keep(entry('c'));
    await waiting.clear();
    expect(file.contents()).toBeNull();
    expect(await waiting.list()).toEqual([]);
  });

  it('starts again from a file it cannot read', async () => {
    const { waiting, file } = setup();
    await file.write('not json');
    expect(await waiting.list()).toEqual([]);
    expect(file.contents()).toBeNull();
    await waiting.keep(entry('a'));
    expect(await waiting.list()).toHaveLength(1);
  });
});

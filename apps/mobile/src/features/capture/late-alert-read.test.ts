import { describe, expect, it, jest } from '@jest/globals';

import { currencyOf, type AlertReadWaiting, type LateReadRow } from '@6pm/domain';

import { createAlertReadsWaiting, memoryAlertReadWaitingFile } from '../../data/alert-read-waiting';
import type { ApiRequest } from '../api/api-client';
import { ApiRequestError } from '../api/api-error';
import type { AiMode } from '../privacy/ai-mode';
import { aiModeSettings } from '../privacy/ai-mode-stand-in';
import { createLateAlertReads, LATE_READ_TIMEOUT_MS } from './late-alert-read';

// Every name, account and amount here is made up.

const CAME = Date.parse('2026-11-20T04:11:19.000Z');
const OUT =
  'Số dư TK VCB 1028067596 -10,000 VND lúc 20-11-2026 11:11:18. Số dư 17,972 VND. Ref Ecom.MOMO.CashIn';

const entry = (captureId: string, over: Partial<AlertReadWaiting> = {}): AlertReadWaiting => ({
  spendId: captureId,
  captureId,
  at: new Date(CAME).toISOString(),
  words: { app: 'com.VCB', title: 'Thông báo VCB', subtitle: '', body: OUT },
  read: { direction: 'out', amount: 10_000, merchant: '' },
  saved: { merchant: '', categoryId: 'food' },
  ...over,
});

const categories = [
  { id: 'food', name: 'Food' },
  { id: 'bills', name: 'Bills' },
  { id: 'transport', name: 'Transport' },
];

const says = (over: object = {}) => ({
  moved: 'out',
  amount: 1,
  merchant: 'MoMo',
  category: 'Bills',
  ...over,
});

async function setup(
  entries: readonly AlertReadWaiting[],
  answer: (call: ApiRequest<unknown>) => Promise<unknown>,
  {
    mode = 'server',
    rows = {},
    ruled = {},
    before = null,
  }: {
    mode?: AiMode;
    rows?: Record<string, Partial<LateReadRow> | null>;
    ruled?: Record<string, string>;
    before?: { merchant: string; categoryId: string } | null;
  } = {},
) {
  const waiting = createAlertReadsWaiting(memoryAlertReadWaitingFile(), () => CAME + 60_000);
  for (const kept of entries) await waiting.keep(kept);
  const request = jest.fn((call: ApiRequest<unknown>) => answer(call));
  const updates: [string, object][] = [];
  const sightings: [string, string, string][] = [];
  const late = createLateAlertReads({
    request: request as never,
    settings: aiModeSettings(mode),
    ruleCategory: (merchant) => Promise.resolve(ruled[merchant] ?? null),
    categories: () => categories,
    home: () => currencyOf('VND'),
    waiting,
    row: (id) => {
      const over = rows[id];
      return Promise.resolve(
        over === null
          ? null
          : {
              id,
              source: 'alert',
              status: 'caught',
              direction: null,
              merchant: '',
              categoryId: 'food',
              ...over,
            },
      );
    },
    namedBefore: () => Promise.resolve(before),
    renameSighting: (spendId, captureId, payee) => {
      sightings.push([spendId, captureId, payee]);
      return Promise.resolve();
    },
    update: (id, patch) => {
      updates.push([id, patch]);
      return Promise.resolve(null);
    },
  });
  const left = async () => (await waiting.list()).map((e) => e.captureId);
  return { late, request, updates, sightings, left };
}

describe('a caught bank alert read late', () => {
  it('names and files the row nobody touched, renames its sighting, and lets the alert go', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()));
    expect(await t.late()).toBe(0);
    expect(t.updates).toEqual([['a', { merchant: 'MoMo', categoryId: 'bills' }]]);
    expect(t.sightings).toEqual([['a', 'a', 'MoMo']]);
    expect(await t.left()).toEqual([]);
    const call = t.request.mock.calls[0]?.[0];
    expect(call?.path).toBe('/v1/read-alert');
    expect(call?.timeoutMs).toBe(LATE_READ_TIMEOUT_MS);
    // Long numbers are dotted out before the words leave the phone, as at the first reading.
    expect(JSON.stringify(call?.body)).not.toContain('1028067596');
  });

  it('files by the person’s rule for the name before the server’s category', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()), {
      ruled: { MoMo: 'transport' },
    });
    await t.late();
    expect(t.updates).toEqual([['a', { merchant: 'MoMo', categoryId: 'transport' }]]);
  });

  it('calls the payee what the person called it before, filed where they filed it', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()), {
      before: { merchant: 'Ví MoMo', categoryId: 'transport' },
    });
    await t.late();
    expect(t.updates).toEqual([['a', { merchant: 'Ví MoMo', categoryId: 'transport' }]]);
    // The sighting still says what the bank's alert named.
    expect(t.sightings).toEqual([['a', 'a', 'MoMo']]);
  });

  it('keeps a name the person gave the row, and its category', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()), {
      rows: { a: { merchant: 'Nạp ví' } },
    });
    expect(await t.late()).toBe(0);
    expect(t.updates).toEqual([]);
    expect(await t.left()).toEqual([]);
  });

  it('keeps a category the person chose', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()), {
      rows: { a: { categoryId: 'transport' } },
    });
    await t.late();
    expect(t.updates).toEqual([['a', { merchant: 'MoMo' }]]);
  });

  it('leaves the row as saved when the server reads other money or none, and lets the alert go', async () => {
    const other = await setup([entry('a')], () => Promise.resolve(says({ moved: 'in' })));
    expect(await other.late()).toBe(0);
    const none = await setup([entry('a')], () =>
      Promise.resolve(says({ moved: 'none', amount: 0, merchant: '', category: '' })),
    );
    expect(await none.late()).toBe(0);
    for (const t of [other, none]) {
      expect(t.updates).toEqual([]);
      expect(t.sightings).toEqual([]);
      expect(await t.left()).toEqual([]);
    }
  });

  it('lets go of an alert whose row is gone or deleted', async () => {
    const t = await setup([entry('a'), entry('b')], () => Promise.resolve(says()), {
      rows: { a: null, b: { status: 'deleted' } },
    });
    expect(await t.late()).toBe(0);
    expect(t.updates).toEqual([]);
    expect(t.sightings).toEqual([]);
  });

  it('keeps an alert whose asking failed, and stops the round at a failure all would meet', async () => {
    const refused = await setup([entry('a'), entry('b')], (call) =>
      JSON.stringify(call.body).includes('-10,000')
        ? Promise.reject(new ApiRequestError('unavailable', 'no', true))
        : Promise.resolve(says()),
    );
    expect(await refused.late()).toBe(2);
    expect(refused.request).toHaveBeenCalledTimes(2);
    const offline = await setup(
      [entry('a'), entry('b'), entry('c'), entry('d'), entry('e'), entry('f'), entry('g')],
      () => Promise.reject(new ApiRequestError('network', 'offline', true)),
    );
    expect(await offline.late()).toBe(7);
    // Three are asked at once; none after the connection is known to be down.
    expect(offline.request).toHaveBeenCalledTimes(3);
    expect(await offline.left()).toHaveLength(7);
  });

  it('asks nothing in on-device mode and lets everything waiting go', async () => {
    const t = await setup([entry('a'), entry('b')], () => Promise.resolve(says()), {
      mode: 'device',
    });
    expect(await t.late()).toBe(0);
    expect(t.request).not.toHaveBeenCalled();
    expect(await t.left()).toEqual([]);
  });

  it('runs one round at a time', async () => {
    const t = await setup([entry('a')], () => Promise.resolve(says()));
    const [first, second] = await Promise.all([t.late(), t.late()]);
    expect([first, second]).toEqual([0, 0]);
    expect(t.request).toHaveBeenCalledTimes(1);
  });
});

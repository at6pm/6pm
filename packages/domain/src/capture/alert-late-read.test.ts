import { describe, expect, it } from 'vitest';

import {
  alertReadsStillWaiting,
  lateReadPatch,
  waitingAlertItem,
  waitsForLateRead,
  type AlertReadWaiting,
  type LateReadRow,
} from './alert-late-read';

const waiting = (over: Partial<AlertReadWaiting> = {}): AlertReadWaiting => ({
  spendId: 'row-1',
  captureId: 'row-1',
  at: '2026-11-20T04:06:51.663Z',
  words: { app: 'com.VCB', title: 'Thông báo VCB', subtitle: '', body: '-10,000 VND' },
  read: { direction: 'out', amount: 10_000, merchant: '' },
  saved: { merchant: '', categoryId: 'food' },
  ...over,
});
const row = (over: Partial<LateReadRow> = {}): LateReadRow => ({
  id: 'row-1',
  source: 'alert',
  status: 'caught',
  direction: null,
  merchant: '',
  categoryId: 'food',
  ...over,
});
const reading = (entry: AlertReadWaiting, over: object = {}, merchant = 'MoMo') => ({
  reread: { ...waitingAlertItem(entry), merchant, ...over },
  merchant,
  categoryId: 'bills' as string | null,
});

describe('a bank alert read late', () => {
  it('is asked for again only when its first asking got no answer', () => {
    expect(
      (['late', 'stopped', 'failed:timeout', 'failed:network'] as const).map(waitsForLateRead),
    ).toEqual([true, true, true, true]);
    expect(
      (['same', 'changed', 'none', 'device', 'no-amount', undefined] as const).map(
        waitsForLateRead,
      ),
    ).toEqual([false, false, false, false, false, false]);
  });

  it('waits two days from when the alert came, and no longer', () => {
    const at = Date.parse('2026-11-20T04:06:51.663Z');
    const two = 48 * 60 * 60_000;
    expect(alertReadsStillWaiting([waiting()], at + two - 1, two)).toHaveLength(1);
    expect(alertReadsStillWaiting([waiting()], at + two, two)).toHaveLength(0);
    expect(
      alertReadsStillWaiting([waiting({ at: 'not a time, but long enough' })], at, two),
    ).toEqual([]);
  });

  it('names and files a row nobody has touched', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row(), reading(entry))).toEqual({
      merchant: 'MoMo',
      categoryId: 'bills',
    });
  });

  it('names money in and leaves it unfiled', () => {
    const entry = waiting({ read: { direction: 'in', amount: 10_000, merchant: '' } });
    expect(
      lateReadPatch(entry, row({ direction: 'in' }), reading(entry, {}, 'Bui Quoc Khanh')),
    ).toEqual({ merchant: 'Bui Quoc Khanh' });
  });

  it('keeps a name the person gave, and its category with it', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row({ merchant: 'Nạp ví' }), reading(entry))).toEqual({});
  });

  it('renames what the phone itself read, and keeps a name the person gave the payee before', () => {
    const read = { direction: 'out' as const, amount: 10_000, merchant: 'CTY TNHH ABC' };
    const asRead = waiting({ read, saved: { merchant: 'CTY TNHH ABC', categoryId: 'food' } });
    expect(
      lateReadPatch(asRead, row({ merchant: 'CTY TNHH ABC' }), reading(asRead, {}, 'ABC')),
    ).toEqual({ merchant: 'ABC', categoryId: 'bills' });
    const named = waiting({ read, saved: { merchant: 'Tiệm ABC', categoryId: 'food' } });
    expect(lateReadPatch(named, row({ merchant: 'Tiệm ABC' }), reading(named, {}, 'ABC'))).toEqual(
      {},
    );
  });

  it('keeps a category the person chose and still names the row', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row({ categoryId: 'transport' }), reading(entry))).toEqual({
      merchant: 'MoMo',
    });
  });

  it('names a row the person already kept without refiling it', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row({ status: 'kept' }), reading(entry))).toEqual({
      merchant: 'MoMo',
    });
  });

  it('leaves the row when the server read another amount or another way', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row(), reading(entry, { amount: 17_972 }))).toEqual({});
    expect(lateReadPatch(entry, row(), reading(entry, { direction: 'in' }))).toEqual({});
  });

  it('leaves a row that is gone, deleted or skipped', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, null, reading(entry))).toEqual({});
    expect(lateReadPatch(entry, row({ status: 'deleted' }), reading(entry))).toEqual({});
    expect(lateReadPatch(entry, row({ status: 'skipped' }), reading(entry))).toEqual({});
  });

  it('gives a payment the alert only joined a name when it had none, never a shared receipt', () => {
    const entry = waiting({
      spendId: 'typed-1',
      saved: { merchant: 'Circle K', categoryId: 'food' },
    });
    const joined = row({ id: 'typed-1', source: 'manual', merchant: 'Circle K' });
    expect(lateReadPatch(entry, joined, reading(entry))).toEqual({});
    const blank = waiting({ spendId: 'typed-1' });
    expect(lateReadPatch(blank, row({ id: 'typed-1', source: 'manual' }), reading(blank))).toEqual({
      merchant: 'MoMo',
      categoryId: 'bills',
    });
    expect(lateReadPatch(blank, row({ id: 'typed-1', source: 'shared' }), reading(blank))).toEqual(
      {},
    );
  });

  it('changes nothing when the server gives no name', () => {
    const entry = waiting();
    expect(lateReadPatch(entry, row(), reading(entry, {}, ''))).toEqual({});
  });
});

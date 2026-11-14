import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

import { router } from 'expo-router';

import { sql as createSettings } from '../../db/migrations/0001-create-settings';
import type { SqlDatabase, SqlValue } from '../../data/table';
import { closeFollowUpSettled, followUpAfterClose } from '../close/close-follow-up';
import { maxOfferFor, type CloseForOffer } from './max-offer';
import { MAX_OFFERED_KEY, readMaxOffered, recordMaxOffered } from './max-offer-store';

// A real SQLite database in memory, from Node's own module (see look-settings.test.ts).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

function openDb() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(createSettings);
  const db: SqlDatabase = {
    getAllAsync: <T>(source: string, params: SqlValue[]) =>
      Promise.resolve(sqlite.prepare(source).all(...params) as T[]),
    runAsync: (source, params) => Promise.resolve(sqlite.prepare(source).run(...params)),
    withTransactionAsync: (task) => task(),
  };
  return { db, sqlite };
}

const push = jest.mocked(router.push);

const inside = { spent: 120_000, line: 150_000, overspent: false };
const over = { spent: 180_000, line: 150_000, overspent: false };

/** Waits for the decision and the offer, which run on promises. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

/** A close finishing, then the screen beneath finishing appearing. */
async function finishClose(db: SqlDatabase, closedDays: number, also: Partial<CloseForOffer> = {}) {
  followUpAfterClose(
    maxOfferFor({
      db,
      number: inside,
      closedDays: () => Promise.resolve(closedDays),
      member: false,
      storeOpen: true,
      serious: false,
      ...also,
    }),
  );
  await flush();
  closeFollowUpSettled();
  await flush();
}

beforeEach(() => {
  push.mockReset();
});

describe('Max offered after a close', () => {
  it('opens the Max sheet on the third closed day, once the screen beneath settles', async () => {
    const { db } = openDb();
    followUpAfterClose(
      maxOfferFor({
        db,
        number: inside,
        closedDays: () => Promise.resolve(3),
        member: false,
        storeOpen: true,
        serious: false,
      }),
    );
    await flush();
    // Nothing comes up while the Close is still leaving.
    expect(push).not.toHaveBeenCalled();
    closeFollowUpSettled();
    await flush();
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith({ pathname: '/max', params: { from: 'looks', closed: '3' } });
    expect((await readMaxOffered(db)).max).not.toBeNull();
  });

  it('opens it once, however many closes follow', async () => {
    const { db } = openDb();
    await finishClose(db, 3);
    await finishClose(db, 4);
    await finishClose(db, 5);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('offers the backup a week in, days after Max was shown, and then nothing more', async () => {
    const { db } = openDb();
    await recordMaxOffered(db, 'max', daysAgo(4));
    await finishClose(db, 7);
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith({ pathname: '/max', params: { from: 'backup' } });
    await finishClose(db, 8);
    await finishClose(db, 60);
    expect(push).toHaveBeenCalledTimes(1);
    const offered = await readMaxOffered(db);
    expect(offered.max).not.toBeNull();
    expect(offered.backup).not.toBeNull();
  });

  it('keeps the two offers days apart for someone with many days closed', async () => {
    const { db } = openDb();
    await finishClose(db, 30);
    await finishClose(db, 31);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('offers nothing, and records nothing, to a member, in serious mode, with no store, or after a day that went over', async () => {
    const { db } = openDb();
    await finishClose(db, 3, { member: true });
    await finishClose(db, 3, { serious: true });
    await finishClose(db, 3, { storeOpen: false });
    await finishClose(db, 3, { number: over });
    await finishClose(db, 2);
    expect(push).not.toHaveBeenCalled();
    expect(await readMaxOffered(db)).toEqual({ max: null, backup: null });
  });

  it('drops an offer the screen beneath never settled for, and makes it at the next close', async () => {
    const { db } = openDb();
    const start = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
    followUpAfterClose(
      maxOfferFor({
        db,
        number: inside,
        closedDays: () => Promise.resolve(3),
        member: false,
        storeOpen: true,
        serious: false,
      }),
    );
    await flush();
    clock.mockReturnValue(start + 60_000);
    closeFollowUpSettled();
    await flush();
    expect(push).not.toHaveBeenCalled();
    clock.mockRestore();
    await finishClose(db, 4);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('never surfaces a failed offer', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { db } = openDb();
    await expect(
      finishClose(db, 3, { closedDays: () => Promise.reject(new Error('database is closed')) }),
    ).resolves.toBeUndefined();
    expect(push).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('the offers made on this phone', () => {
  it('reads never until one is recorded, and keeps the other when one is', async () => {
    const { db } = openDb();
    expect(await readMaxOffered(db)).toEqual({ max: null, backup: null });
    await recordMaxOffered(db, 'max', '2026-11-14T11:30:00.000Z');
    expect(await readMaxOffered(db)).toEqual({ max: '2026-11-14T11:30:00.000Z', backup: null });
    await recordMaxOffered(db, 'backup', '2026-11-18T11:30:00.000Z');
    expect(await readMaxOffered(db)).toEqual({
      max: '2026-11-14T11:30:00.000Z',
      backup: '2026-11-18T11:30:00.000Z',
    });
  });

  it('reads a damaged setting as both made, so nothing is offered twice', async () => {
    const { db, sqlite } = openDb();
    sqlite
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(MAX_OFFERED_KEY, '{not json');
    const offered = await readMaxOffered(db);
    expect(offered.max).not.toBeNull();
    expect(offered.backup).not.toBeNull();
    await finishClose(db, 10);
    expect(push).not.toHaveBeenCalled();
  });
});

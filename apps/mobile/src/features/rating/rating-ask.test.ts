import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-application', () => ({ nativeApplicationVersion: '2.1.0' }));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));

import * as StoreReview from 'expo-store-review';

import { sql as createSettings } from '../../db/migrations/0001-create-settings';
import type { SqlDatabase, SqlValue } from '../../data/table';
import { askForRatingAfterClose, ratingAskSettled } from './rating-ask';
import { RATING_ASKED_KEY, readRatingAsked, recordRatingAsked } from './rating-store';

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

const available = jest.mocked(StoreReview.isAvailableAsync);
const request = jest.mocked(StoreReview.requestReview);

const inside = { spent: 120_000, line: 150_000, overspent: false };
const over = { spent: 180_000, line: 150_000, overspent: false };

/** Waits for the decision and the ask, which run on promises. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A close finishing, then the screen beneath finishing appearing. */
async function finishClose(db: SqlDatabase, number = inside, closedDays = 3) {
  askForRatingAfterClose({ db, number, closedDays: () => Promise.resolve(closedDays) });
  await flush();
  ratingAskSettled();
  await flush();
}

beforeEach(() => {
  available.mockReset().mockResolvedValue(true);
  request.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('the rating ask after a close', () => {
  it('asks once the screen beneath settles, and remembers the version it asked in', async () => {
    const { db } = openDb();
    askForRatingAfterClose({ db, number: inside, closedDays: () => Promise.resolve(3) });
    await flush();
    // Nothing comes up while the Close is still leaving.
    expect(request).not.toHaveBeenCalled();
    ratingAskSettled();
    await flush();
    expect(request).toHaveBeenCalledTimes(1);
    const asked = await readRatingAsked(db);
    expect(asked.version).toBe('2.1.0');
    expect(asked.at).not.toBeNull();
  });

  it('asks only once in a version', async () => {
    const { db } = openDb();
    await finishClose(db);
    await finishClose(db, inside, 4);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('never asks after a day that went over, or before the third closed day', async () => {
    const { db } = openDb();
    await finishClose(db, over, 10);
    await finishClose(db, inside, 2);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingAsked(db)).toEqual({ at: null, version: null });
  });

  it('records nothing where the store has no prompt, as on TestFlight', async () => {
    const { db } = openDb();
    available.mockResolvedValue(false);
    await finishClose(db);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingAsked(db)).toEqual({ at: null, version: null });
  });

  it('drops an ask the screen beneath never settled for', async () => {
    const { db } = openDb();
    const start = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(start);
    askForRatingAfterClose({ db, number: inside, closedDays: () => Promise.resolve(3) });
    await flush();
    clock.mockReturnValue(start + 60_000);
    ratingAskSettled();
    await flush();
    expect(request).not.toHaveBeenCalled();
  });

  it('does nothing when a screen settles with no close behind it', async () => {
    ratingAskSettled();
    await flush();
    expect(request).not.toHaveBeenCalled();
  });

  it('never surfaces a failed ask', async () => {
    const { db } = openDb();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    request.mockRejectedValue(new Error('store is down'));
    await expect(finishClose(db)).resolves.toBeUndefined();
    available.mockRejectedValue(new Error('no store'));
    await expect(finishClose(openDb().db)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});

describe('the last rating ask on this phone', () => {
  it('reads never until one is recorded', async () => {
    const { db } = openDb();
    expect(await readRatingAsked(db)).toEqual({ at: null, version: null });
    await recordRatingAsked(db, '2026-11-01T11:30:00.000Z', '2.1.0');
    expect(await readRatingAsked(db)).toEqual({ at: '2026-11-01T11:30:00.000Z', version: '2.1.0' });
  });

  it('reads a damaged setting as never asked', async () => {
    const { db, sqlite } = openDb();
    sqlite
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(RATING_ASKED_KEY, '{not json');
    expect(await readRatingAsked(db)).toEqual({ at: null, version: null });
  });
});

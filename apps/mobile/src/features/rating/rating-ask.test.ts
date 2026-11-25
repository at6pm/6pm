import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-router', () => ({ useSegments: () => [] }));
jest.mock('../home/home-visible', () => ({ coversHome: () => false }));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));

import * as StoreReview from 'expo-store-review';

import { sql as createSettings } from '../../db/migrations/0001-create-settings';
import type { SqlDatabase, SqlValue } from '../../data/table';
import { closeFollowUpSettled, followUpAfterClose } from '../close/close-follow-up';
import { askAtFirstCatch, ratingAskFor } from './rating-ask';
import { RATING_ASKED_KEY, readRatingHistory, recordRatingAsked } from './rating-store';
import {
  noteAppForward,
  noteFirstCatchSeen,
  noteHomeCovered,
  readTodayArrival,
} from './today-arrival';

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

const DAY_MS = 86_400_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** A bank alert caught a minute ago, on a settled Today. */
const alertSeen = {
  firstCatch: { source: 'alert' as const, at: ago(60_000), deleted: false },
  today: 'settled' as const,
};
const settled = () => true;

/** Waits for the decision and the ask, which run on promises. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A close finishing, then the screen beneath finishing appearing. */
async function finishClose(db: SqlDatabase, number = inside, closedDays = 7) {
  followUpAfterClose(ratingAskFor({ db, number, closedDays: () => Promise.resolve(closedDays) }));
  await flush();
  closeFollowUpSettled();
  await flush();
}

beforeEach(() => {
  available.mockReset().mockResolvedValue(true);
  request.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('the rating ask at the first catch', () => {
  it('asks once, and remembers it was the first catch’s', async () => {
    const { db } = openDb();
    expect(await askAtFirstCatch(db, alertSeen, settled)).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    const history = await readRatingHistory(db);
    expect(history.firstCatchAsked).toBe(true);
    expect(history.asks).toHaveLength(1);
    expect(await askAtFirstCatch(db, alertSeen, settled)).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('never asks for a typed spend, or with no catch yet', async () => {
    const { db } = openDb();
    const typed = {
      ...alertSeen,
      firstCatch: { ...alertSeen.firstCatch, source: 'manual' as const },
    };
    expect(await askAtFirstCatch(db, typed, settled)).toBe(false);
    expect(await askAtFirstCatch(db, { ...alertSeen, firstCatch: null }, settled)).toBe(false);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });

  it('never asks while something is over Today', async () => {
    const { db } = openDb();
    expect(await askAtFirstCatch(db, { ...alertSeen, today: 'covered' }, settled)).toBe(false);
    expect(await askAtFirstCatch(db, { ...alertSeen, today: 'interrupted' }, settled)).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it('drops the ask when Today stopped being settled while the store was read', async () => {
    const { db } = openDb();
    expect(await askAtFirstCatch(db, alertSeen, () => false)).toBe(false);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });

  it('records nothing where the store has no prompt, as on TestFlight', async () => {
    const { db } = openDb();
    available.mockResolvedValue(false);
    expect(await askAtFirstCatch(db, alertSeen, settled)).toBe(false);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });

  it('never surfaces a failed ask', async () => {
    const { db } = openDb();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    request.mockRejectedValue(new Error('store is down'));
    await expect(askAtFirstCatch(db, alertSeen, settled)).resolves.toBe(false);
    expect(warn).toHaveBeenCalled();
  });
});

describe('the rating ask after a close', () => {
  it('asks once the screen beneath settles, from a closed week on', async () => {
    const { db } = openDb();
    followUpAfterClose(ratingAskFor({ db, number: inside, closedDays: () => Promise.resolve(7) }));
    await flush();
    // Nothing comes up while the Close is still leaving.
    expect(request).not.toHaveBeenCalled();
    closeFollowUpSettled();
    await flush();
    expect(request).toHaveBeenCalledTimes(1);
    expect(await readRatingHistory(db)).toMatchObject({ firstCatchAsked: false });
  });

  it('no longer asks at the third close, which is left to Max', async () => {
    const { db } = openDb();
    await finishClose(db, inside, 3);
    await finishClose(db, inside, 6);
    expect(request).not.toHaveBeenCalled();
  });

  it('never asks after a day that went over', async () => {
    const { db } = openDb();
    await finishClose(db, over, 10);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });

  it('waits a week after the first catch asked, then 120 days', async () => {
    const { db } = openDb();
    await recordRatingAsked(db, ago(3 * DAY_MS), true);
    await finishClose(db);
    expect(request).not.toHaveBeenCalled();

    const later = openDb().db;
    await recordRatingAsked(later, ago(8 * DAY_MS), true);
    await finishClose(later);
    expect(request).toHaveBeenCalledTimes(1);
    await finishClose(later, inside, 8);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('records nothing where the store has no prompt', async () => {
    const { db } = openDb();
    available.mockResolvedValue(false);
    await finishClose(db);
    expect(request).not.toHaveBeenCalled();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });
});

describe('the rating asks on this phone', () => {
  it('reads never until one is recorded', async () => {
    const { db } = openDb();
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
    await recordRatingAsked(db, '2026-11-25T11:30:00.000Z', true);
    expect(await readRatingHistory(db)).toEqual({
      asks: ['2026-11-25T11:30:00.000Z'],
      firstCatchAsked: true,
    });
  });

  it('reads the last ask kept before asks were counted as one ask', async () => {
    const { db, sqlite } = openDb();
    sqlite
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(RATING_ASKED_KEY, JSON.stringify({ at: '2026-11-01T11:30:00.000Z', version: '2.1.0' }));
    expect(await readRatingHistory(db)).toEqual({
      asks: ['2026-11-01T11:30:00.000Z'],
      firstCatchAsked: false,
    });
  });

  it('reads a damaged setting as never asked', async () => {
    const { db, sqlite } = openDb();
    sqlite
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(RATING_ASKED_KEY, '{not json');
    expect(await readRatingHistory(db)).toEqual({ asks: [], firstCatchAsked: false });
  });
});

describe('how Today was reached', () => {
  it('is opened onto at start, and come back to once anything went over it', () => {
    expect(readTodayArrival()).toBe('opened');
    noteHomeCovered();
    expect(readTodayArrival()).toBe('returned');
  });

  it('is opened onto when the app comes back over Today, not over a sheet left open', () => {
    noteHomeCovered();
    noteAppForward(true);
    expect(readTodayArrival()).toBe('returned');
    noteAppForward(false);
    expect(readTodayArrival()).toBe('opened');
  });

  it('is opened onto when the wait for a first catch is left just after catching one', () => {
    noteHomeCovered();
    noteFirstCatchSeen();
    expect(readTodayArrival()).toBe('opened');
  });
});

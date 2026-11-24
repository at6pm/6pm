import { z } from 'zod';

import {
  CAUGHT_SOURCES,
  SELF_RUNNING_SOURCES,
  captureAccuracy,
  captureFixSchema,
  firstCatchAwaySchema,
  firstCatchStateSchema,
  foldCaptureFix,
  foldFirstCatch,
  leaveFirstCatch,
  localDateOf,
  putFirstCatchAway,
  type CaptureAccuracy,
  type CaptureFix,
  type FirstCatchAway,
  type FirstCatchLanded,
  type FirstCatchState,
  type InboxSpend,
  type LocalDate,
  type SpendRow,
  type SpendSource,
} from '@6pm/domain';

import type { MoneyStore } from './money-store';
import type { SqlDatabase } from './table';

/**
 * What the phone keeps about capture for itself, in the settings table (never in a backup, gone
 * with Delete everything): where onboarding's first catch stands, how often Today's reminder was
 * put away, when a test alert last showed the bank alert automation running, which receipts went
 * for a closer look, and which were fixed by hand. Every count is
 * made on the phone from these and from the spends themselves; nothing here leaves it.
 */
const STATE_KEY = 'first_catch';
const AWAY_KEY = 'first_catch_away';
const ALERTS_PROVEN_KEY = 'bank_alerts_proven';
const ACCESS_SEEN_KEY = 'bank_alerts_access_seen';
const SHORTCUT_ADDED_KEY = 'bank_alerts_shortcut_added';
const FIXES_KEY = 'receipt_fixes';
const LOOKED_KEY = 'receipts_looked';
/** When this phone began keeping how receipts were read: older ones are not counted. */
const SINCE_KEY = 'receipts_counted_since';
/** Receipts remembered at most: months of sharing, more than a month's count needs. */
const KEEP = 400;

async function readJson(db: SqlDatabase, key: string): Promise<unknown> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

async function writeJson(db: SqlDatabase, key: string, value: unknown): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    key,
    JSON.stringify(value),
  ]);
}

export async function readFirstCatch(db: SqlDatabase): Promise<FirstCatchState | null> {
  const parsed = firstCatchStateSchema.safeParse(await readJson(db, STATE_KEY));
  return parsed.success ? parsed.data : null;
}

export async function writeFirstCatch(db: SqlDatabase, state: FirstCatchState): Promise<void> {
  await writeJson(db, STATE_KEY, state);
}

/**
 * Keeps a catch that landed while 6pm waited for one, on top of what is kept: one from a way that
 * runs by itself ends Today's reminder for good; a shared receipt or a scanned code is kept only
 * as the catching step's own, and changes nothing afterwards.
 */
export async function keepFirstCatch(
  db: SqlDatabase,
  landed: FirstCatchLanded,
): Promise<FirstCatchState> {
  const kept = await readFirstCatch(db);
  const next = foldFirstCatch(kept, landed);
  if (next !== kept) await writeFirstCatch(db, next);
  return next;
}

/** Keeps that the catching step was left with no way running by itself yet, and the ways walked. */
export async function keepFirstCatchLeft(
  db: SqlDatabase,
  left: Parameters<typeof leaveFirstCatch>[1],
): Promise<void> {
  const kept = await readFirstCatch(db);
  const next = leaveFirstCatch(kept, left);
  if (next !== kept) await writeFirstCatch(db, next);
}

/** How often Today's reminder was put away with "Not now", and the day of the last time. */
export async function readFirstCatchAway(db: SqlDatabase): Promise<FirstCatchAway | null> {
  const parsed = firstCatchAwaySchema.safeParse(await readJson(db, AWAY_KEY));
  return parsed.success ? parsed.data : null;
}

/** "Not now": Today's reminder put away once more, today. */
export async function putAwayFirstCatch(db: SqlDatabase, today: LocalDate): Promise<void> {
  await writeJson(db, AWAY_KEY, putFirstCatchAway(await readFirstCatchAway(db), today));
}

/**
 * When a test alert last came the whole way in through the bank alert automation, or null while
 * none has. Kept where the phone cannot otherwise see the automation (the iPhone's lives in
 * Shortcuts): it says the way is set up. It is not a catch and ends nothing.
 */
export async function readAlertsProven(db: SqlDatabase): Promise<string | null> {
  const parsed = z
    .string()
    .min(20)
    .safeParse(await readJson(db, ALERTS_PROVEN_KEY));
  return parsed.success ? parsed.data : null;
}

/** A test alert came the whole way in at `at`: the bank alert automation runs. */
export async function keepAlertsProven(db: SqlDatabase, at: string): Promise<void> {
  await writeJson(db, ALERTS_PROVEN_KEY, at);
}

/**
 * When the person came back to 6pm from adding the bank alert shortcut, or null while they have
 * not (or since showed it missing). The phone cannot see Shortcuts: this is what the guide has to
 * tick its first step by.
 */
export async function readShortcutAdded(db: SqlDatabase): Promise<string | null> {
  const parsed = z
    .string()
    .min(20)
    .safeParse(await readJson(db, SHORTCUT_ADDED_KEY));
  return parsed.success ? parsed.data : null;
}

/** Back from adding the shortcut at `at`; or, with null, the shortcut is to be added again. */
export async function keepShortcutAdded(db: SqlDatabase, at: string | null): Promise<void> {
  if (at === null) await db.runAsync('DELETE FROM settings WHERE key = ?', [SHORTCUT_ADDED_KEY]);
  else await writeJson(db, SHORTCUT_ADDED_KEY, at);
}

/**
 * When Android's Notification access was first seen switched on for 6pm, or null while it never
 * was: bank alerts were set up once, so access switched off again is a pause worth saying.
 */
export async function readAlertAccessSeen(db: SqlDatabase): Promise<string | null> {
  const parsed = z
    .string()
    .min(20)
    .safeParse(await readJson(db, ACCESS_SEEN_KEY));
  return parsed.success ? parsed.data : null;
}

/** Notification access is on now; the first time is kept. */
export async function keepAlertAccessSeen(db: SqlDatabase, at: string): Promise<void> {
  if ((await readAlertAccessSeen(db)) === null) await writeJson(db, ACCESS_SEEN_KEY, at);
}

/**
 * The first payment a way that runs by itself ever caught (a bank alert, a Wallet tap, a
 * forwarded email): a spend it made, or one caught another way that it saw too. Null while none
 * has. One taken back since still counts: the way caught it.
 */
export async function firstSelfRunningCatch(store: MoneyStore): Promise<SpendRow | null> {
  const marks = SELF_RUNNING_SOURCES.map(() => '?').join(', ');
  const rows = await store.tables.spends.select(
    `WHERE source IN (${marks})
       OR id IN (SELECT spend_id FROM spend_sightings WHERE source IN (${marks}))
     ORDER BY created_at LIMIT 1`,
    [...SELF_RUNNING_SOURCES, ...SELF_RUNNING_SOURCES],
  );
  return rows[0] ?? null;
}

/**
 * The first spend caught on its own (a shared receipt, a Wallet tap, a bank alert, an email, a
 * scanned code) that arrived at or after `since`, oldest first; null while none has. One taken
 * back (deleted) does not count.
 */
export async function firstCaughtSince(store: MoneyStore, since: string): Promise<SpendRow | null> {
  const marks = CAUGHT_SOURCES.map(() => '?').join(', ');
  const rows = await store.tables.spends.select(
    `WHERE created_at >= ? AND source IN (${marks}) AND status != 'deleted' ORDER BY created_at LIMIT 1`,
    [since, ...CAUGHT_SOURCES],
  );
  return rows[0] ?? null;
}

/** One time a way caught something: a spend it made, or a payment it saw a second time. */
export interface CatchSeen {
  readonly source: SpendSource;
  /** The phone's calendar day it arrived. */
  readonly day: LocalDate;
  readonly at: string;
  /** Where it was read ("MB Bank", "MB Bank · FT…"), when the source says. */
  readonly detail: string | null;
}

/**
 * Every catch since `since` (an instant), oldest first, by when it arrived: each spend by when it
 * was made, and each later sighting of a payment seen another way first by when it was seen. A
 * spend taken back still counts: the way caught it.
 */
export async function catchesSince(db: SqlDatabase, since: string): Promise<CatchSeen[]> {
  const rows = await db.getAllAsync<{ source: SpendSource; at: string; detail: string | null }>(
    `SELECT source, created_at AS at, detail FROM spends WHERE created_at >= ? AND source != 'import'
     UNION ALL
     SELECT s.source, s.seen_at AS at, s.detail FROM spend_sightings s
       JOIN spends p ON p.id = s.spend_id
       WHERE s.seen_at >= ? AND NOT (s.source = p.source AND s.seen_at = p.at)
     ORDER BY at`,
    [since, since],
  );
  return rows.map((row) => ({ ...row, day: localDateOf(new Date(row.at)) }));
}

const fixesSchema = z.array(captureFixSchema);
const lookedSchema = z.array(z.string());

async function readFixes(db: SqlDatabase): Promise<CaptureFix[]> {
  const parsed = fixesSchema.safeParse(await readJson(db, FIXES_KEY));
  return parsed.success ? parsed.data : [];
}

async function writeFix(db: SqlDatabase, id: string, fix: CaptureFix | null): Promise<void> {
  const others = (await readFixes(db)).filter((f) => f.id !== id);
  await writeJson(db, FIXES_KEY, (fix ? [...others, fix] : others).slice(-KEEP));
}

/**
 * What a shared receipt's file said about its reading, kept once it is saved as its own spend:
 * whether the photo went for a closer look, and what was read where the person changed it on the
 * card before saving. A receipt merged into a payment already there is not counted.
 */
export async function noteReceiptRead(
  db: SqlDatabase,
  spend: Pick<SpendRow, 'id' | 'day' | 'amount' | 'merchant'>,
  receipt: InboxSpend['receipt'],
): Promise<void> {
  if (!receipt) return;
  if (receipt.looked) {
    const parsed = lookedSchema.safeParse(await readJson(db, LOOKED_KEY));
    const looked = parsed.success ? parsed.data.filter((id) => id !== spend.id) : [];
    await writeJson(db, LOOKED_KEY, [...looked, spend.id].slice(-KEEP));
  }
  const read = receipt.read;
  if (!read) return;
  const asRead = {
    ...spend,
    amount: read.amount !== undefined ? read.amount : spend.amount,
    merchant: read.payee ?? spend.merchant,
  };
  const fix = foldCaptureFix(null, asRead, { amount: spend.amount, merchant: spend.merchant });
  if (fix) await writeFix(db, spend.id, fix);
}

/**
 * A shared receipt's amount or shop changed by hand after it was saved: kept as a fix, with the
 * first reading. A category, a note or a status change is not one.
 */
export async function noteReceiptEdit(
  db: SqlDatabase,
  row: SpendRow,
  patch: Partial<SpendRow>,
): Promise<void> {
  if (row.source !== 'shared') return;
  if (patch.amount === undefined && patch.merchant === undefined) return;
  const known = (await readFixes(db)).find((f) => f.id === row.id) ?? null;
  const fix = foldCaptureFix(known, row, { amount: patch.amount, merchant: patch.merchant });
  if (fix !== known) await writeFix(db, row.id, fix);
}

/**
 * Starts the count of receipts read on the phone, once: a receipt that arrived before is not
 * counted, since nothing says whether it went for a closer look.
 */
export async function startReadingCount(db: SqlDatabase): Promise<void> {
  await db.runAsync('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [
    SINCE_KEY,
    JSON.stringify(new Date().toISOString()),
  ]);
}

/** This month's receipts read on the phone (oldest first) and how they were read. */
export interface MonthReading {
  readonly accuracy: CaptureAccuracy;
  readonly receipts: readonly SpendRow[];
}

/**
 * The receipts shared or scanned this calendar month (today's month, by the day they arrived, so a
 * receipt from another month shared today counts today) and how they were read, from when the
 * phone began counting.
 */
export async function readMonthReading(store: MoneyStore, today: LocalDate): Promise<MonthReading> {
  const [year = 0, month = 1] = today.split('-').map(Number);
  const counted = z.string().safeParse(await readJson(store.db, SINCE_KEY));
  const monthStart = new Date(year, month - 1, 1).toISOString();
  const start = counted.success && counted.data > monthStart ? counted.data : monthStart;
  const thisMonth = today.slice(0, 7);
  const rows = await store.tables.spends.select(
    "WHERE source = 'shared' AND created_at >= ? ORDER BY created_at",
    [start],
  );
  const receipts = rows.filter(
    (row) => localDateOf(new Date(row.createdAt)).slice(0, 7) === thisMonth,
  );
  const parsed = lookedSchema.safeParse(await readJson(store.db, LOOKED_KEY));
  const looked = new Set(parsed.success ? parsed.data : []);
  const accuracy = captureAccuracy(
    receipts.map((row) => ({ id: row.id, looked: looked.has(row.id) })),
    await readFixes(store.db),
  );
  return { accuracy, receipts };
}

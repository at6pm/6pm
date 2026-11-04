import { z } from 'zod';

import {
  CAUGHT_SOURCES,
  captureAccuracy,
  captureFixSchema,
  firstCatchStateSchema,
  foldCaptureFix,
  localDateOf,
  type CaptureAccuracy,
  type CaptureFix,
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
 * with Delete everything): where onboarding's first catch stands, which receipts went for a
 * closer look, and which were fixed by hand. Every count is made on the phone from these and from
 * the spends themselves; nothing here leaves it.
 */
const STATE_KEY = 'first_catch';
const FIXES_KEY = 'receipt_fixes';
const LOOKED_KEY = 'receipts_looked';
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
    `SELECT source, created_at AS at, detail FROM spends WHERE created_at >= ?
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

/** This month's receipts read on the phone (oldest first) and how they were read. */
export interface MonthReading {
  readonly accuracy: CaptureAccuracy;
  readonly receipts: readonly SpendRow[];
}

/**
 * The receipts shared or scanned this calendar month (today's month, by the day they arrived, so a
 * receipt from another month shared today counts today) and how they were read.
 */
export async function readMonthReading(store: MoneyStore, today: LocalDate): Promise<MonthReading> {
  const [year = 0, month = 1] = today.split('-').map(Number);
  const start = new Date(year, month - 1, 1).toISOString();
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

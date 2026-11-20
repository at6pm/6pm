import { z } from 'zod';

import {
  APART_PAIRS_MAX,
  jarCover,
  mergeProjected,
  moneyDayOf,
  apartIndex,
  apartKey,
  sightingKey,
  withApart,
  type ApartPair,
  type CaptureSighting,
  type SeenOnRow,
  type SightingAtKind,
  type SightingChannel,
  type SpendRow,
} from '@6pm/domain';

import { homeCurrencyOf } from '../money/use-money-format';

import type { NewSpend } from './money-actions';
import type { MoneyStore } from './money-store';
import type { SqlDatabase } from './table';

/**
 * How a row's sightings are kept and read back: every column a sighting has, the key that names
 * one sighting whichever row holds it, and the pairs of sightings the person said are two
 * payments.
 */

export const SIGHTING_COLUMNS = [
  'spend_id',
  'source',
  'seen_at',
  'detail',
  'capture_id',
  'channel',
  'witness_kind',
  'witness_name',
  'what',
  'amount',
  'currency',
  'direction',
  'at_kind',
  'reference',
  'account_tail',
  'bank',
  'payee',
  'memo',
  'words',
] as const;

export const INSERT_SIGHTING = `INSERT OR IGNORE INTO spend_sightings (${SIGHTING_COLUMNS.join(', ')})
  VALUES (${SIGHTING_COLUMNS.map(() => '?').join(', ')})`;

/** A sighting's own fields as its row keeps them, each null when it was not read. */
export function sightingValues(sighting: CaptureSighting | undefined): (string | number | null)[] {
  if (!sighting) return Array.from({ length: SIGHTING_COLUMNS.length - 5 }, () => null);
  return [
    sighting.channel,
    sighting.witness.kind,
    sighting.witness.name ?? null,
    sighting.what,
    sighting.amount ?? null,
    sighting.currency ?? null,
    sighting.direction,
    sighting.atKind ?? null,
    sighting.reference ?? null,
    sighting.accountTail ?? null,
    sighting.bank ?? null,
    sighting.payee ?? null,
    sighting.memo ?? null,
    sighting.words ?? null,
  ];
}

/**
 * Makes sure a row holds its own sighting: one kept before sightings carried their capture is
 * claimed by the row (so it is still known as the row's own once the row's time follows a more
 * exact sighting), and a row from before every capture kept one gets it now, with what it knows.
 */
export async function ensureOwn(db: SqlDatabase, row: SpendRow): Promise<void> {
  await db.runAsync(
    `UPDATE spend_sightings SET capture_id = ?
      WHERE spend_id = ? AND capture_id IS NULL AND source = ? AND seen_at = ?`,
    [row.id, row.id, row.source, row.at],
  );
  const owned = await db.getAllAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM spend_sightings WHERE spend_id = ? AND capture_id = ?',
    [row.id, row.id],
  );
  if ((owned[0]?.n ?? 0) > 0) return;
  await db.runAsync(INSERT_SIGHTING, [
    row.id,
    row.source,
    row.at,
    row.detail,
    row.id,
    ...sightingValues(undefined),
  ]);
}

/**
 * The payee one capture's sighting names, said again: a bank alert's, once the server has read
 * who it names. The name stays the bank's word and not the person's, for the projection and for
 * the names a person gave before.
 */
export async function renameSightingPayee(
  db: SqlDatabase,
  spendId: string,
  captureId: string,
  payee: string,
): Promise<void> {
  await db.runAsync('UPDATE spend_sightings SET payee = ? WHERE spend_id = ? AND capture_id = ?', [
    payee,
    spendId,
    captureId,
  ]);
}

/** Every column of a sighting as the database holds it. */
export interface StoredSighting {
  readonly spend_id: string;
  readonly source: SpendRow['source'];
  readonly seen_at: string;
  readonly detail: string | null;
  readonly capture_id: string | null;
  readonly channel: SightingChannel | null;
  readonly witness_kind: SeenOnRow['witness'] | null;
  readonly witness_name: string | null;
  readonly what: string | null;
  readonly amount: number | null;
  readonly currency: string | null;
  readonly direction: 'out' | 'in' | null;
  readonly at_kind: SightingAtKind | null;
  readonly reference: string | null;
  readonly account_tail: string | null;
  readonly bank: string | null;
  readonly payee: string | null;
  readonly memo: string | null;
  readonly words: string | null;
}

/** Every sighting of these rows, in the order they were kept. */
export async function storedSightings(
  db: SqlDatabase,
  ids: readonly string[],
): Promise<StoredSighting[]> {
  if (ids.length === 0) return [];
  return db.getAllAsync<StoredSighting>(
    `SELECT ${SIGHTING_COLUMNS.join(', ')} FROM spend_sightings
      WHERE spend_id IN (${ids.map(() => '?').join(', ')}) ORDER BY rowid`,
    [...ids],
  );
}

/** One way a spend was seen: a line of the source trail on Details. */
export interface Sighting {
  readonly source: SpendRow['source'];
  readonly seenAt: string;
  readonly detail: string | null;
}

/** Every way a spend was seen, oldest first. Empty for a spend seen only once: no trail. */
export async function readSightings(db: SqlDatabase, spendId: string): Promise<Sighting[]> {
  const rows = await db.getAllAsync<{
    source: SpendRow['source'];
    seen_at: string;
    detail: string | null;
  }>('SELECT source, seen_at, detail FROM spend_sightings WHERE spend_id = ? ORDER BY seen_at', [
    spendId,
  ]);
  if (rows.length < 2) return [];
  return rows.map((r) => ({ source: r.source, seenAt: r.seen_at, detail: r.detail }));
}

/** The key naming one sighting, whichever row holds it. */
export const keyOfStored = (s: Pick<StoredSighting, 'capture_id' | 'source' | 'seen_at'>) =>
  sightingKey({ captureId: s.capture_id, source: s.source, at: s.seen_at });

/** A row's own sighting: the one its capture made, else (kept before that) its source and time. */
export function isOwnSighting(
  row: Pick<SpendRow, 'id' | 'source' | 'at'>,
  s: Pick<StoredSighting, 'capture_id' | 'source' | 'seen_at'>,
): boolean {
  return (
    s.capture_id === row.id ||
    (s.capture_id === null && s.source === row.source && s.seen_at === row.at)
  );
}

/** A row's sightings with its own first: one kept before rows kept theirs stands in from the row. */
export function withOwn(row: SpendRow, stored: readonly StoredSighting[]): StoredSighting[] {
  if (stored.some((s) => isOwnSighting(row, s))) return [...stored];
  const own: StoredSighting = {
    spend_id: row.id,
    source: row.source,
    seen_at: row.at,
    detail: row.detail,
    capture_id: row.id,
    channel: null,
    witness_kind: null,
    witness_name: null,
    what: null,
    amount: null,
    currency: null,
    direction: null,
    at_kind: null,
    reference: null,
    account_tail: null,
    bank: null,
    payee: null,
    memo: null,
    words: null,
  };
  return [own, ...stored];
}

/**
 * A row's sightings as the projection reads them. Its own sighting, kept before sightings carried
 * their fields, says what the row said when it was made.
 */
export function seenOnRow(row: SpendRow, stored: readonly StoredSighting[]): SeenOnRow[] {
  return stored.map((s) => {
    const own = isOwnSighting(row, s);
    const filled = own && s.channel === null;
    return {
      key: keyOfStored(s),
      source: s.source,
      channel: s.channel,
      witness: s.witness_kind,
      amount: s.amount ?? (filled && row.foreignAmount == null ? row.amount : null),
      currency: s.currency,
      at: s.seen_at,
      atKind: s.at_kind,
      payee: s.payee ?? (filled ? row.merchant : null),
    };
  });
}

/** The sighting just arriving, as the projection reads it. */
export function seenArriving(
  input: {
    readonly id?: string | undefined;
    readonly source: SpendRow['source'];
    readonly amount: number;
    readonly merchant: string;
    readonly foreignAmount?: unknown;
  },
  seenAt: string,
  sighting: CaptureSighting | undefined,
): SeenOnRow {
  const homeAmount = input.foreignAmount == null && input.amount > 0 ? input.amount : null;
  return {
    key: sightingKey({ captureId: input.id ?? null, source: input.source, at: seenAt }),
    source: input.source,
    channel: sighting?.channel ?? null,
    witness: sighting?.witness.kind ?? null,
    amount: sighting ? (sighting.amount ?? null) : homeAmount,
    currency: sighting ? (sighting.currency ?? null) : null,
    at: seenAt,
    atKind: sighting?.atKind ?? null,
    // What its witness said, as its row keeps it; a capture read before sightings said, its name.
    payee: sighting ? (sighting.payee ?? null) : input.merchant.trim() || null,
  };
}

/**
 * What a row becomes with one more sighting: each field from the witness best placed to know it
 * (`mergeProjected`), unless the person set it. Its time follows the most exact sighting, and a
 * row still waiting moves to that time's day with it; an answered row keeps its day, and its time
 * unless the new one falls on the same day. A jar's part follows a new amount.
 */
export async function reproject(
  store: MoneyStore,
  twin: SpendRow,
  input: NewSpend,
  seenAt: string,
  sighting?: CaptureSighting,
): Promise<Partial<SpendRow>> {
  const snap = store.getSnapshot();
  const before = seenOnRow(twin, withOwn(twin, await storedSightings(store.db, [twin.id])));
  const next = mergeProjected(
    twin,
    before,
    seenArriving(input, seenAt, sighting),
    input.categoryId,
    homeCurrencyOf(snap.plan).code,
  );
  const { amount, merchant, categoryId } = next;
  return { amount, merchant, categoryId, ...placed(store, twin, next) };
}

/** A row's time and day, and its jar's part, after the projection moved them. */
export function placed(
  store: MoneyStore,
  row: SpendRow,
  next: { readonly amount: number; readonly at: string },
): Partial<SpendRow> {
  const day = moneyDayOf(new Date(next.at));
  const waiting = row.status === 'caught' || row.status === 'pending';
  const when = day === row.day ? { at: next.at } : waiting ? { at: next.at, day } : { at: row.at };
  const jar = row.fromPot;
  if (jar == null || next.amount === row.amount) return when;
  const held = (store.getSnapshot().potSaved[jar] ?? 0) + (row.fromPotAmount ?? 0);
  return { ...when, fromPotAmount: jarCover(next.amount, held) };
}

/** The settings key holding the pairs of sightings the person said are two payments. */
export const APART_KEY = 'captureApart';

const pairsSchema = z.array(z.tuple([z.string(), z.string()]));

/** The pairs said to be two, oldest first. Kept on this phone only, never in the backup. */
export async function readApart(db: SqlDatabase): Promise<ApartPair[]> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    APART_KEY,
  ]);
  try {
    const parsed = pairsSchema.safeParse(JSON.parse(rows[0]?.value ?? '[]'));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** The pairs as a lookup. */
export async function readApartIndex(db: SqlDatabase): Promise<ReadonlySet<string>> {
  return apartIndex(await readApart(db));
}

/** Remembers every sighting of `a` as another payment than every sighting of `b`. */
export async function rememberApart(
  db: SqlDatabase,
  a: readonly string[],
  b: readonly string[],
): Promise<void> {
  const pairs = withApart(await readApart(db), a, b).slice(-APART_PAIRS_MAX);
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    APART_KEY,
    JSON.stringify(pairs),
  ]);
}

/** Forgets the pairs between these sightings (an undo of "These are two" or of No). */
export async function forgetApart(
  db: SqlDatabase,
  a: readonly string[],
  b: readonly string[],
): Promise<void> {
  const gone = apartIndex(withApart([], a, b));
  const pairs = (await readApart(db)).filter(([x, y]) => !gone.has(apartKey(x, y)));
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    APART_KEY,
    JSON.stringify(pairs),
  ]);
}

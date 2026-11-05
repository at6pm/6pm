import {
  BACKUP_SETTING_KEYS,
  BACKUP_SNAPSHOT_VERSION,
  backupItemCount,
  photosThatFit,
  type BackupPhoto,
  type BackupSettingKey,
  type BackupSnapshot,
  type PotMoveRow,
  type SpendRow,
  type SpendSightingRow,
  type TogetherMoveRow,
} from '@6pm/domain';
import { isLanguage } from '@6pm/i18n';

import { openMoneyTables } from './money-tables';
import { planSettingsSchema } from './plan-settings';
import type { PhotoFiles } from './spend-photos';
import type { SqlDatabase } from './table';

/** Children before parents, so the foreign keys never see an orphan while a restore clears. */
const CLEARED_IN_ORDER = [
  'spend_sightings',
  'pot_moves',
  'owed',
  'spends',
  'imports',
  'merchant_rules',
  'bills',
  'pots',
  'categories',
  'closed_days',
] as const;

/** Why a snapshot cannot be put back. Nothing has been written when this is thrown. */
export class SnapshotRefused extends Error {
  constructor(readonly why: string) {
    super(`The snapshot cannot be restored: ${why}`);
    this.name = 'SnapshotRefused';
  }
}

const keyList = BACKUP_SETTING_KEYS.map(() => '?').join(', ');

async function readSettings(db: SqlDatabase): Promise<BackupSnapshot['settings']> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM settings WHERE key IN (${keyList})`,
    [...BACKUP_SETTING_KEYS],
  );
  const settings: { -readonly [K in BackupSettingKey]?: string } = {};
  for (const { key, value } of rows) settings[key as BackupSettingKey] = value;
  return settings;
}

/** Budget together history. It points at pots on the server, not here, so it has no parent. */
async function readTogetherMoves(db: SqlDatabase): Promise<TogetherMoveRow[]> {
  const rows = await db.getAllAsync<{
    id: string;
    pot_id: string;
    pot_name: string;
    amount: number;
    cycle: string;
    at: string;
  }>('SELECT id, pot_id, pot_name, amount, cycle, at FROM together_moves ORDER BY id', []);
  return rows.map((row) => ({
    id: row.id,
    potId: row.pot_id,
    potName: row.pot_name,
    amount: row.amount,
    cycle: row.cycle,
    at: row.at,
  }));
}

/** The UTF-8 length of a string, without encoding it. */
function utf8Length(text: string): number {
  let bytes = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      index += 1;
    } else bytes += 3;
  }
  return bytes;
}

/**
 * The photos a backup carries: the standing spends' photos, newest spend first, as many as fit
 * beside the rest under the sealed cap (`photosThatFit`). The rest stay on the phone only.
 */
async function photosOf(
  files: PhotoFiles,
  spends: readonly SpendRow[],
  rest: BackupSnapshot,
): Promise<BackupPhoto[]> {
  const candidates = spends
    .filter((s) => s.photo != null && s.status !== 'deleted')
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .flatMap((s) => {
      const name = s.photo ?? '';
      const jpegBytes = files.size(name);
      return jpegBytes === null || jpegBytes === 0 ? [] : [{ name, jpegBytes }];
    });
  if (candidates.length === 0) return [];
  const carried = photosThatFit(candidates, utf8Length(JSON.stringify(rest)));
  const photos: BackupPhoto[] = [];
  for (const photo of carried) {
    try {
      photos.push({ name: photo.name, jpeg: await files.read(photo.name) });
    } catch {
      // A photo that cannot be read now is left out; the spend comes back without it.
    }
  }
  return photos;
}

/**
 * Every table the app keeps, as plain rows. Rows that others point at are read last, so a row
 * written while this runs never points at one that was missed: spends before their categories,
 * and pot moves before their pots. With the photo folder, the spends' photos that fit come too.
 */
export async function buildSnapshot(
  db: SqlDatabase,
  takenAt: string,
  files?: PhotoFiles,
): Promise<BackupSnapshot> {
  const tables = openMoneyTables(db);
  const spends = await tables.spends.all();
  const sightings = await db.getAllAsync<{
    spend_id: string;
    source: SpendSightingRow['source'];
    seen_at: string;
    detail: string | null;
    capture_id: string | null;
  }>(
    'SELECT spend_id, source, seen_at, detail, capture_id FROM spend_sightings ORDER BY spend_id, source, seen_at',
    [],
  );
  const merchantRules = await tables.rules.all();
  const moves = await db.getAllAsync<{
    id: string;
    pot_id: string;
    amount: number;
    kind: PotMoveRow['kind'];
    cycle: string;
    at: string;
  }>('SELECT id, pot_id, amount, kind, cycle, at FROM pot_moves ORDER BY id', []);
  const [categories, bills, pots, closedDays, settings, togetherMoves, imports, owed] =
    await Promise.all([
      tables.categories.all(),
      tables.bills.all(),
      tables.pots.all(),
      tables.closedDays.all(),
      readSettings(db),
      readTogetherMoves(db),
      tables.imports.all(),
      tables.owed.all(),
    ]);
  const spendIds = new Set(spends.map((spend) => spend.id));
  const potIds = new Set(pots.map((pot) => pot.id));
  const snapshot: BackupSnapshot = {
    version: BACKUP_SNAPSHOT_VERSION,
    takenAt,
    settings,
    categories,
    spends,
    spendSightings: sightings
      .filter((row) => spendIds.has(row.spend_id))
      .map((row) => ({
        spendId: row.spend_id,
        source: row.source,
        seenAt: row.seen_at,
        detail: row.detail,
        captureId: row.capture_id,
      })),
    merchantRules,
    bills,
    pots,
    potMoves: moves
      .filter((row) => potIds.has(row.pot_id))
      .map((row) => ({
        id: row.id,
        potId: row.pot_id,
        amount: row.amount,
        kind: row.kind,
        cycle: row.cycle,
        at: row.at,
      })),
    togetherMoves,
    imports,
    owed,
    closedDays,
  };
  if (!files) return snapshot;
  return { ...snapshot, photos: await photosOf(files, spends, snapshot) };
}

/** The number "N items" counts, read from a phone's own database. */
export function snapshotItemCount(snapshot: BackupSnapshot): number {
  return backupItemCount(snapshot);
}

/**
 * True while nothing has been made on this phone: no month set up and no spend. Day rows and
 * categories do not count: the app can make them before the person has done anything.
 */
export async function isFreshDatabase(db: SqlDatabase): Promise<boolean> {
  const [plan] = await db.getAllAsync<{ n: number }>(
    "SELECT COUNT(*) AS n FROM settings WHERE key = 'plan'",
    [],
  );
  const [spends] = await db.getAllAsync<{ n: number }>('SELECT COUNT(*) AS n FROM spends', []);
  return (plan?.n ?? 0) === 0 && (spends?.n ?? 0) === 0;
}

/** Checks the settings a snapshot carries before anything is cleared. */
function checkSettings(settings: BackupSnapshot['settings']): void {
  const { plan, wallets, look, language } = settings;
  if (plan !== undefined) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(plan);
    } catch {
      throw new SnapshotRefused('the plan is not JSON');
    }
    if (!planSettingsSchema.safeParse(parsed).success) {
      throw new SnapshotRefused('the plan does not match its contract');
    }
  }
  for (const [name, text] of [
    ['wallets', wallets],
    ['look', look],
  ] as const) {
    if (text === undefined) continue;
    try {
      JSON.parse(text);
    } catch {
      throw new SnapshotRefused(`${name} is not JSON`);
    }
  }
  if (language !== undefined && !isLanguage(language)) {
    throw new SnapshotRefused('the language is not one 6pm speaks');
  }
}

/**
 * Replaces everything the app keeps with the snapshot, in one transaction: a snapshot that fails
 * half way leaves the phone exactly as it was. Settings that belong to this phone (what the store
 * said about purchases, where backup stands) are left alone; the four a snapshot carries are
 * replaced, and removed when the snapshot has none. Budget together history is replaced only by a
 * snapshot that carries it: one taken before it was carried says nothing about it, so the phone's
 * own stays. With the photo folder, the photos it carries are written first and the folder then
 * holds only those; a spend whose photo it did not carry comes back without one.
 */
export async function restoreSnapshot(
  db: SqlDatabase,
  snapshot: BackupSnapshot,
  files?: PhotoFiles,
): Promise<void> {
  checkSettings(snapshot.settings);
  const tables = openMoneyTables(db);
  const wanted = new Set(
    snapshot.spends.flatMap((s) => (s.photo != null && s.status !== 'deleted' ? [s.photo] : [])),
  );
  const carried = new Set<string>();
  if (files) {
    for (const photo of snapshot.photos ?? []) {
      if (!wanted.has(photo.name) || carried.has(photo.name)) continue;
      await files.write(photo.name, photo.jpeg);
      carried.add(photo.name);
    }
  }
  const photoOf = (row: SpendRow) =>
    row.photo != null && carried.has(row.photo) ? row.photo : null;
  await db.withTransactionAsync(async () => {
    for (const table of CLEARED_IN_ORDER) await db.runAsync(`DELETE FROM ${table}`, []);
    if (snapshot.togetherMoves !== undefined) await db.runAsync('DELETE FROM together_moves', []);
    await db.runAsync(`DELETE FROM settings WHERE key IN (${keyList})`, [...BACKUP_SETTING_KEYS]);

    for (const [key, value] of Object.entries(snapshot.settings)) {
      if (value !== undefined) {
        await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
          key,
          value,
        ]);
      }
    }
    for (const row of snapshot.categories) await tables.categories.put(row);
    for (const row of snapshot.spends) await tables.spends.put({ ...row, photo: photoOf(row) });
    for (const row of snapshot.spendSightings) {
      await db.runAsync(
        'INSERT OR REPLACE INTO spend_sightings (spend_id, source, seen_at, detail, capture_id) VALUES (?, ?, ?, ?, ?)',
        [row.spendId, row.source, row.seenAt, row.detail, row.captureId ?? null],
      );
    }
    for (const row of snapshot.merchantRules) await tables.rules.put(row);
    for (const row of snapshot.bills) await tables.bills.put(row);
    for (const row of snapshot.pots) await tables.pots.put(row);
    for (const row of snapshot.potMoves) {
      await db.runAsync(
        'INSERT OR REPLACE INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
        [row.id, row.potId, row.amount, row.kind, row.cycle, row.at],
      );
    }
    for (const row of snapshot.togetherMoves ?? []) {
      await db.runAsync(
        'INSERT OR REPLACE INTO together_moves (id, pot_id, pot_name, amount, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
        [row.id, row.potId, row.potName, row.amount, row.cycle, row.at],
      );
    }
    for (const row of snapshot.imports ?? []) await tables.imports.put(row);
    for (const row of snapshot.owed ?? []) await tables.owed.put(row);
    for (const row of snapshot.closedDays) await tables.closedDays.put(row);
  });
  // What the phone held before is gone with its spends.
  if (files) for (const name of files.names()) if (!carried.has(name)) files.remove(name);
}

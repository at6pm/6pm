import { describe, expect, it } from '@jest/globals';

import {
  BACKUP_MAX_SEALED_BYTES,
  BACKUP_SNAPSHOT_VERSION,
  backupSnapshotSchema,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { memoryPhotoFiles } from '../features/backup/test/memory-photos';
import { seedMoney } from '../features/backup/test/seed-money';
import {
  buildSnapshot,
  isFreshDatabase,
  restoreSnapshot,
  snapshotItemCount,
  SnapshotRefused,
} from './backup-snapshot';
import { openMoneyTables } from './money-tables';
import { planSettingsSchema, readPlan, writePlan } from './plan-settings';

const TAKEN = '2026-10-11T12:00:00.000Z';

async function settingsOf(db: ReturnType<typeof openMemoryDb>) {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings ORDER BY key',
    [],
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

async function togetherIn(db: ReturnType<typeof openMemoryDb>, cycle: string) {
  const [row] = await db.getAllAsync<{ total: number | null }>(
    'SELECT SUM(amount) AS total FROM together_moves WHERE cycle = ?',
    [cycle],
  );
  return row?.total ?? 0;
}

describe('the snapshot of the phone', () => {
  it('carries every table the app keeps and only the settings a person chose', async () => {
    const db = openMemoryDb();
    await seedMoney(db);
    const snapshot = await buildSnapshot(db, TAKEN);

    expect(backupSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.version).toBe(BACKUP_SNAPSHOT_VERSION);
    expect(snapshot.categories.map((row) => row.id)).toEqual(['food', 'rent']);
    expect(snapshot.spends.map((row) => row.id)).toEqual(['spend-1', 'spend-2']);
    expect(snapshot.spends[0]?.foreignAmount).toEqual({
      currency: 'USD',
      amount: 3.5,
      rate: 25_400,
    });
    expect(snapshot.spendSightings).toEqual([
      {
        spendId: 'spend-1',
        source: 'email',
        seenAt: '2026-10-10T05:13:00.000Z',
        detail: 'Duplicate merged',
        captureId: null,
      },
    ]);
    expect(snapshot.merchantRules).toHaveLength(1);
    expect(snapshot.bills).toHaveLength(1);
    expect(snapshot.bills[0]).toMatchObject({ kind: 'card', lastMonth: '2027-09' });
    expect(snapshot.spends.map((row) => row.paysBill)).toEqual([null, 'bill-1']);
    expect(snapshot.pots).toHaveLength(1);
    expect(snapshot.potMoves).toEqual([
      {
        id: 'move-1',
        potId: 'pot-1',
        amount: 500_000,
        kind: 'setAside',
        cycle: '2026-09-25',
        at: '2026-10-01T00:00:00.000Z',
      },
    ]);
    expect(snapshot.togetherMoves).toEqual([
      {
        id: 'together-1',
        potId: 'shared-1',
        potName: 'Đà Lạt',
        amount: 300_000,
        cycle: '2026-09-25',
        at: '2026-10-05T00:00:00.000Z',
      },
    ]);
    expect(snapshot.closedDays).toHaveLength(1);
    expect(Object.keys(snapshot.settings).sort()).toEqual(['language', 'look', 'plan', 'wallets']);
    expect(snapshotItemCount(snapshot)).toBe(2 + 1 + 1 + 1 + 2 + 1);
  });

  it('puts everything back on an empty phone exactly as it was', async () => {
    const original = openMemoryDb();
    await seedMoney(original);
    const snapshot = await buildSnapshot(original, TAKEN);

    const fresh = openMemoryDb();
    expect(await isFreshDatabase(fresh)).toBe(true);
    await restoreSnapshot(fresh, snapshot);

    expect(await isFreshDatabase(fresh)).toBe(false);
    expect(await buildSnapshot(fresh, TAKEN)).toEqual(snapshot);
  });

  it('brings Budget together history back, so it still counts as a top-up', async () => {
    const original = openMemoryDb();
    await seedMoney(original);
    const snapshot = await buildSnapshot(original, TAKEN);

    const phone = openMemoryDb();
    await phone.runAsync(
      'INSERT INTO together_moves (id, pot_id, pot_name, amount, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      ['stray', 'shared-9', 'Gone', 1_000, '2026-08-25', '2026-09-01T00:00:00.000Z'],
    );
    await restoreSnapshot(phone, snapshot);

    expect(await togetherIn(phone, '2026-09-25')).toBe(300_000);
    expect(await togetherIn(phone, '2026-08-25')).toBe(0);
  });

  it("keeps the phone's together history when an older snapshot does not carry it", async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const { togetherMoves, ...older } = await buildSnapshot(source, TAKEN);
    expect(togetherMoves).toHaveLength(1);
    expect(backupSnapshotSchema.safeParse({ ...older, version: 1 }).success).toBe(true);

    const phone = openMemoryDb();
    await phone.runAsync(
      'INSERT INTO together_moves (id, pot_id, pot_name, amount, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      ['own', 'shared-2', 'Rent', 2_000_000, '2026-09-25', '2026-10-02T00:00:00.000Z'],
    );
    await restoreSnapshot(phone, { ...older, version: 1 });

    expect(await togetherIn(phone, '2026-09-25')).toBe(2_000_000);
    expect((await buildSnapshot(phone, TAKEN)).spends).toHaveLength(2);
  });

  it('carries what a pot held before 6pm back, and still reads a format 2 snapshot', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    await source.runAsync(
      'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      ['opening:pot-1', 'pot-1', 2_000_000, 'opening', '2026-09-25', '2026-10-02T00:00:00.000Z'],
    );
    const snapshot = await buildSnapshot(source, TAKEN);
    expect(backupSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(backupSnapshotSchema.safeParse({ ...snapshot, version: 2 }).success).toBe(true);

    const phone = openMemoryDb();
    await restoreSnapshot(phone, snapshot);
    const moves = await phone.getAllAsync<{ kind: string; amount: number }>(
      'SELECT kind, amount FROM pot_moves ORDER BY id',
      [],
    );
    expect(moves).toEqual([
      { kind: 'setAside', amount: 500_000 },
      { kind: 'opening', amount: 2_000_000 },
    ]);
  });

  it('carries each add of money already saved back with its own amount and day', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const rows = [
      ['opening:pot-1', 'pot-1', 2_000_000, 'opening', '2026-09-25', '2026-10-02T00:00:00.000Z'],
      ['already-saved:a', 'pot-1', 3_000_000, 'opening', '2026-09-25', '2026-10-05T00:00:00.000Z'],
      ['already-saved:b', 'pot-1', 400_000, 'opening', '2026-09-25', '2026-10-09T00:00:00.000Z'],
    ] as const;
    for (const row of rows) {
      await source.runAsync(
        'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
        [...row],
      );
    }
    const snapshot = await buildSnapshot(source, TAKEN);
    expect(backupSnapshotSchema.safeParse(snapshot).success).toBe(true);
    const phone = openMemoryDb();
    await restoreSnapshot(phone, snapshot);
    const read = (db: typeof source) =>
      db.getAllAsync(
        "SELECT id, amount, cycle, at FROM pot_moves WHERE kind = 'opening' ORDER BY id",
        [],
      );
    expect(await read(phone)).toEqual(await read(source));
    expect(await read(phone)).toHaveLength(3);
  });

  it('carries steady jars and spends from a jar back, and a format 5 snapshot restores without them', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    await source.runAsync('UPDATE pots SET monthly = ?, needed_by = NULL WHERE id = ?', [
      400_000,
      'pot-1',
    ]);
    const [spend] = await source.getAllAsync<{ id: string }>('SELECT id FROM spends LIMIT 1', []);
    await source.runAsync('UPDATE spends SET from_pot = ?, from_pot_amount = ? WHERE id = ?', [
      'pot-1',
      10_000,
      spend?.id ?? '',
    ]);
    const snapshot = await buildSnapshot(source, TAKEN);
    expect(snapshot.version).toBe(BACKUP_SNAPSHOT_VERSION);
    const phone = openMemoryDb();
    await restoreSnapshot(phone, snapshot);
    const tables = openMoneyTables(phone);
    expect((await tables.pots.get('pot-1'))?.monthly).toBe(400_000);
    const back = await tables.spends.get(spend?.id ?? '');
    expect([back?.fromPot, back?.fromPotAmount]).toEqual(['pot-1', 10_000]);

    // A phone from 2.1 sent a format 5 snapshot: no jar fields, restored as spending and dated jars.
    const older = {
      ...snapshot,
      version: 5,
      pots: snapshot.pots.map(({ monthly: _m, ...pot }) => pot),
      spends: snapshot.spends.map(({ fromPot: _p, fromPotAmount: _a, ...row }) => row),
    };
    expect(backupSnapshotSchema.safeParse(older).success).toBe(true);
    const restored = openMemoryDb();
    await restoreSnapshot(restored, older);
    const t = openMoneyTables(restored);
    expect((await t.spends.get(spend?.id ?? ''))?.fromPot).toBeNull();
    expect((await t.pots.get('pot-1'))?.monthly).toBeNull();
  });

  it('replaces what the phone held and leaves the settings that are its own', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const snapshot = await buildSnapshot(source, TAKEN);

    const phone = openMemoryDb();
    const tables = openMoneyTables(phone);
    await tables.categories.put({
      id: 'stray',
      name: 'Stray',
      icon: 'redeem',
      hue: 1,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    for (const [key, value] of [
      ['purchases', '{"max":"here"}'],
      ['backup.lastAt', '2026-10-01T00:00:00.000Z'],
      ['language', 'en'],
      ['look', '{"look":"other","config":{}}'],
    ] as const) {
      await phone.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }

    await restoreSnapshot(phone, {
      ...snapshot,
      settings: { ...snapshot.settings, look: undefined },
    });

    expect((await tables.categories.all()).map((row) => row.id)).toEqual(['food', 'rent']);
    const settings = await settingsOf(phone);
    expect(settings['purchases']).toBe('{"max":"here"}');
    expect(settings['backup.lastAt']).toBe('2026-10-01T00:00:00.000Z');
    expect(settings['language']).toBe('vi');
    // The snapshot had no look, so the phone's own is cleared rather than kept.
    expect(settings['look']).toBeUndefined();
  });

  it('leaves the phone untouched when a snapshot fails half way', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const snapshot = await buildSnapshot(source, TAKEN);

    const phone = openMemoryDb();
    await seedMoney(phone);
    const before = await buildSnapshot(phone, TAKEN);

    // A spend whose category is not in the snapshot: the foreign key refuses it mid-restore.
    const broken = {
      ...snapshot,
      categories: snapshot.categories.filter((row) => row.id !== 'food'),
    };
    await expect(restoreSnapshot(phone, broken)).rejects.toThrow();
    expect(await buildSnapshot(phone, TAKEN)).toEqual(before);
  });

  it('carries what was spent since payday, and an older plan comes back without it', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const plan = JSON.parse((await settingsOf(source)).plan ?? '{}') as Record<string, unknown>;
    const answered = { ...plan, spentSincePayday: 6_000_000, futureYouAtPayday: true };
    await writePlan(source, planSettingsSchema.parse(answered));
    const snapshot = await buildSnapshot(source, TAKEN);
    const phone = openMemoryDb();
    await restoreSnapshot(phone, snapshot);
    expect(await readPlan(phone)).toMatchObject({
      spentSincePayday: 6_000_000,
      futureYouAtPayday: true,
    });

    const older = { ...snapshot, settings: { ...snapshot.settings, plan: JSON.stringify(plan) } };
    const again = openMemoryDb();
    await restoreSnapshot(again, older);
    const restored = await readPlan(again);
    expect(restored?.spentSincePayday).toBeUndefined();
    expect(restored?.futureYouAtPayday).toBeUndefined();
  });

  it('refuses unusable settings before it clears anything', async () => {
    const source = openMemoryDb();
    await seedMoney(source);
    const snapshot = await buildSnapshot(source, TAKEN);
    const phone = openMemoryDb();
    await seedMoney(phone);
    const before = await buildSnapshot(phone, TAKEN);

    for (const settings of [
      { ...snapshot.settings, plan: 'not json' },
      { ...snapshot.settings, plan: '{"income":-1}' },
      { ...snapshot.settings, language: 'pt' },
      { ...snapshot.settings, wallets: '{' },
    ]) {
      await expect(restoreSnapshot(phone, { ...snapshot, settings })).rejects.toBeInstanceOf(
        SnapshotRefused,
      );
    }
    expect(await buildSnapshot(phone, TAKEN)).toEqual(before);
  });

  it('leaves out a sighting or a move whose parent is not in the snapshot', async () => {
    const db = openMemoryDb();
    await seedMoney(db);
    await db.runAsync('PRAGMA foreign_keys = OFF', []);
    await db.runAsync(
      'INSERT INTO spend_sightings (spend_id, source, seen_at, detail) VALUES (?, ?, ?, ?)',
      ['gone', 'qr', '2026-10-10T05:13:00.000Z', null],
    );
    await db.runAsync(
      'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      ['orphan', 'gone', 1, 'topUp', '2026-09-25', '2026-10-01T00:00:00.000Z'],
    );
    const snapshot = await buildSnapshot(db, TAKEN);
    expect(snapshot.spendSightings.map((row) => row.spendId)).toEqual(['spend-1']);
    expect(snapshot.potMoves.map((row) => row.id)).toEqual(['move-1']);
  });
});

/** A phone whose kept spend has a photo of `kb` kilobytes (its base64 in the folder). */
async function phoneWithPhoto(kb = 3) {
  const db = openMemoryDb();
  await seedMoney(db);
  const folder = memoryPhotoFiles();
  const jpeg = 'AwMD'.repeat(Math.ceil((kb * 1000) / 3));
  folder.files.set('spend-1-mk2.jpg', jpeg);
  await db.runAsync("UPDATE spends SET photo = 'spend-1-mk2.jpg' WHERE id = 'spend-1'", []);
  return { db, folder, jpeg };
}

const photoOf = async (db: ReturnType<typeof openMemoryDb>, id: string) =>
  (await openMoneyTables(db).spends.get(id))?.photo ?? null;

describe("the spends' photos in the snapshot", () => {
  it('carries a photo through a backup and puts it back with its spend', async () => {
    const { db, folder, jpeg } = await phoneWithPhoto();
    const snapshot = await buildSnapshot(db, TAKEN, folder);
    expect(snapshot.photos).toEqual([{ name: 'spend-1-mk2.jpg', jpeg }]);
    expect(backupSnapshotSchema.safeParse(snapshot).success).toBe(true);

    const fresh = openMemoryDb();
    const freshFolder = memoryPhotoFiles();
    freshFolder.files.set('from-before.jpg', 'AAAA');
    await restoreSnapshot(fresh, snapshot, freshFolder);

    expect(await photoOf(fresh, 'spend-1')).toBe('spend-1-mk2.jpg');
    expect([...freshFolder.files.entries()]).toEqual([['spend-1-mk2.jpg', jpeg]]);
    expect(await buildSnapshot(fresh, TAKEN, freshFolder)).toEqual(snapshot);
  });

  it('round-trips a phone with no photos, and leaves the folder empty', async () => {
    const original = openMemoryDb();
    await seedMoney(original);
    const snapshot = await buildSnapshot(original, TAKEN, memoryPhotoFiles());
    expect(snapshot.photos).toEqual([]);

    const fresh = openMemoryDb();
    const folder = memoryPhotoFiles();
    await restoreSnapshot(fresh, snapshot, folder);
    expect(folder.names()).toEqual([]);
    expect(await photoOf(fresh, 'spend-1')).toBeNull();
    expect(await buildSnapshot(fresh, TAKEN, folder)).toEqual(snapshot);
  });

  it('restores a format 7 backup, from before photos, on a phone that had some', async () => {
    const { db, folder } = await phoneWithPhoto();
    const current = await buildSnapshot(db, TAKEN);
    const older = backupSnapshotSchema.parse({
      ...current,
      version: 7,
      spends: current.spends.map(({ photo: _photo, ...row }) => row),
    });
    expect(older.photos).toBeUndefined();

    await restoreSnapshot(db, older, folder);

    expect(await photoOf(db, 'spend-1')).toBeNull();
    expect(folder.names()).toEqual([]);
    const back = await buildSnapshot(db, TAKEN);
    expect(back.spends.map((s) => s.id)).toEqual(older.spends.map((s) => s.id));
  });

  it('leaves out what does not fit, and that spend comes back without its photo', async () => {
    const { db, folder } = await phoneWithPhoto(BACKUP_MAX_SEALED_BYTES / 1000 / 2);
    // Over the size a kept photo can be: it stays on the phone.
    const snapshot = await buildSnapshot(db, TAKEN, folder);
    expect(snapshot.photos).toEqual([]);

    const fresh = openMemoryDb();
    const freshFolder = memoryPhotoFiles();
    await restoreSnapshot(fresh, snapshot, freshFolder);
    expect(await photoOf(fresh, 'spend-1')).toBeNull();
    expect(freshFolder.names()).toEqual([]);
  });

  it("never writes a photo no spend in the backup holds, or a deleted spend's", async () => {
    const { db, folder, jpeg } = await phoneWithPhoto();
    const snapshot = await buildSnapshot(db, TAKEN, folder);
    const tampered = {
      ...snapshot,
      spends: snapshot.spends.map((s) =>
        s.id === 'spend-2' ? { ...s, photo: 'spend-2-a.jpg' } : s,
      ),
      photos: [
        ...(snapshot.photos ?? []),
        { name: 'spend-2-a.jpg', jpeg },
        { name: 'x-1.jpg', jpeg },
      ],
    };
    const fresh = memoryPhotoFiles();
    await restoreSnapshot(openMemoryDb(), tampered, fresh);
    expect(fresh.names()).toEqual(['spend-1-mk2.jpg']);
  });
});

describe('a fresh phone', () => {
  it('is one with no plan and no spend', async () => {
    const db = openMemoryDb();
    expect(await isFreshDatabase(db)).toBe(true);
    await openMoneyTables(db).categories.put({
      id: 'food',
      name: 'Food',
      icon: 'restaurant',
      hue: 45,
      countsDaily: true,
      sort: 0,
      archivedAt: null,
    });
    expect(await isFreshDatabase(db)).toBe(true);
    await db.runAsync("INSERT INTO settings (key, value) VALUES ('plan', '{}')", []);
    expect(await isFreshDatabase(db)).toBe(false);
  });
});

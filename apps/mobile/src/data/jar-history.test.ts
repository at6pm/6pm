import { describe, expect, it } from '@jest/globals';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { readJarHistory } from './jar-history';
import type { SqlDatabase } from './table';

const pot = { id: 'tet', createdAt: '2026-08-01T05:00:00.000Z' };

async function seed(db: SqlDatabase) {
  await db.runAsync(
    "INSERT INTO categories (id, name, icon, hue, counts_daily, sort) VALUES ('food', 'Food', 'restaurant', 40, 1, 0), ('rent', 'Rent', 'home', 40, 0, 1)",
    [],
  );
  for (const id of ['tet', 'other']) {
    await db.runAsync(
      `INSERT INTO pots (id, kind, name, icon, hue, goal, needed_by, share, paused, created_at)
       VALUES (?, 'occasion', ?, 'savings', 40, 7000000, '2027-02', NULL, 0, ?)`,
      [id, id, pot.createdAt],
    );
  }
  const move = (
    id: string,
    potId: string,
    kind: string,
    amount: number,
    cycle: string,
    at: string,
  ) =>
    db.runAsync(
      'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, potId, amount, kind, cycle, at],
    );
  await move('o', 'tet', 'opening', 1_000_000, '2026-07-31', '2026-08-01T05:00:00.000Z');
  await move('s1', 'tet', 'setAside', 1_000_000, '2026-08-31', '2026-09-02T01:00:00.000Z');
  await move('s2', 'tet', 'setAside', 1_000_000, '2026-09-30', '2026-10-01T01:00:00.000Z');
  await move('s0', 'tet', 'setAside', 0, '2026-07-31', '2026-08-01T05:00:00.000Z');
  await move('t1', 'tet', 'topUp', 100_000, '2026-08-31', '2026-09-12T05:00:00.000Z');
  await move('x', 'other', 'topUp', 500_000, '2026-08-31', '2026-09-12T05:00:00.000Z');
  const put = (
    id: string,
    day: string,
    amount: number,
    status: string,
    category: string,
    fromPotAmount: number | null,
  ) =>
    db.runAsync(
      `INSERT INTO spends (id, day, at, amount, category_id, merchant, source, status, created_at,
         updated_at, from_pot, from_pot_amount, for_work)
       VALUES (?, ?, ?, ?, ?, 'Laptop repair', 'manual', ?, ?, ?, 'tet', ?, 0)`,
      [
        id,
        day,
        `${day}T05:00:00.000Z`,
        amount,
        category,
        status,
        `${day}T05:00:00.000Z`,
        `${day}T05:00:00.000Z`,
        fromPotAmount,
      ],
    );
  await put('laptop', '2026-09-07', 1_500_000, 'kept', 'food', 1_200_000);
  await put('gone', '2026-09-08', 300_000, 'deleted', 'food', null);
  await put('rent', '2026-09-09', 300_000, 'kept', 'rent', null);
}

describe('a jar’s moves', () => {
  it('lists paydays, holds, spends and the start, newest first', async () => {
    const db = openMemoryDb();
    await seed(db);
    const lines = await readJarHistory(db, pot, new Set(['rent']));
    expect(lines.map((l) => [l.kind, l.day, l.amount])).toEqual([
      ['payday', '2026-09-30', 1_000_000],
      ['topUp', '2026-09-12', 100_000],
      ['spent', '2026-09-07', 1_200_000],
      ['payday', '2026-08-31', 1_000_000],
      ['started', '2026-08-01', 1_000_000],
    ]);
  });

  it('keeps only what the jar covered, and leaves out spends that no longer count', async () => {
    const db = openMemoryDb();
    await seed(db);
    const spent = (await readJarHistory(db, pot, new Set(['rent']))).filter(
      (l) => l.kind === 'spent',
    );
    expect(spent).toEqual([
      {
        kind: 'spent',
        day: '2026-09-07',
        amount: 1_200_000,
        spendId: 'laptop',
        merchant: 'Laptop repair',
        categoryId: 'food',
      },
    ]);
  });

  it('starts a jar with nothing before 6pm at zero', async () => {
    const db = openMemoryDb();
    await seed(db);
    const lines = await readJarHistory(db, { id: 'other', createdAt: pot.createdAt }, new Set());
    expect(lines.at(-1)).toEqual({ kind: 'started', day: '2026-08-01', amount: 0 });
    expect(lines).toHaveLength(2);
  });
});

describe('a jar’s moves after one was removed', () => {
  it('names each top-up’s row, and hides an earlier one taken back this cycle', async () => {
    const db = openMemoryDb();
    await seed(db);
    const before = await readJarHistory(db, pot, new Set(['rent']));
    expect(before.find((l) => l.kind === 'topUp')).toMatchObject({ moveId: 't1' });
    await db.runAsync(
      "INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES ('taken-back:t1', 'tet', -100000, 'topUp', '2026-09-30', '2026-10-02T05:00:00.000Z')",
      [],
    );
    const after = await readJarHistory(db, pot, new Set(['rent']));
    expect(after.some((l) => l.kind === 'topUp')).toBe(false);
    expect(after).toHaveLength(before.length - 1);
  });
});

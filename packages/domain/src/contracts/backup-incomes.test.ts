import { describe, expect, it } from 'vitest';

import { BACKUP_SNAPSHOT_VERSION, backupSnapshotSchema } from './backup';

const empty = {
  version: BACKUP_SNAPSHOT_VERSION,
  takenAt: '2026-11-15T12:00:00.000Z',
  settings: {},
  categories: [],
  spends: [],
  spendSightings: [],
  merchantRules: [],
  bills: [],
  pots: [],
  potMoves: [],
  closedDays: [],
};

const pay = {
  id: 'in-1',
  day: '2026-11-13',
  at: '2026-11-13T09:00:00.000Z',
  amount: 4_000_000,
  categoryId: 'income',
  merchant: 'Công ty Ánh Dương',
  note: null,
  source: 'alert',
  status: 'kept',
  previousStatus: null,
  wallet: 'MB',
  forWork: false,
  detail: null,
  foreignAmount: null,
  direction: 'in',
  moneyIn: 'pay',
  createdAt: '2026-11-13T09:00:00.000Z',
  updatedAt: '2026-11-13T09:00:00.000Z',
};

const rule = {
  merchantKey: 'cong ty anh duong',
  merchant: 'Công ty Ánh Dương',
  categoryId: 'income',
  learnedTimes: 4,
  setByUser: false,
};

describe('snapshot format 11', () => {
  it('is the format a phone writes now', () => {
    expect(BACKUP_SNAPSHOT_VERSION).toBe(11);
  });

  it('carries money in named by its income, what was held back, and what a sender is remembered as', () => {
    const parsed = backupSnapshotSchema.parse({
      ...empty,
      spends: [{ ...pay, incomeId: 'shifts', heldBack: 400_000, certificate: false }],
      merchantRules: [
        { ...rule, work: true, moneyIn: 'saved', savedTo: 'buffer', incomeId: 'shifts' },
      ],
    });
    expect(parsed.spends[0]).toMatchObject({
      incomeId: 'shifts',
      heldBack: 400_000,
      certificate: false,
    });
    expect(parsed.merchantRules[0]).toMatchObject({
      work: true,
      moneyIn: 'saved',
      savedTo: 'buffer',
      incomeId: 'shifts',
    });
  });

  it('refuses what is held back below nothing, and a remembered money in it does not know', () => {
    expect(
      backupSnapshotSchema.safeParse({ ...empty, spends: [{ ...pay, heldBack: -1 }] }).success,
    ).toBe(false);
    expect(
      backupSnapshotSchema.safeParse({ ...empty, merchantRules: [{ ...rule, moneyIn: 'bonus' }] })
        .success,
    ).toBe(false);
  });

  it('reads a format 10 snapshot, which has none of them', () => {
    const v10 = backupSnapshotSchema.parse({
      ...empty,
      version: 10,
      spends: [pay],
      merchantRules: [rule],
    });
    expect(v10.version).toBe(10);
    expect(v10.spends[0]).not.toHaveProperty('incomeId');
    expect(v10.merchantRules[0]).not.toHaveProperty('work');
  });

  it('refuses format 12, which a phone from after this one wrote', () => {
    expect(backupSnapshotSchema.safeParse({ ...empty, version: 12 }).success).toBe(false);
  });
});

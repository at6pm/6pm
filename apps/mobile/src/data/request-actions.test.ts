import { describe, expect, it, jest } from '@jest/globals';

import {
  backupSnapshotSchema,
  BACKUP_SNAPSHOT_VERSION,
  isRequestCode,
  yearWork,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { buildSnapshot, restoreSnapshot } from './backup-snapshot';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { openOwedOf, owedActions } from './owed-actions';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import { readPayers, readRequestJobs, readWorkYearRows, requestActions } from './request-actions';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-11-24';

async function open(today = TODAY, db = openMemoryDb()) {
  const store: MoneyStore = createMoneyStore(db, today);
  await writePlan(db, {
    ...DEFAULT_PLAN,
    income: 20_000_000,
    futureYou: 0,
    payday: { kind: 'sameDay', day: 1 },
    startedOn: '2026-09-01',
  });
  await store.tables.categories.put({
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    hue: 40,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.load(today);
  return {
    store,
    db,
    money: moneyActions(store),
    owed: owedActions(store),
    requests: requestActions(store),
  };
}

const diep = {
  name: 'Cô Diệp',
  job: 'Menu, quán Lá',
  amount: 1_800_000,
  work: true,
  company: false,
};

describe('asking to be paid', () => {
  it('puts a strip on Who owes me with no split, a code, the job and the marks', async () => {
    const ctx = await open();
    const row = await ctx.requests.ask(diep);
    expect(row).toMatchObject({
      name: 'Cô Diệp',
      job: 'Menu, quán Lá',
      amount: 1_800_000,
      day: TODAY,
      work: true,
      company: false,
      remindedAt: null,
    });
    expect(row?.spendId).toBe(row?.id);
    expect(isRequestCode(row?.code ?? '')).toBe(true);
    const open2 = openOwedOf(ctx.store.getSnapshot());
    expect(open2.map((l) => l.id)).toEqual([row?.id]);
  });

  it('gives each open strip its own code', async () => {
    const ctx = await open();
    const codes = new Set<string>();
    for (let i = 0; i < 20; i += 1) {
      const row = await ctx.requests.ask({ ...diep, amount: 100_000 + i });
      codes.add(row?.code ?? '');
    }
    expect(codes.size).toBe(20);
  });

  it('refuses a strip with no name or no amount', async () => {
    const ctx = await open();
    expect(await ctx.requests.ask({ ...diep, name: ' ' })).toBeNull();
    expect(await ctx.requests.ask({ ...diep, amount: 0 })).toBeNull();
  });

  it('records a reminder sent', async () => {
    const ctx = await open();
    const row = await ctx.requests.ask(diep);
    await ctx.requests.reminded(row?.id ?? '');
    expect(ctx.store.getSnapshot().owed[0]?.remindedAt).toEqual(expect.any(String));
  });
});

describe('money in pays a request', () => {
  async function landed(ctx: Awaited<ReturnType<typeof open>>, amount: number, merchant: string) {
    return ctx.money.addSpend({
      amount,
      categoryId: 'food',
      merchant,
      source: 'alert',
      status: 'caught',
      direction: 'in',
      memo: 'chuyen khoan',
    });
  }

  it('stamps the strip paid, keeps the money as work with what was held back', async () => {
    const ctx = await open();
    const gio = await ctx.requests.ask({
      ...diep,
      name: 'Nhà sách Gió',
      job: 'Cover, part 2',
      amount: 6_000_000,
      company: true,
    });
    const money = await landed(ctx, 5_400_000, 'TRAN MINH LAM');
    const matched = await ctx.requests.match(money.id, gio?.id ?? '', 600_000);
    expect(matched).not.toBeNull();
    expect(openOwedOf(ctx.store.getSnapshot())).toHaveLength(0);
    expect(await ctx.store.tables.spends.get(money.id)).toMatchObject({
      status: 'kept',
      forWork: true,
      heldBack: 600_000,
      certificate: null,
      note: 'Cover, part 2',
    });
    // The sender is remembered: work, holding back a tenth, and as paying for Nhà sách Gió.
    expect(await ctx.store.tables.rules.get('tran minh lam')).toMatchObject({
      work: true,
      heldBackShare: 10,
    });
    const payers = await readPayers(ctx.store);
    expect([...(payers.get('tran minh lam') ?? [])]).toEqual(['nha sach gio']);
    expect(await readRequestJobs(ctx.store, '2026-01-01', '2026-12-31')).toEqual(
      new Map([[money.id, 'Cover, part 2']]),
    );
    // Taken back, the strip is open and the money waits as it did.
    await ctx.requests.unmatch(matched!);
    expect(openOwedOf(ctx.store.getSnapshot())).toHaveLength(1);
    expect(await ctx.store.tables.spends.get(money.id)).toMatchObject({
      status: 'caught',
      heldBack: null,
    });
  });

  it('brings the next payment from a sender holding back a tenth with 10% already set', async () => {
    const ctx = await open();
    const first = await landed(ctx, 18_000_000, 'STUDIO MAY');
    await ctx.money.placeMoneyIn(first.id, { moneyIn: 'spread' });
    await ctx.requests.setHeldBack(first.id, 2_000_000);
    expect((await ctx.store.tables.rules.get('studio may'))?.heldBackShare).toBe(10);
    const next = await landed(ctx, 9_000_000, 'STUDIO MAY');
    await ctx.money.placeMoneyIn(next.id, { moneyIn: 'spread' });
    expect((await ctx.store.tables.spends.get(next.id))?.heldBack).toBe(1_000_000);
    // A payback from the same sender is never given tax held back.
    const back = await landed(ctx, 300_000, 'STUDIO MAY');
    await ctx.money.placeMoneyIn(back.id, { moneyIn: 'payback', givesBack: null });
    expect((await ctx.store.tables.spends.get(back.id))?.heldBack).toBeNull();
  });

  it('inks the certificate with the day it came, and the year counts what was billed', async () => {
    const ctx = await open();
    const money = await landed(ctx, 18_000_000, 'STUDIO MAY');
    await ctx.money.markForWork(money.id, true);
    await ctx.money.setStatus(money.id, 'kept');
    await ctx.requests.setHeldBack(money.id, 2_000_000);
    await ctx.requests.toggleCertificate(money.id, TODAY);
    expect(await ctx.store.tables.spends.get(money.id)).toMatchObject({
      heldBack: 2_000_000,
      certificate: true,
      certificateOn: TODAY,
    });
    const year = yearWork(await readWorkYearRows(ctx.store, 2026), 2026);
    expect(year).toMatchObject({ billed: 20_000_000, heldBack: 2_000_000, kept: 18_000_000 });
    expect(year.uncertified.count).toBe(0);
    // Nothing held back takes the certificate with it.
    await ctx.requests.setHeldBack(money.id, 0);
    expect(await ctx.store.tables.spends.get(money.id)).toMatchObject({
      heldBack: null,
      certificate: null,
      certificateOn: null,
    });
  });
});

describe('the backup', () => {
  it('carries a request with its code and job, within the same snapshot format', async () => {
    const ctx = await open();
    const row = await ctx.requests.ask(diep);
    const snapshot = await buildSnapshot(ctx.db, '2026-11-24T12:00:00.000Z');
    expect(snapshot.version).toBe(BACKUP_SNAPSHOT_VERSION);
    expect(backupSnapshotSchema.parse(snapshot).owed?.[0]).toMatchObject({
      code: row?.code,
      job: 'Menu, quán Lá',
      work: true,
    });
    const phone = await open();
    await restoreSnapshot(phone.db, snapshot);
    await phone.store.load(TODAY);
    expect(openOwedOf(phone.store.getSnapshot())).toEqual([
      expect.objectContaining({ id: row?.id, code: row?.code, job: 'Menu, quán Lá' }),
    ]);
  });
});

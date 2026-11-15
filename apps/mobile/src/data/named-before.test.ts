import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { heardAlertId, sightingOfEmail, type EmailCapture, type InboxSpend } from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

// Every name, account and amount here is made up.

const TODAY = '2026-10-11';
const at = (day: number, minutes = 0) => new Date(2026, 9, day, 9, minutes).toISOString();

let n = 0;
const alert = (over: Partial<InboxSpend> = {}): InboxSpend => {
  n += 1;
  return {
    v: 1,
    id: heardAlertId(
      { app: 'MB Bank', title: '', body: `GD: -3,000,000VND ${n}` },
      crypto.randomUUID(),
    ),
    kind: 'spend',
    source: 'alert',
    status: 'caught',
    at: at(1),
    amount: 3_000_000,
    merchant: 'NGUYEN VAN AN',
    categoryId: null,
    receipt: { bank: 'MB Bank', namingLines: [] },
    direction: 'out',
    atKind: 'delivered',
    ...over,
  };
};

describe('a payee the person named before', () => {
  let store: MoneyStore;
  let actions: ReturnType<typeof moneyActions>;

  beforeEach(async () => {
    const db = openMemoryDb();
    store = createMoneyStore(db, TODAY);
    await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-09-01' });
    for (const [i, id] of ['food', 'home'].entries()) {
      await store.tables.categories.put({
        id,
        name: id,
        icon: 'restaurant',
        hue: 40,
        countsDaily: true,
        sort: i,
        archivedAt: null,
      });
    }
    await store.load(TODAY);
    actions = moneyActions(store);
  });

  const save = (item: InboxSpend) =>
    saveInboxSpend({ store, actions, enrich: (i) => Promise.resolve(i) }, item);

  it('names the next alert from that payee as the person did, filed where they filed it', async () => {
    const first = await save(alert());
    await actions.update(first ?? '', { merchant: 'Rent · Mr An', categoryId: 'home' });
    await actions.setStatus(first ?? '', 'kept');
    const next = await save(alert({ at: at(8) }));
    expect(await store.tables.spends.get(next ?? '')).toMatchObject({
      merchant: 'Rent · Mr An',
      categoryId: 'home',
    });
  });

  it('names it after a typed spend the alert was joined to', async () => {
    const typed = await actions.addSpend({
      amount: 3_000_000,
      categoryId: 'home',
      merchant: 'Rent',
      source: 'manual',
      status: 'kept',
      at: new Date(at(1)),
    });
    const caught = await save(alert({ at: at(1, 1) }));
    await actions.sameAsTyped(caught ?? '', typed.id);
    const next = await save(alert({ at: at(8) }));
    expect(await store.tables.spends.get(next ?? '')).toMatchObject({ merchant: 'Rent' });
  });

  it('never takes a name a shop’s mail gave for one the person gave', async () => {
    const first = await save(alert({ merchant: 'SHOPEE', amount: 120_000 }));
    const mail: EmailCapture = {
      id: 'em-4410',
      amount: 120_000,
      merchant: 'Shopee: Áo khoác',
      at: at(1, 2),
      from: 'info@mail.shopee.example',
      bank: null,
      code: null,
    };
    await actions.ingest({
      sighting: sightingOfEmail(mail),
      handed: mail,
      message: { id: mail.id, source: 'email', at: mail.at },
      spend: {
        id: mail.id,
        amount: mail.amount,
        categoryId: 'food',
        merchant: mail.merchant,
        source: 'email',
        status: 'caught',
        detail: mail.from,
        at: new Date(mail.at),
      },
    });
    await actions.setStatus(first ?? '', 'kept');
    const next = await save(alert({ merchant: 'SHOPEE', amount: 85_000, at: at(8) }));
    expect((await store.tables.spends.get(next ?? ''))?.merchant).toBe('SHOPEE');
  });
});

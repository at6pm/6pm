import { describe, expect, it, jest } from '@jest/globals';

import {
  merchantKeyOf,
  moneyInAsk,
  rememberedPlaceOf,
  sightingOfEmail,
  yearWork,
  type EmailCapture,
  type InboxSpend,
  type SpendRow,
} from '@6pm/domain';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { planOfAnswers, startingWays, type MoneyWay } from '../features/onboarding/money-ways';
import { saveInboxSpend } from './inbox-import';
import { moneyActions } from './money-actions';
import { createMoneyStore, periodOf, type MoneyStore } from './money-store';
import { owedLineOf } from './owed-actions';
import { completeOnboarding } from './onboarding';
import { readWorkYearRows, requestActions } from './request-actions';
import { workMonthOf } from './work-money';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));
jest.mock('../money/device-money', () => ({ deviceCurrencyCode: () => 'VND' }));

// Capture says what a message is before incomes place money in: a refund, a reversal, a failed
// charge or an own transfer is never a pay, what landed, takings or a request paid, and money in
// from a sender remembered holding back a tenth arrives with it held back however it came. Every
// name, account and code here is made up.

const STARTED = '2026-11-01';
const SUN = '2026-11-15';
const at = (minutes: number) => new Date(2026, 10, 15, 10, minutes, 0).toISOString();

/** A freelancer whose money only lands, with MB always work, set up on 1 Nov. */
async function joined(ways: readonly MoneyWay[] = ['landed']) {
  const answers = { ...startingWays(18_000_000, 4_000_000), ways };
  const plan = planOfAnswers(answers, STARTED);
  const store = createMoneyStore(openMemoryDb(), STARTED);
  await completeOnboarding(
    store,
    {
      income: plan.income,
      payday: plan.payday,
      futureYou: 500_000,
      bills: [],
      wallets: ['MB'],
      closeAt: '18:00',
      ...(plan.incomes
        ? { incomes: { ...plan.incomes, workBanks: { MB: 'always' as const } } }
        : {}),
    },
    { today: STARTED, language: 'en' },
  );
  await store.load(SUN);
  // Studio May is a client: work, paying into the landed income, holding back a tenth.
  await store.tables.rules.put({
    merchantKey: 'studio may',
    merchant: 'STUDIO MAY',
    categoryId: store.getSnapshot().categories[0]?.id ?? 'food',
    learnedTimes: 1,
    setByUser: false,
    work: true,
    moneyIn: 'pay',
    incomeId: 'landed',
    heldBackShare: 10,
  });
  const actions = moneyActions(store);
  return { store, actions, requests: requestActions(store) };
}

const alert = (over: Partial<InboxSpend> = {}): InboxSpend => ({
  v: 1,
  id: crypto.randomUUID(),
  kind: 'spend',
  source: 'alert',
  status: 'caught',
  at: at(0),
  amount: 9_000_000,
  merchant: 'STUDIO MAY',
  categoryId: null,
  receipt: { bank: 'Techcombank', namingLines: [] },
  direction: 'in',
  atKind: 'delivered',
  ...over,
});

function inbox(store: MoneyStore, actions: ReturnType<typeof moneyActions>) {
  return async (item: InboxSpend): Promise<SpendRow | null> => {
    const id = await saveInboxSpend({ store, actions, enrich: (i) => Promise.resolve(i) }, item);
    return id === null ? null : store.tables.spends.get(id);
  };
}

/** The question the close would ask about this money in, with all the sender is known for. */
async function closeAsk(store: MoneyStore, row: SpendRow) {
  const snap = store.getSnapshot();
  const rule = await store.tables.rules.get(merchantKeyOf(row.merchant));
  return moneyInAsk(
    {
      day: row.day,
      amount: row.amount,
      merchant: row.merchant,
      note: row.note,
      memo: row.memo ?? null,
      hint: row.moneyIn === 'refund' ? 'refund' : null,
    },
    {
      income: snap.plan?.income ?? 0,
      cycle: snap.cycle,
      spends: [],
      owed: snap.owed.map(owedLineOf),
      incomes: snap.plan?.incomes,
      remembered: rememberedPlaceOf(rule, {
        jars: new Set(),
        incomes: new Set((snap.plan?.incomes ?? []).map((i) => i.id)),
      }),
      knownSender: rule !== null,
      work: true,
    },
  );
}

/** Nothing counted: no money landed, no takings this month, nothing held back this year. */
async function countsNothing(store: MoneyStore) {
  const snap = store.getSnapshot();
  expect(periodOf(snap)?.credited ?? 0).toBe(0);
  expect(workMonthOf(snap)?.in ?? 0).toBe(0);
  expect(yearWork(await readWorkYearRows(store, 2026), 2026)).toMatchObject({ heldBack: 0 });
}

describe('the remembered tenth, through the one way in', () => {
  it('arrives held back on a bank alert, a mail and a typed entry', async () => {
    const { store, actions } = await joined();
    const fromAlert = await inbox(store, actions)(alert());
    expect(fromAlert).toMatchObject({ heldBack: 1_000_000, forWork: true });

    const mail: EmailCapture = {
      id: 'em-may-1',
      amount: 4_500_000,
      merchant: 'STUDIO MAY',
      at: at(30),
      from: 'thongbao@tcbmau.example',
      bank: 'Techcombank',
      code: null,
      kind: 'incoming',
    };
    const { capture } = await actions.ingest({
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
        direction: 'in',
      },
    });
    expect(capture?.row.heldBack).toBe(500_000);

    const typed = await actions.addSpend({
      amount: 2_700_000,
      categoryId: 'food',
      merchant: 'Studio May',
      source: 'manual',
      status: 'kept',
      direction: 'in',
      at: new Date(at(60)),
    });
    expect(typed.heldBack).toBe(300_000);
  });
});

describe('what capture said the money is, before incomes place it', () => {
  it('a refund is never a pay, what landed, takings or a request paid', async () => {
    const { store, actions, requests } = await joined();
    const request = await requests.ask({
      name: 'Studio May',
      job: 'Logo',
      amount: 9_000_000,
      work: true,
      company: true,
    });
    const refund = await inbox(
      store,
      actions,
    )(
      alert({
        what: 'refund',
        receipt: {
          bank: 'Techcombank',
          namingLines: [],
          memo: `${request?.code ?? ''} HOAN TIEN`,
        },
      }),
    );
    expect(refund).toMatchObject({
      direction: 'in',
      moneyIn: 'refund',
      heldBack: null,
      forWork: false,
    });
    const ask = await closeAsk(store, refund as SpendRow);
    expect(['pay', 'request', 'remembered', 'byHand']).not.toContain(ask?.kind);
    // The same money told as plain money in is the client's, as incomes place it.
    const paid = await inbox(store, actions)(alert({ at: at(5), amount: 4_500_000 }));
    expect(await closeAsk(store, paid as SpendRow)).toMatchObject({ kind: 'pay' });
  });

  it('a reversal voids the payment it takes back and makes no money in', async () => {
    const { store, actions } = await joined();
    const save = inbox(store, actions);
    const paid = await save(
      alert({ direction: 'out', amount: 250_000, merchant: 'CUA HANG MAU', reference: 'FT1' }),
    );
    // The reversal is kept with the payment it voids; nothing new is made.
    const voided = await save(
      alert({ what: 'reversal', amount: 250_000, at: at(90), reference: 'FT1' }),
    );
    expect(voided?.id).toBe(paid?.id);
    expect((await store.tables.spends.get(paid?.id ?? ''))?.status).toBe('deleted');
    expect(await store.tables.spends.select("WHERE status != 'deleted'", [])).toEqual([]);
    await countsNothing(store);
  });

  it('a failed charge voids its payment and makes no money in', async () => {
    const { store, actions } = await joined();
    const save = inbox(store, actions);
    const paid = await save(
      alert({ direction: 'out', amount: 250_000, merchant: 'CUA HANG MAU', reference: 'FT2' }),
    );
    const voided = await save(
      alert({ what: 'failed', direction: 'out', amount: 250_000, at: at(3), reference: 'FT2' }),
    );
    expect(voided?.id).toBe(paid?.id);
    expect((await store.tables.spends.get(paid?.id ?? ''))?.status).toBe('deleted');
    expect(await store.tables.spends.select("WHERE status != 'deleted'", [])).toEqual([]);
    await countsNothing(store);
  });

  it('money moved between the person’s own accounts counts as nothing, though a client sent it', async () => {
    const { store, actions } = await joined();
    const save = inbox(store, actions);
    await save(alert({ amount: 5_000_000 }));
    await save(
      alert({
        amount: 5_000_000,
        direction: 'out',
        at: new Date(Date.parse(at(0)) + 30_000).toISOString(),
        receipt: { bank: 'MB Bank', namingLines: [] },
      }),
    );
    const rows = await store.tables.spends.select("WHERE status != 'deleted'", []);
    expect(rows.map((r) => r.status)).toEqual(['skipped']);
    await countsNothing(store);
  });
});

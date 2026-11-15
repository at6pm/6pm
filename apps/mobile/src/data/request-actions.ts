import { randomUUID } from 'expo-crypto';

import {
  heldBackRemembered,
  heldBackShareOf,
  merchantKeyOf,
  payersOf,
  requestCode,
  toggleCertificate,
  type LocalDate,
  type MerchantRuleRow,
  type OwedRow,
  type SpendRow,
} from '@6pm/domain';

import { findSpend, type MoneyStore } from './money-store';

/** What "Ask to be paid" makes: who, the job, the amount, and the two marks. */
export interface NewRequest {
  readonly name: string;
  readonly job: string | null;
  readonly amount: number;
  readonly work: boolean;
  /** The client is a shop or a company: their avatar is square. */
  readonly company: boolean;
}

/** What matching money in to a request did, so it can be taken back. */
export interface Matched {
  readonly lineId: string;
  readonly moneyInId: string;
  readonly before: SpendRow;
}

const OPEN = 'settled_at IS NULL';

/**
 * Asking to be paid and what follows it: a request is a strip on Who owes me made without a split
 * (its own id is its `spendId`), with a code for the transfer note. Money in that pays one stamps
 * it paid; what a client held back and whether its certificate came ride on that money in. Each
 * write commits, then reads the store again, so Today, the owed list and the Diary move together.
 */
export function requestActions(store: MoneyStore) {
  const { db, tables } = store;
  const reload = () => store.loadInTurn(store.getSnapshot().today);
  const now = () => new Date().toISOString();

  const current = async (id: string): Promise<SpendRow | null> =>
    findSpend(store.getSnapshot(), id) ?? (await tables.spends.get(id));

  /** Remembers a sender: whether its money is work, and the share it holds back. */
  const rememberSender = async (row: SpendRow, work: boolean | null) => {
    const key = merchantKeyOf(row.merchant);
    if (key === '') return;
    const existing = await tables.rules.get(key);
    const base: MerchantRuleRow = existing ?? {
      merchantKey: key,
      merchant: row.merchant.trim(),
      categoryId: row.categoryId,
      learnedTimes: 0,
      setByUser: false,
    };
    await tables.rules.put({
      ...base,
      ...(work === null ? {} : { work }),
      heldBackShare: heldBackShareOf(row.amount, row.heldBack),
    });
  };

  return {
    /** "Ask to be paid": a new open strip, asked today, with a code no open strip has. */
    ask: (request: NewRequest): Promise<OwedRow | null> =>
      store.exclusive(async () => {
        const name = request.name.trim();
        if (name === '' || !Number.isSafeInteger(request.amount) || request.amount <= 0) {
          return null;
        }
        const open = await tables.owed.select(`WHERE code IS NOT NULL AND ${OPEN}`, []);
        const at = now();
        const id = randomUUID();
        const row: OwedRow = {
          id,
          spendId: id,
          name,
          amount: request.amount,
          day: store.getSnapshot().today,
          sort: 0,
          createdAt: at,
          settledAt: null,
          settledBy: null,
          settledSpendId: null,
          remindAt: null,
          code: requestCode(open.flatMap((line) => (line.code ? [line.code] : []))),
          job: request.job?.trim() ? request.job.trim() : null,
          work: request.work,
          company: request.company,
          askedAt: at,
          remindedAt: null,
          updatedAt: at,
        };
        await tables.owed.put(row);
        await reload();
        return row;
      }),

    /** The strip was sent again ("Remind"): its line reads "Reminded {date}". */
    reminded: (lineId: string): Promise<void> =>
      store.exclusive(async () => {
        const line = await tables.owed.get(lineId);
        if (!line) return;
        const at = now();
        await tables.owed.put({
          ...line,
          remindedAt: at,
          askedAt: line.askedAt ?? at,
          updatedAt: at,
        });
        await reload();
      }),

    /**
     * "Paid in cash": the request is settled by money in of its amount kept today, in cash: work
     * money in for a work request (takings), money into the days for any other.
     */
    paidInCash: (lineId: string): Promise<SpendRow | null> =>
      store.exclusive(async () => {
        const line = await tables.owed.get(lineId);
        if (!line || line.code == null || line.settledAt !== null) return null;
        const snap = store.getSnapshot();
        const at = now();
        const work = line.work === true;
        const row: SpendRow = {
          id: randomUUID(),
          day: snap.today,
          at,
          amount: line.amount,
          categoryId: snap.categories[0]?.id ?? 'other',
          merchant: line.name ?? '',
          note: line.job ?? null,
          source: 'cash',
          status: 'kept',
          previousStatus: null,
          wallet: null,
          forWork: work,
          detail: null,
          foreignAmount: null,
          currencyGuessed: false,
          memo: null,
          direction: 'in',
          moneyIn: work ? null : 'spread',
          givesBack: null,
          savedTo: null,
          fromPot: null,
          fromPotAmount: null,
          createdAt: at,
          updatedAt: at,
        };
        await db.withTransactionAsync(async () => {
          await tables.spends.put(row);
          await tables.owed.put({
            ...line,
            settledAt: at,
            settledBy: 'cash',
            settledSpendId: row.id,
            updatedAt: at,
          });
        });
        await reload();
        return row;
      }),

    /** Takes back a request that will not be paid: it leaves the list. */
    remove: (lineId: string): Promise<void> =>
      store.exclusive(async () => {
        const line = await tables.owed.get(lineId);
        if (!line || line.code == null) return;
        await tables.owed.remove(lineId);
        await reload();
      }),

    /**
     * Money in pays a request (by its code, or matched by hand): the strip is stamped paid, the
     * money is kept, carrying the request's work stamp and what the client held back, and its
     * sender is remembered (so it is no longer a name nobody knows, and holds back the same next
     * time). Work money in is takings, which reach the days as the work keeps them; other money
     * in goes into the days.
     */
    match: (moneyInId: string, lineId: string, heldBack: number): Promise<Matched | null> =>
      store.exclusive(async () => {
        const line = await tables.owed.get(lineId);
        const row = await current(moneyInId);
        if (!line || line.settledAt !== null || !row || row.direction !== 'in') return null;
        const at = now();
        const held = Math.max(0, Math.round(heldBack));
        const work = line.work === true;
        const next: SpendRow = {
          ...row,
          status: 'kept',
          previousStatus: row.status === 'kept' ? row.previousStatus : row.status,
          forWork: work || row.forWork,
          moneyIn: work ? (row.moneyIn ?? null) : 'spread',
          heldBack: held > 0 ? held : (row.heldBack ?? null),
          note: row.note ?? line.job ?? null,
          updatedAt: at,
        };
        await db.withTransactionAsync(async () => {
          await tables.spends.put(next);
          await tables.owed.put({
            ...line,
            settledAt: at,
            settledBy: 'payback',
            settledSpendId: moneyInId,
            updatedAt: at,
          });
          await rememberSender(next, work ? true : null);
        });
        await reload();
        return { lineId, moneyInId, before: row };
      }),

    /** Takes a match back: the strip is open again and the money in as it was. */
    unmatch: (matched: Matched): Promise<void> =>
      store.exclusive(async () => {
        const line = await tables.owed.get(matched.lineId);
        const at = now();
        await db.withTransactionAsync(async () => {
          await tables.spends.put({ ...matched.before, updatedAt: at });
          if (line) {
            await tables.owed.put({
              ...line,
              settledAt: null,
              settledBy: null,
              settledSpendId: null,
              updatedAt: at,
            });
          }
        });
        await reload();
      }),

    /**
     * What a client held back from money in (nothing is 0), remembered for its sender as a share
     * when it is a tenth. The certificate mark goes when nothing is held back.
     */
    setHeldBack: (moneyInId: string, heldBack: number): Promise<SpendRow | null> =>
      store.exclusive(async () => {
        const row = await current(moneyInId);
        if (!row || row.direction !== 'in') return null;
        const held = Math.max(0, Math.round(heldBack));
        const next: SpendRow = {
          ...row,
          heldBack: held > 0 ? held : null,
          ...(held > 0 ? {} : { certificate: null, certificateOn: null }),
          updatedAt: now(),
        };
        await db.withTransactionAsync(async () => {
          await tables.spends.put(next);
          await rememberSender(next, null);
        });
        await reload();
        return next;
      }),

    /** One tap on the certificate stamp: inked with today's date, or lifted. */
    toggleCertificate: (moneyInId: string, today: LocalDate): Promise<SpendRow | null> =>
      store.exclusive(async () => {
        const row = await current(moneyInId);
        if (!row || (row.heldBack ?? 0) <= 0) return null;
        const next: SpendRow = { ...row, ...toggleCertificate(row, today), updatedAt: now() };
        await tables.spends.put(next);
        await reload();
        return next;
      }),
  };
}

export type RequestActions = ReturnType<typeof requestActions>;

/** Who each sender has paid requests for (`payersOf`), from the strips money in settled. */
export async function readPayers(
  store: Pick<MoneyStore, 'db'>,
): Promise<ReadonlyMap<string, ReadonlySet<string>>> {
  const rows = await store.db.getAllAsync<{ name: string | null; payer: string }>(
    `SELECT owed.name AS name, spends.merchant AS payer FROM owed
       JOIN spends ON spends.id = owed.settled_spend_id
      WHERE owed.code IS NOT NULL AND owed.settled_by = 'payback'`,
    [],
  );
  return payersOf(rows);
}

/** The request money in paid, if it paid one: its job names the money in on the year's list. */
export async function readRequestJobs(
  store: Pick<MoneyStore, 'db'>,
  from: LocalDate,
  to: LocalDate,
): Promise<ReadonlyMap<string, string>> {
  const rows = await store.db.getAllAsync<{ id: string; job: string }>(
    `SELECT owed.settled_spend_id AS id, owed.job AS job FROM owed
       JOIN spends ON spends.id = owed.settled_spend_id
      WHERE owed.code IS NOT NULL AND owed.job IS NOT NULL AND owed.settled_by = 'payback'
        AND spends.day >= ? AND spends.day <= ?`,
    [from, to],
  );
  return new Map(rows.map((row) => [row.id, row.job]));
}

/** Every work spend and work money in of a calendar year that stands, oldest first. */
export function readWorkYearRows(
  store: Pick<MoneyStore, 'tables'>,
  year: number,
): Promise<SpendRow[]> {
  return store.tables.spends.select(
    `WHERE day >= ? AND day <= ? AND for_work = 1 AND status NOT IN ('skipped', 'deleted')
     ORDER BY day, at`,
    [`${year}-01-01`, `${year}-12-31`],
  );
}

/**
 * What a sender remembered holding back keeps from money in that has nothing held back yet: its
 * next payment arrives with that share set (4c). Nothing for a sender never seen holding back.
 */
export async function rememberedHeldBack(
  store: Pick<MoneyStore, 'tables'>,
  row: Pick<SpendRow, 'merchant' | 'amount' | 'heldBack' | 'direction'>,
): Promise<number> {
  if (row.direction !== 'in' || row.heldBack != null) return 0;
  const key = merchantKeyOf(row.merchant);
  if (key === '') return 0;
  const rule = await store.tables.rules.get(key);
  return heldBackRemembered(row.amount, rule?.heldBackShare);
}

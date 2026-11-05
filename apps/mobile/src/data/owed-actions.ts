import { randomUUID } from 'expo-crypto';

import {
  coveredSpend,
  jarCover,
  owedTotal,
  type LocalDate,
  type OwedLine,
  type OwedRow,
  type SpendRow,
} from '@6pm/domain';

import { findSpend, type MoneySnapshot, type MoneyStore } from './money-store';

/** One other person's share, as the split sheet says it. */
export interface Share {
  /** The first name typed; null when nobody was named. */
  readonly name: string | null;
  readonly amount: number;
}

/** What settling owed lines did, so its undo puts back exactly that. */
export interface Settled {
  readonly lineIds: readonly string[];
  /** The payback or spend it wrote, which the undo takes away. */
  readonly spendId: string;
}

/**
 * The owed lines still open: the snapshot's, less any whose spend this cycle has been skipped or
 * deleted since it was read (the next read leaves those out by itself).
 */
export function openOwedOf(
  snapshot: Pick<MoneySnapshot, 'owed' | 'cycleSpends' | 'cycle' | 'today'>,
): OwedRow[] {
  const standing = new Map(snapshot.cycleSpends.map((s) => [s.id, s.status]));
  return snapshot.owed.filter((line) => {
    const inCycle = line.day >= snapshot.cycle.start && line.day <= snapshot.today;
    if (!inCycle) return true;
    const status = standing.get(line.spendId);
    return status !== undefined && status !== 'skipped';
  });
}

/** The domain's view of an owed row: what matching and grouping read. */
export function owedLineOf(row: OwedRow): OwedLine {
  return { id: row.id, spendId: row.spendId, name: row.name, amount: row.amount, day: row.day };
}

const OPEN = `(settled_at IS NULL OR settled_spend_id IN
  (SELECT id FROM spends WHERE status IN ('skipped', 'deleted')))`;

/**
 * Splitting spends and settling who owes. Each write commits first and then reads the store again,
 * so Today's number, the owed list and the Diary move together.
 *
 * A line counts as open again when what settled it is gone (the cash payback or the covered spend
 * deleted, money in skipped), so undoing any of those needs no write here.
 */
export function owedActions(store: MoneyStore) {
  const { db, tables } = store;
  const reload = () => store.loadInTurn(store.getSnapshot().today);
  const now = () => new Date().toISOString();

  const current = async (id: string): Promise<SpendRow | null> =>
    findSpend(store.getSnapshot(), id) ?? (await tables.spends.get(id));

  const openLinesOf = (spendId: string) =>
    tables.owed.select(`WHERE spend_id = ? AND ${OPEN} ORDER BY sort`, [spendId]);

  const linesById = async (ids: readonly string[]): Promise<OwedRow[]> => {
    if (ids.length === 0) return [];
    const marks = ids.map(() => '?').join(', ');
    return tables.owed.select(`WHERE id IN (${marks}) AND ${OPEN} ORDER BY day DESC, sort`, [
      ...ids,
    ]);
  };

  const settle = async (lines: readonly OwedRow[], by: OwedRow['settledBy'], spendId: string) => {
    const at = now();
    for (const line of lines) {
      await tables.owed.put({
        ...line,
        settledAt: at,
        settledBy: by,
        settledSpendId: spendId,
        updatedAt: at,
      });
    }
  };

  /** A new row for money the lines turn into: a payback kept today, or the user's own spend. */
  const rowFor = (
    original: SpendRow | null,
    lines: readonly OwedRow[],
    day: LocalDate,
    fields: Partial<SpendRow>,
  ): SpendRow => {
    const at = now();
    return {
      id: randomUUID(),
      day,
      at,
      amount: owedTotal(lines),
      categoryId: original?.categoryId ?? store.getSnapshot().categories[0]?.id ?? 'other',
      merchant: original?.merchant ?? '',
      note: null,
      source: 'manual',
      status: 'kept',
      previousStatus: null,
      wallet: null,
      forWork: false,
      detail: null,
      foreignAmount: null,
      currencyGuessed: false,
      memo: null,
      direction: null,
      moneyIn: null,
      givesBack: null,
      savedTo: null,
      fromPot: null,
      fromPotAmount: null,
      createdAt: at,
      updatedAt: at,
      ...fields,
    };
  };

  return {
    /**
     * Splits a spend: it keeps only the user's share (the only part that counts), and every other
     * share becomes an owed line. Splitting again replaces the open lines and keeps any already
     * settled; an empty `others` puts the whole bill back on the spend. `note` names the split
     * ("Split 4 ways · 1.200.000₫") when the spend has no note of its own, so the Diary says so.
     */
    splitSpend: (
      spendId: string,
      split: { readonly mine: number; readonly others: readonly Share[] },
      note: string | null,
    ): Promise<SpendRow | null> =>
      store.exclusive(async () => {
        const row = await current(spendId);
        if (!row || row.direction === 'in' || row.paysBill) return null;
        const open = await openLinesOf(spendId);
        const total = row.amount + owedTotal(open);
        const others = split.others.filter((s) => s.amount > 0);
        if (split.mine < 0 || split.mine + owedTotal(others) !== total) return null;
        const at = now();
        // A bill paid abroad keeps its printed amount in step: the whole bill's, then the share's.
        const foreign = row.foreignAmount;
        const foreignAmount =
          foreign && row.amount > 0 && total > 0
            ? {
                ...foreign,
                amount:
                  Math.round(((foreign.amount * total) / row.amount) * (split.mine / total) * 100) /
                  100,
              }
            : foreign;
        const next: SpendRow = {
          ...row,
          amount: split.mine,
          foreignAmount,
          note: others.length > 0 ? (row.note ?? note) : row.note,
          fromPotAmount:
            row.fromPot != null && row.fromPotAmount != null
              ? jarCover(split.mine, row.fromPotAmount)
              : (row.fromPotAmount ?? null),
          updatedAt: at,
        };
        await db.withTransactionAsync(async () => {
          for (const line of open) await tables.owed.remove(line.id);
          let sort = 0;
          for (const share of others) {
            sort += 1;
            await tables.owed.put({
              id: randomUUID(),
              spendId,
              name: share.name?.trim() ? share.name.trim() : null,
              amount: share.amount,
              day: row.day,
              sort,
              createdAt: at,
              settledAt: null,
              settledBy: null,
              settledSpendId: null,
              remindAt: null,
              updatedAt: at,
            });
          }
          await tables.spends.put(next);
        });
        await reload();
        return next;
      }),

    /**
     * Owed lines for a spend saved as the user's share already (a receipt split on Scan): the
     * spend is left as it is.
     */
    addShares: (spendId: string, shares: readonly Share[]): Promise<void> =>
      store.exclusive(async () => {
        const row = await current(spendId);
        if (!row || row.direction === 'in') return;
        const at = now();
        const open = await openLinesOf(spendId);
        await db.withTransactionAsync(async () => {
          let sort = open.length;
          for (const share of shares.filter((s) => s.amount > 0)) {
            sort += 1;
            await tables.owed.put({
              id: randomUUID(),
              spendId,
              name: share.name?.trim() ? share.name.trim() : null,
              amount: share.amount,
              day: row.day,
              sort,
              createdAt: at,
              settledAt: null,
              settledBy: null,
              settledSpendId: null,
              remindAt: null,
              updatedAt: at,
            });
          }
        });
        await reload();
      }),

    /** The open lines of one spend, for the split sheet to start from. */
    linesOf: (spendId: string): Promise<OwedRow[]> => store.exclusive(() => openLinesOf(spendId)),

    /**
     * "Paid in cash": the lines are settled by a payback of their amount kept today. Like every
     * payback it leaves the number alone (only the user's share counted).
     */
    paidInCash: (lineIds: readonly string[], name: string | null): Promise<Settled | null> =>
      store.exclusive(async () => {
        const lines = await linesById(lineIds);
        const [first] = lines;
        if (!first) return null;
        const original = await current(first.spendId);
        const snap = store.getSnapshot();
        const payback = rowFor(original, lines, snap.today, {
          merchant: name ?? first.name ?? original?.merchant ?? '',
          source: 'cash',
          direction: 'in',
          moneyIn: 'payback',
          givesBack: first.spendId,
        });
        await db.withTransactionAsync(async () => {
          await tables.spends.put(payback);
          await settle(lines, 'cash', payback.id);
        });
        await reload();
        return { lineIds: lines.map((l) => l.id), spendId: payback.id };
      }),

    /**
     * "I'll cover it": the shares become the user's own spending today, in the spend's category
     * and shop, never on the spend's own day, so no past close changes (M16).
     */
    cover: (lineIds: readonly string[], note: string | null): Promise<Settled | null> =>
      store.exclusive(async () => {
        const lines = await linesById(lineIds);
        const [first] = lines;
        if (!first) return null;
        const original = await current(first.spendId);
        const snap = store.getSnapshot();
        const covered = coveredSpend(
          { amount: owedTotal(lines) },
          {
            categoryId: original?.categoryId ?? snap.categories[0]?.id ?? 'other',
            merchant: original?.merchant ?? '',
          },
          snap.today,
        );
        const spend = rowFor(original, lines, covered.day, { ...covered, note });
        await db.withTransactionAsync(async () => {
          await tables.spends.put(spend);
          await settle(lines, 'covered', spend.id);
        });
        await reload();
        return { lineIds: lines.map((l) => l.id), spendId: spend.id };
      }),

    /** Takes back a cash payback or a cover: its row goes, and the lines are open again. */
    unsettle: (settled: Settled): Promise<void> =>
      store.exclusive(async () => {
        const at = now();
        const row = await tables.spends.get(settled.spendId);
        await db.withTransactionAsync(async () => {
          if (row)
            await tables.spends.put({
              ...row,
              status: 'deleted',
              previousStatus: row.status,
              updatedAt: at,
            });
          for (const line of await tables.owed.select(`WHERE settled_spend_id = ?`, [
            settled.spendId,
          ])) {
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
     * When to remind the user to ask (null for never), from "Remind me". Kept on the lines; the
     * notification sync schedules it, and drops it once the lines are settled.
     */
    setRemindAt: (lineIds: readonly string[], remindAt: string | null): Promise<void> =>
      store.exclusive(async () => {
        const at = now();
        for (const line of await linesById(lineIds)) {
          await tables.owed.put({ ...line, remindAt, updatedAt: at });
        }
        await reload();
      }),
  };
}

export type OwedActions = ReturnType<typeof owedActions>;

/**
 * Settles the lines money in paid, inside the money-in write's own transaction: lines it settled
 * before are opened again first, so placing it twice never settles two sets. With no lines it only
 * opens what it had settled (the money in was taken back or placed as something else).
 */
export async function settleByMoneyIn(
  store: Pick<MoneyStore, 'tables'>,
  moneyInId: string,
  lineIds: readonly string[],
): Promise<void> {
  const at = new Date().toISOString();
  for (const line of await store.tables.owed.select(
    "WHERE settled_spend_id = ? AND settled_by = 'payback'",
    [moneyInId],
  )) {
    await store.tables.owed.put({
      ...line,
      settledAt: null,
      settledBy: null,
      settledSpendId: null,
      updatedAt: at,
    });
  }
  if (lineIds.length === 0) return;
  const marks = lineIds.map(() => '?').join(', ');
  for (const line of await store.tables.owed.select(`WHERE id IN (${marks}) AND ${OPEN}`, [
    ...lineIds,
  ])) {
    await store.tables.owed.put({
      ...line,
      settledAt: at,
      settledBy: 'payback',
      settledSpendId: moneyInId,
      updatedAt: at,
    });
  }
}

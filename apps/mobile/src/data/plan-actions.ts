import { randomUUID } from 'expo-crypto';
import { useMemo } from 'react';

import {
  FUTURE_YOU_POT_ID,
  isLegacyGoal,
  payCycleOn,
  type BillRow,
  type Payday,
  type PotMove,
  type PotRow,
} from '@6pm/domain';

import { useMoneyStore } from './money-provider';
import type { MoneyStore } from './money-store';
import { writePlan } from './plan-settings';
import { clearCycleSetAside, moveCycleRecords, writeOpening } from './pot-moves';
import { inTurn } from './store-queue';

export interface NewBill {
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly amount: number;
  readonly dueDay: number;
  /** A card's payment never moves free money; `other` when left out. */
  readonly kind?: BillRow['kind'];
  /** The last month ('YYYY-MM') it is paid in; null or left out for no end. */
  readonly lastMonth?: string | null;
}

/** How a jar fills each payday: toward a date, a steady amount, or only when added to by hand. */
export type JarFillChoice =
  | { readonly by: 'date'; readonly neededBy: string }
  | { readonly by: 'steady'; readonly monthly: number }
  | { readonly by: 'hand' };

export interface NewPot {
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  /** The target; 0 for none. */
  readonly goal: number;
  readonly fill: JarFillChoice;
  /** What it already holds before 6pm ("Already saved"); none when left out. */
  readonly opening?: number;
}

/**
 * What the edit sheet changes on a jar; `opening` is what it held before 6pm. Only `fill` changes
 * how a 2.1 goal fills: a rename, an icon, a colour or a target never does, so none of them moves
 * the daily number for it.
 */
export type PotPatch = Partial<
  Pick<PotRow, 'name' | 'icon' | 'hue' | 'goal' | 'paused'> & {
    opening: number;
    fill: JarFillChoice;
  }
>;

function fillFields(fill: JarFillChoice): Pick<PotRow, 'kind' | 'neededBy' | 'share' | 'monthly'> {
  return {
    kind: 'occasion',
    share: null,
    neededBy: fill.by === 'date' ? fill.neededBy : null,
    monthly: fill.by === 'steady' ? Math.max(0, Math.round(fill.monthly)) : null,
  };
}

/**
 * The Plan tab's writes: bills paid, edited and removed, pots made, edited, topped up and removed,
 * Future you's monthly amount, and the month's income and payday. Each commits to the database
 * first, then reloads the snapshot, so every number moves together.
 */
export function planActions(store: MoneyStore) {
  const { tables, db } = store;
  // Every action below runs in the store's turn, so its reload is the one that is already in turn.
  const reload = () => store.loadInTurn(store.getSnapshot().today);

  const putBill = async (row: BillRow) => {
    await tables.bills.put(row);
    const snap = store.getSnapshot();
    const bills = snap.bills.some((b) => b.id === row.id)
      ? snap.bills.map((b) => (b.id === row.id ? row : b))
      : [...snap.bills, row];
    store.publish({ ...snap, bills });
  };

  /** Makes this cycle's set-aside for the jars work itself out again from the jars as they are. */
  const refreshSetAsides = async (potIds: readonly string[]) => {
    const { start } = store.getSnapshot().cycle;
    for (const id of potIds) await clearCycleSetAside(db, id, start);
  };

  return inTurn(store.exclusive, {
    /** Ticks a bill off for this pay cycle, or puts it back to due. */
    setBillPaid: async (id: string, paid: boolean) => {
      const snap = store.getSnapshot();
      const bill = snap.bills.find((b) => b.id === id);
      if (!bill) return;
      // Ticked by hand, a bill is paid its own amount.
      await putBill({ ...bill, paidCycle: paid ? snap.cycle.start : null, paidAmount: null });
    },
    /** Adds a bill to the plan; returns its id. */
    addBill: async (input: NewBill): Promise<string> => {
      const snap = store.getSnapshot();
      const id = randomUUID();
      await putBill({
        id,
        ...input,
        amount: Math.round(input.amount),
        paidCycle: null,
        sort: snap.bills.reduce((max, b) => Math.max(max, b.sort + 1), 0),
        archivedAt: null,
        kind: input.kind ?? 'other',
        lastMonth: input.lastMonth ?? null,
        paidAmount: null,
        askedCycle: null,
      });
      return id;
    },
    updateBill: async (id: string, patch: Partial<NewBill>) => {
      const bill = store.getSnapshot().bills.find((b) => b.id === id);
      if (!bill) return;
      const { lastMonth, ...rest } = patch;
      await putBill({
        ...bill,
        ...rest,
        ...(lastMonth === undefined ? {} : { lastMonth }),
        ...(patch.amount === undefined ? {} : { amount: Math.round(patch.amount) }),
      });
    },
    /** Takes a bill off the list; the amount returns to free money. `restoreBill` undoes it. */
    removeBill: async (id: string) => {
      const bill = await tables.bills.get(id);
      if (!bill) return;
      await tables.bills.put({ ...bill, archivedAt: new Date().toISOString() });
      const snap = store.getSnapshot();
      store.publish({ ...snap, bills: snap.bills.filter((b) => b.id !== id) });
    },
    restoreBill: async (id: string) => {
      const bill = await tables.bills.get(id);
      if (bill) await putBill({ ...bill, archivedAt: null });
    },

    /**
     * Starts a jar. Its first payday's set-aside is recorded at once, so the daily number moves as
     * the sheet promised.
     */
    createPot: async (input: NewPot): Promise<PotRow> => {
      const snap = store.getSnapshot();
      const row: PotRow = {
        id: randomUUID(),
        name: input.name.trim(),
        icon: input.icon,
        hue: input.hue,
        goal: Math.max(0, Math.round(input.goal)),
        ...fillFields(input.fill),
        paused: false,
        createdAt: new Date().toISOString(),
        archivedAt: null,
      };
      await db.withTransactionAsync(async () => {
        await tables.pots.put(row);
        await writeOpening(db, row.id, input.opening ?? 0, snap.cycle.start);
      });
      await reload();
      return row;
    },

    /**
     * The edit sheet's save. Future you's jar keeps its name, icon and fill (its slice is the
     * what-if's); a 2.1 goal becomes an ordinary jar only when told how to fill.
     */
    updatePot: async (id: string, { opening, fill, ...patch }: PotPatch) => {
      const snap = store.getSnapshot();
      const pot = snap.pots.find((p) => p.id === id);
      if (!pot) return;
      const futureYou = pot.id === FUTURE_YOU_POT_ID;
      const legacy = isLegacyGoal(pot);
      const next: PotRow = {
        ...pot,
        ...(futureYou ? { goal: patch.goal ?? pot.goal } : patch),
        name: futureYou || patch.name === undefined ? pot.name : patch.name.trim() || pot.name,
        goal: patch.goal === undefined ? pot.goal : Math.max(0, Math.round(patch.goal)),
        ...(fill === undefined || futureYou ? {} : fillFields(fill)),
      };
      // A 2.1 goal still filling from the slice keeps this cycle's set-aside as it was: changing
      // its target or pausing it moves no number. Any other jar's change reaches this cycle.
      const reaches =
        !futureYou &&
        (fill !== undefined ||
          (!legacy && (patch.goal !== undefined || patch.paused !== undefined)) ||
          opening !== undefined);
      await db.withTransactionAsync(async () => {
        await tables.pots.put(next);
        if (opening !== undefined) await writeOpening(db, id, opening, snap.cycle.start);
        if (reaches) await refreshSetAsides([id]);
      });
      await reload();
    },

    /** Add, on a jar's page: money put into a jar now, out of this cycle's free money. */
    topUp: async (potId: string, amount: number) => {
      const snap = store.getSnapshot();
      const move: PotMove = {
        potId,
        kind: 'topUp',
        cycle: snap.cycle.start,
        amount: Math.max(0, Math.round(amount)),
      };
      if (move.amount === 0) return;
      await db.runAsync(
        'INSERT INTO pot_moves (id, pot_id, amount, kind, cycle, at) VALUES (?, ?, ?, ?, ?, ?)',
        [randomUUID(), potId, move.amount, 'topUp', move.cycle, new Date().toISOString()],
      );
      store.publish({ ...snap, potMoves: [...snap.potMoves, move] });
    },

    /**
     * Deletes a jar: it leaves the shelf and the daily number, and this cycle's set-aside goes back
     * to free money, less what was already spent from it (M13). Future you's jar is never deleted.
     * `restorePot` undoes it.
     */
    archivePot: async (id: string) => {
      if (id === FUTURE_YOU_POT_ID) return;
      const pot = await tables.pots.get(id);
      if (!pot) return;
      await tables.pots.put({ ...pot, archivedAt: new Date().toISOString() });
      await reload();
    },
    restorePot: async (id: string) => {
      const pot = await tables.pots.get(id);
      if (!pot) return;
      await tables.pots.put({ ...pot, archivedAt: null });
      await reload();
    },

    /** Commits the what-if: Future you's monthly amount, which moves every number. */
    setFutureYou: async (amount: number) => {
      const snap = store.getSnapshot();
      if (!snap.plan || snap.plan.futureYou === amount) return;
      const plan = { ...snap.plan, futureYou: Math.max(0, Math.round(amount)) };
      await writePlan(db, plan);
      // Future you's jar and the 2.1 goals fill from the slice: this cycle's part is worked out again.
      await refreshSetAsides(snap.pots.filter((p) => p.kind === 'goal').map((p) => p.id));
      await reload();
    },

    /**
     * Changes what the month is built on. A new payday moves the cycle that is running to its new
     * start, with what was recorded in it (pots, paid bills), so nothing counts twice.
     */
    updateMonth: async (patch: { income?: number; payday?: Payday }) => {
      const snap = store.getSnapshot();
      if (!snap.plan) return;
      const plan = {
        ...snap.plan,
        ...(patch.income === undefined ? {} : { income: Math.max(0, Math.round(patch.income)) }),
        ...(patch.payday === undefined ? {} : { payday: patch.payday }),
      };
      await db.withTransactionAsync(async () => {
        await writePlan(db, plan);
        await moveCycleRecords(db, snap.cycle.start, payCycleOn(snap.today, plan.payday).start);
      });
      await reload();
    },
  });
}

export type PlanActions = ReturnType<typeof planActions>;

export function usePlanActions(): PlanActions {
  const store = useMoneyStore();
  return useMemo(() => planActions(store), [store]);
}

import {
  inNewHome,
  isHomeChange,
  planInNewHome,
  plannedInNewHome,
  spendInNewHome,
  type HomeChange,
} from '@6pm/domain';

import type { MoneyStore } from './money-store';
import { planCurrencyCode, readPlan, writePlan } from './plan-settings';

/** The tables whose rows are money and nothing else to work out: id and amount. */
const MOVE_TABLES = ['pot_moves', 'together_moves'] as const;

/**
 * Counts the plan in another currency: the plan, every spend and money in, the bills, the jars and
 * what moved through them, the closed days and what a bring-in replaced, all in one
 * transaction, then reloads. Shared jars keep their own currency; only what this phone put into
 * them is counted again. Nothing is written when the plan is not in `change.from` any more (the
 * change was already made) or the change is not one.
 */
export function changeHomeCurrency(store: MoneyStore, change: HomeChange): Promise<boolean> {
  return store.exclusive(async () => {
    const { db, tables } = store;
    if (!isHomeChange(change)) return false;
    let changed = false;
    await db.withTransactionAsync(async () => {
      const plan = await readPlan(db);
      if (plan === null || planCurrencyCode(plan) !== change.from.code) return;
      await writePlan(db, { ...planInNewHome(plan, change), currency: change.to.code });

      for (const spend of await tables.spends.all()) {
        const moved = spendInNewHome(spend, change);
        await tables.spends.put({
          ...spend,
          amount: moved.amount,
          foreignAmount: moved.foreignAmount,
          ...(spend.fromPotAmount === undefined ? {} : { fromPotAmount: moved.fromPotAmount }),
        });
      }
      for (const bill of await tables.bills.all()) {
        await tables.bills.put({
          ...bill,
          amount: plannedInNewHome(bill.amount, change),
          paidAmount: bill.paidAmount === null ? null : inNewHome(bill.paidAmount, change),
        });
      }
      for (const pot of await tables.pots.all()) {
        await tables.pots.put({
          ...pot,
          goal: plannedInNewHome(pot.goal, change),
          ...(pot.monthly == null ? {} : { monthly: plannedInNewHome(pot.monthly, change) }),
        });
      }
      for (const day of await tables.closedDays.all()) {
        await tables.closedDays.put({
          ...day,
          spent: inNewHome(day.spent, change),
          line: inNewHome(day.line, change),
          tomorrow: inNewHome(day.tomorrow, change),
        });
      }
      for (const record of await tables.imports.all()) {
        if (record.answerBefore === null) continue;
        await tables.imports.put({
          ...record,
          answerBefore: inNewHome(record.answerBefore, change),
        });
      }
      for (const table of MOVE_TABLES) {
        const moves = await db.getAllAsync<{ id: string; amount: number }>(
          `SELECT id, amount FROM ${table}`,
          [],
        );
        for (const move of moves) {
          await db.runAsync(`UPDATE ${table} SET amount = ? WHERE id = ?`, [
            inNewHome(move.amount, change),
            move.id,
          ]);
        }
      }
      changed = true;
    });
    if (changed) await store.loadInTurn(store.getSnapshot().today);
    return changed;
  });
}

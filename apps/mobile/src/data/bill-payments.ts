import { useMemo } from 'react';

import {
  billAmountFromNow,
  billPaidBy,
  billPaymentMarks,
  billUnpaid,
  REPAYMENT,
  type BillRow,
} from '@6pm/domain';

import { useMoneyStore } from './money-provider';
import type { MoneyStore } from './money-store';
import { inTurn } from './store-queue';

/**
 * Spends that paid a bill. A spend said to be a bill's payment marks the bill paid this cycle and
 * is kept out of the daily number; one that paid a card or loan with no bill (`REPAYMENT`) only
 * leaves the daily number. A caught spend that looks like an unpaid bill's payment is marked the
 * moment it lands (`markCaught`), so it never counts while the bill still comes off the plan; the
 * close then asks once. Each commits, then reloads the snapshot so every number moves together.
 */
export function billPayments(store: MoneyStore) {
  const { tables, db } = store;
  const reload = () => store.loadInTurn(store.getSnapshot().today);

  /** The bill back to due, when this cycle's payment was the one being taken back. */
  const unpay = async (billId: string, cycleStart: string) => {
    const bill = await tables.bills.get(billId);
    if (bill && bill.paidCycle === cycleStart) await tables.bills.put({ ...bill, ...billUnpaid() });
  };

  /** The bill answered this cycle: neither the close nor a new catch asks about it again. */
  const asked = async (billId: string, cycleStart: string) => {
    const bill = await tables.bills.get(billId);
    if (bill && bill.askedCycle !== cycleStart) {
      await tables.bills.put({ ...bill, askedCycle: cycleStart });
    }
  };

  return inTurn(store.exclusive, {
    /**
     * Says what a spend paid: a bill's id, `REPAYMENT`, or null for ordinary spending again (which
     * puts a bill it had paid back to due). Answering about a bill counts as the close's one
     * question about it this cycle, and so does saying it was not that bill after all; saying
     * again what a spend was marked as when it was caught confirms it.
     */
    setPaysBill: async (spendId: string, target: string | null) => {
      const { cycle } = store.getSnapshot();
      const spend = await tables.spends.get(spendId);
      if (!spend) return;
      const before = spend.paysBill ?? null;
      // Only a payment in this cycle can have paid this cycle's bill, or pay it now.
      const inCycle = spend.day >= cycle.start;
      if (before === target) {
        if (!inCycle || target === null || target === REPAYMENT) return;
        await asked(target, cycle.start);
        await reload();
        return;
      }
      await db.withTransactionAsync(async () => {
        if (inCycle && before !== null && before !== REPAYMENT) {
          await unpay(before, cycle.start);
          await asked(before, cycle.start);
        }
        if (inCycle && target !== null && target !== REPAYMENT) {
          const bill = await tables.bills.get(target);
          if (bill) {
            const next: BillRow = {
              ...bill,
              ...billPaidBy(bill, spend.amount, cycle),
              askedCycle: cycle.start,
            };
            await tables.bills.put(next);
          }
        }
        await tables.spends.put({
          ...spend,
          paysBill: target,
          updatedAt: new Date().toISOString(),
        });
      });
      await reload();
    },

    /** "No" to "Is this your {bill}?": the close does not ask about that bill again this cycle. */
    billAsked: async (billId: string) => {
      const { cycle } = store.getSnapshot();
      const bill = await tables.bills.get(billId);
      if (!bill || bill.askedCycle === cycle.start) return;
      await tables.bills.put({ ...bill, askedCycle: cycle.start });
      await reload();
    },

    /** "From now on": a bill's amount becomes what this cycle's payment was, for every cycle. */
    billFromNowOn: async (billId: string, amount: number) => {
      const bill = await tables.bills.get(billId);
      if (!bill || amount <= 0) return;
      await tables.bills.put({ ...bill, ...billAmountFromNow(Math.round(amount)) });
      await reload();
    },

    /**
     * Marks each caught spend of this cycle that looks like an unpaid bill's payment as paying it
     * (`billPaymentMarks`): the bill is paid this cycle, at the payment's amount, and the spend
     * leaves the daily number. Run when captures land, and at launch for spends caught before; a
     * spend already answered (kept, skipped) or money in is never touched. Returns how many.
     */
    markCaught: async (): Promise<number> => {
      const { cycle, cycleSpends, bills } = store.getSnapshot();
      const caught = cycleSpends.filter((s) => s.status === 'caught' && s.direction !== 'in');
      const marks = billPaymentMarks(caught, bills, cycle);
      if (marks.length === 0) return 0;
      await db.withTransactionAsync(async () => {
        for (const mark of marks) {
          const spend = await tables.spends.get(mark.spendId);
          const bill = await tables.bills.get(mark.billId);
          if (!spend || !bill || spend.status !== 'caught' || spend.paysBill != null) continue;
          await tables.bills.put({ ...bill, ...billPaidBy(bill, spend.amount, cycle) });
          await tables.spends.put({
            ...spend,
            paysBill: bill.id,
            updatedAt: new Date().toISOString(),
          });
        }
      });
      await reload();
      return marks.length;
    },
  });
}

export type BillPayments = ReturnType<typeof billPayments>;

export function useBillPayments(): BillPayments {
  const store = useMoneyStore();
  return useMemo(() => billPayments(store), [store]);
}

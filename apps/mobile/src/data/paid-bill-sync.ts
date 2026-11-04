import { billPaidBy, billUnpaid, REPAYMENT, type BillRow, type SpendRow } from '@6pm/domain';

import type { MoneyStore } from './money-store';

const gone = (spend: SpendRow) => spend.status === 'skipped' || spend.status === 'deleted';

/**
 * The bill a spend pays follows the spend: skipped ("Not mine") or deleted, the bill is back to
 * due; put back by an undo, it is paid again (unless something else paid it meanwhile); its amount
 * edited, this cycle's bill is the new amount (M2b). Only a payment in this cycle touches the
 * bill. Runs inside the store's turn, with the spend already written.
 */
export async function syncPaidBill(
  store: MoneyStore,
  before: SpendRow,
  after: SpendRow,
): Promise<void> {
  const billId = after.paysBill ?? null;
  if (billId === null || billId === REPAYMENT || billId !== (before.paysBill ?? null)) return;
  const { cycle } = store.getSnapshot();
  if (after.day < cycle.start) return;
  const wasGone = gone(before);
  const isGone = gone(after);
  if (wasGone === isGone && (isGone || before.amount === after.amount)) return;
  const bill = await store.tables.bills.get(billId);
  if (!bill) return;
  const paid = bill.paidCycle === cycle.start;
  const next: BillRow | null = isGone
    ? paid
      ? { ...bill, ...billUnpaid() }
      : null
    : paid === wasGone
      ? null
      : { ...bill, ...billPaidBy(bill, after.amount, cycle) };
  if (next === null) return;
  await store.tables.bills.put(next);
  const now = store.getSnapshot();
  store.publish({ ...now, bills: now.bills.map((b) => (b.id === billId ? next : b)) });
}

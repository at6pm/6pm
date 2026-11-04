import type { Money as Vnd } from '../money/currency';
import { billCountsIn } from '../plan/bills';
import type { PayCycle } from '../plan/pay-cycle';
import { billDueIn } from '../plan/plan-river';
import { diffDays, type LocalDate } from '../time/local-date';
import { BILL_PAYMENT_DAYS, type PayableBill } from './bill-payment';
import { otherBillKind, sameBillKind } from './bill-topic';
import { foldWords } from './fold-words';

/** A paper bill as Scan read it. */
export interface ScannedBill {
  /** The total in the home currency, null while unread. */
  readonly amount: Vnd | null;
  /** Every line of the receipt, and the payee, as one text. */
  readonly text: string;
  readonly day: LocalDate;
}

/**
 * The plan bill a scanned receipt pays, or null. Only a bill still to pay this cycle: its name in
 * the receipt, or the same kind of bill as the receipt reads as (a power bill for an EVN notice),
 * or, within a week of its due day, its exact amount. The name and the kind beat the amount, and
 * the bill due nearest breaks a tie.
 */
export function billScanned<B extends PayableBill>(
  scan: ScannedBill,
  bills: readonly B[],
  cycle: PayCycle,
): B | null {
  const folded = foldWords(scan.text);
  let best: { bill: B; score: number } | null = null;
  for (const bill of bills) {
    if (bill.paidCycle === cycle.start || !billCountsIn(bill, cycle)) continue;
    const away = Math.abs(diffDays(scan.day, billDueIn(cycle, bill.dueDay)));
    const name = foldWords(bill.name);
    const other = otherBillKind(scan.text, bill.name);
    const named = !other && name.trim().length >= 2 && folded.includes(name);
    const sameKind = sameBillKind(scan.text, bill.name);
    const exact = bill.amount > 0 && scan.amount === bill.amount && away <= BILL_PAYMENT_DAYS;
    if (!named && !sameKind && !exact) continue;
    const score = (named ? 400 : 0) + (sameKind ? 200 : 0) + (exact ? 100 : 0) - away;
    if (best === null || score > best.score) best = { bill, score };
  }
  return best?.bill ?? null;
}

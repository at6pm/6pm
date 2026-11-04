import type { Money as Vnd } from '../money/currency';
import { billCountsIn, type BillKind } from '../plan/bills';
import type { PayCycle } from '../plan/pay-cycle';
import { billDueIn } from '../plan/plan-river';
import { diffDays, type LocalDate } from '../time/local-date';
import { otherBillKind, sameBillKind } from './bill-topic';
import { foldWords } from './fold-words';

/**
 * What a spend that paid off a card or loan with no bill of its own carries in place of a bill
 * id (a card paid in full each month): kept out of the daily number, no bill touched.
 */
export const REPAYMENT = 'repayment';

/**
 * How far from a bill's due day a payment can be and still look like it by its amount alone: a
 * week either side. A payment that names the bill, or its kind, can be any day of its cycle.
 */
export const BILL_PAYMENT_DAYS = 7;

/**
 * Words that name a repayment in a bank's payee or a note, accents folded (`foldWords`): paying a
 * card, an instalment, a debt or a loan.
 */
const REPAYMENT_WORDS = [
  'thanh toan the',
  'thanh toan the tin dung',
  'tra gop',
  'tra no',
  'khoan vay',
  'tra khoan vay',
  'credit card payment',
  'card payment',
  'loan payment',
  'loan repayment',
  'instalment',
  'installment',
].map((word) => ` ${word} `);

/** Words in a bill's own name that make it a repayment: a card, trả góp, a loan, a debt. */
const REPAYMENT_NAME_WORDS = [
  'the tin dung',
  'credit card',
  'card',
  'tra gop',
  'instalment',
  'installment',
  'loan',
  'vay',
  'no',
  'owe',
  'debt',
].map((word) => ` ${word} `);

export interface PayableBill {
  readonly id: string;
  readonly name: string;
  readonly amount: Vnd;
  readonly dueDay: number;
  readonly kind?: BillKind;
  readonly lastMonth?: string | null;
  readonly paidCycle: string | null;
  /** The pay cycle the close last asked about it in: it asks at most once a cycle. */
  readonly askedCycle?: string | null;
}

export interface PaymentCapture {
  readonly id: string;
  readonly day: LocalDate;
  readonly amount: Vnd;
  readonly merchant: string;
  readonly note: string | null;
  /** The transfer's own words a bank printed ("Nội dung"), where a repayment is usually named. */
  readonly memo?: string | null | undefined;
  /** The bill (or `REPAYMENT`) it is already marked as paying. */
  readonly paysBill?: string | null | undefined;
}

/** "Is this your {bill}?" about a spend, or, with no bill, "Paying off a card or loan?". */
export interface BillAsk {
  readonly spendId: string;
  readonly billId: string | null;
}

/**
 * What "This was a bill" offers for a spend, in tap order: not a bill, then each of this cycle's
 * bills still to pay (only for a spend in this cycle), then a card or loan with no bill. A bill
 * already paid by something else is left out, so tapping past it never puts it back to due; the
 * bill the spend itself pays stays in, in its place.
 */
export function billChoicesFor(
  spend: { readonly day: LocalDate; readonly paysBill?: string | null | undefined },
  bills: readonly Pick<PayableBill, 'id' | 'paidCycle'>[],
  cycle: Pick<PayCycle, 'start'>,
): (string | null)[] {
  const paysBill = spend.paysBill ?? null;
  const own = paysBill !== null && paysBill !== REPAYMENT ? paysBill : null;
  const open =
    spend.day >= cycle.start
      ? bills.filter((b) => b.id === own || b.paidCycle !== cycle.start).map((b) => b.id)
      : own === null
        ? []
        : [own];
  return [null, ...open, REPAYMENT];
}

/** Whether a payee, note or memo says it paid off a card, an instalment, a debt or a loan. */
export function namesRepayment(text: string): boolean {
  const folded = foldWords(text);
  return REPAYMENT_WORDS.some((word) => folded.includes(word));
}

function textOf(spend: PaymentCapture): string {
  return `${spend.merchant} ${spend.note ?? ''} ${spend.memo ?? ''}`;
}

/** The bill's own name inside the payee, note or memo, as whole words. */
function namesBill(text: string, bill: PayableBill): boolean {
  const name = foldWords(bill.name);
  return name.trim().length >= 2 && foldWords(text).includes(name);
}

/**
 * A bill a repayment word can point to: a card, one with a last month (trả góp), or one whose
 * name says it pays something off.
 */
function isRepayment(bill: PayableBill): boolean {
  if (bill.kind === 'card' || bill.lastMonth != null) return true;
  const name = foldWords(bill.name);
  return REPAYMENT_NAME_WORDS.some((word) => name.includes(word));
}

/**
 * How strongly a spend looks like a bill's payment, or null when it does not. The bill is unpaid
 * this cycle and not yet asked about, and the spend is in this cycle. Then any day of the cycle,
 * the payee, note or memo names the bill or the same kind of bill (an EVN payment for "Điện
 * nước"; utility bills are paid whenever they arrive); within a week of its due day, its amount
 * is the bill's exactly (strongest), or it names a repayment when the bill is one. A payee of
 * another kind of bill (Viettel for a power bill) never names it. Closer to the due day breaks a
 * tie.
 */
function matchScore(spend: PaymentCapture, bill: PayableBill, cycle: PayCycle): number | null {
  if (bill.paidCycle === cycle.start || bill.askedCycle === cycle.start) return null;
  if (!billCountsIn(bill, cycle)) return null;
  if (spend.day < cycle.start || spend.day > cycle.payday) return null;
  const away = Math.abs(diffDays(spend.day, billDueIn(cycle, bill.dueDay)));
  const near = away <= BILL_PAYMENT_DAYS;
  const text = textOf(spend);
  const named =
    !otherBillKind(text, bill.name) && (namesBill(text, bill) || sameBillKind(text, bill.name));
  const exact = near && bill.amount > 0 && spend.amount === bill.amount;
  const repays = near && isRepayment(bill) && namesRepayment(text);
  if (!exact && !named && !repays) return null;
  return (exact ? 200 : 0) + (named ? 100 : 0) + (BILL_PAYMENT_DAYS - away);
}

/** Each waiting spend's best unpaid bill, each bill given to one spend at most. */
function matchBills(
  open: readonly PaymentCapture[],
  bills: readonly PayableBill[],
  cycle: PayCycle,
): Map<string, string> {
  const pairs: { spendId: string; billId: string; score: number }[] = [];
  for (const spend of open) {
    for (const bill of bills) {
      const score = matchScore(spend, bill, cycle);
      if (score !== null) pairs.push({ spendId: spend.id, billId: bill.id, score });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  const bySpend = new Map<string, string>();
  const taken = new Set<string>();
  for (const pair of pairs) {
    if (bySpend.has(pair.spendId) || taken.has(pair.billId)) continue;
    bySpend.set(pair.spendId, pair.billId);
    taken.add(pair.billId);
  }
  return bySpend;
}

const unmarked = (spends: readonly PaymentCapture[]) =>
  spends.filter((s) => s.paysBill == null && s.amount > 0);

/**
 * The bills caught spends pay, marked the moment they are caught so a bill's payment never counts
 * as spending while the bill still comes off the plan: each spend not yet marked that looks like
 * an unpaid bill's payment (`billPaymentAsks`' rules), each bill once, the best match winning.
 * A repayment with no bill is left for the close to ask about.
 */
export function billPaymentMarks(
  spends: readonly PaymentCapture[],
  bills: readonly PayableBill[],
  cycle: PayCycle,
): { readonly spendId: string; readonly billId: string }[] {
  const open = unmarked(spends);
  const matched = matchBills(open, bills, cycle);
  return open.flatMap((spend) => {
    const billId = matched.get(spend.id);
    return billId === undefined ? [] : [{ spendId: spend.id, billId }];
  });
}

/**
 * Whether a spend was marked as paying a bill when it was caught and the close has yet to ask:
 * the bill it pays is paid this cycle, by it, and was not asked about this cycle.
 */
function markedUnasked(spend: PaymentCapture, bills: readonly PayableBill[], cycle: PayCycle) {
  if (spend.paysBill == null || spend.paysBill === REPAYMENT || spend.amount <= 0) return false;
  if (spend.day < cycle.start || spend.day > cycle.payday) return false;
  const bill = bills.find((b) => b.id === spend.paysBill);
  return bill !== undefined && bill.paidCycle === cycle.start && bill.askedCycle !== cycle.start;
}

/**
 * What the close asks about tonight's spends: each spend that looks like an unpaid bill's
 * payment, or was marked as one when it was caught, is asked "Is this your {bill}?", each bill at
 * most once (the best-matching spend wins); a spend whose payee or note names a repayment with no
 * bill left to match asks "Paying off a card or loan?". In the order the spends were given; a
 * spend is asked one thing at most.
 */
export function billPaymentAsks(
  spends: readonly PaymentCapture[],
  bills: readonly PayableBill[],
  cycle: PayCycle,
): BillAsk[] {
  const open = unmarked(spends);
  const matched = matchBills(open, bills, cycle);
  return spends.flatMap((spend): BillAsk[] => {
    if (markedUnasked(spend, bills, cycle)) {
      return [{ spendId: spend.id, billId: spend.paysBill ?? null }];
    }
    if (!open.includes(spend)) return [];
    const billId = matched.get(spend.id);
    if (billId !== undefined) return [{ spendId: spend.id, billId }];
    return namesRepayment(textOf(spend)) ? [{ spendId: spend.id, billId: null }] : [];
  });
}

/**
 * Whether confirming a spend as a bill's payment should ask about the bill's amount from now on:
 * the bill is not a card's (a card bill keeps its amount, whatever paid it off) and the payment
 * differs from it. "Just this month" leaves this cycle's payment as the bill once (M2b); "From
 * now on" makes it the bill's amount (`billAmountFromNow`).
 */
export function asksBillAmount(bill: Pick<PayableBill, 'amount' | 'kind'>, paid: Vnd): boolean {
  return bill.kind !== 'card' && paid > 0 && paid !== bill.amount;
}

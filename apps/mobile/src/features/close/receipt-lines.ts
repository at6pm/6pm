import { countsTowardDay, jarReceiptLines, type JarReceiptLine, type SpendRow } from '@6pm/domain';

export interface ReceiptSpends {
  /**
   * Printed lines, oldest first, each at its full amount (a spend from a jar is spending too).
   * With the jar lines taken off, they add up to the receipt's total.
   */
  readonly lines: readonly SpendRow[];
  /** "From {jar}": what each jar covered of the lines, printed under them as money back. */
  readonly jars: readonly JarReceiptLine[];
  /** The one spend moved to Claim back, printed under the total's lines. */
  readonly claimBack: SpendRow | null;
}

/**
 * The spends a day's receipt prints: what the day kept and counted. A category set to not count
 * toward the daily number, and a spend sent to Claim back, are not in the total, so they are not
 * lines either; the lines always add up to the total.
 */
export function receiptSpends(
  spends: readonly SpendRow[],
  day: string,
  notDaily: ReadonlySet<string>,
): ReceiptSpends {
  const kept = spends
    .filter((s) => s.day === day && s.status === 'kept')
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const counted = (s: SpendRow) => ({
    amount: s.amount,
    category: s.categoryId,
    status: s.status,
    forWork: s.forWork,
    paysBill: s.paysBill,
    direction: s.direction,
    fromPot: s.fromPot,
    fromPotAmount: s.fromPotAmount,
  });
  const lines = kept.filter((s) => countsTowardDay(counted(s), notDaily));
  return {
    lines,
    jars: jarReceiptLines(lines.map(counted), notDaily),
    claimBack: kept.find((s) => s.forWork) ?? null,
  };
}

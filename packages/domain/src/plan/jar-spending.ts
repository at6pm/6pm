import type { Vnd } from '../money/format';
import { jarPartOf, type CountedSpend } from '../spend/spend';
import type { LocalDate } from '../time/local-date';
import { payCycleOn, type Payday } from './pay-cycle';
import type { PotMove } from './pots';

/** A spend as a jar sees it: its jar, the part it covered and the day it fell on. */
export type JarSpend = CountedSpend & { readonly day: LocalDate };

/**
 * The `spent` moves the spends taken from jars make (M13), one per spend, filed in the pay cycle
 * the spend fell in. They are read from the spends themselves, never stored apart, so skipping,
 * deleting, editing or undoing a spend moves its jar with it.
 */
export function jarSpendMoves(
  spends: readonly JarSpend[],
  payday: Payday,
  notDaily: ReadonlySet<string>,
): PotMove[] {
  const out: PotMove[] = [];
  for (const spend of spends) {
    if (spend.fromPot == null) continue;
    const amount = jarPartOf(spend, notDaily);
    if (amount <= 0) continue;
    out.push({
      potId: spend.fromPot,
      kind: 'spent',
      cycle: payCycleOn(spend.day, payday).start,
      amount,
    });
  }
  return out;
}

/** A jar deleted while its spends still stand, as the current cycle counted it. */
export interface DeletedJar {
  /** What it set aside this cycle that the daily number took out (0 for Future you's slice). */
  readonly setAside: Vnd;
  /** What was topped up into it this cycle. */
  readonly topUps: Vnd;
  /** What it covered of this cycle's spends. */
  readonly covered: Vnd;
}

/**
 * What jars deleted this cycle still take out of free money (M13). A deleted jar's set-aside and
 * top-ups go back to free money, less what was already spent from it this cycle: those spends keep
 * their cover (never more than the jar held when they were taken), so the same money is never
 * counted free twice.
 */
export function deletedJarsKeep(jars: readonly DeletedJar[]): Vnd {
  return jars.reduce((sum, j) => sum + Math.max(0, Math.min(j.setAside + j.topUps, j.covered)), 0);
}

/** A receipt's "From {jar}" line: what one jar covered of the spends above it. */
export interface JarReceiptLine {
  readonly potId: string;
  readonly amount: Vnd;
}

/**
 * The one rule every receipt and day list follows (M13): each spend from a jar is printed as
 * spending, at its full amount, labelled with its jar, and under the spends one line per jar takes
 * what the jars covered back off. So the lines always add up to the day's total, which is what
 * the daily number counted (`sumDayPart`), and history still holds every spend in full.
 */
export function jarReceiptLines(
  spends: readonly CountedSpend[],
  notDaily: ReadonlySet<string>,
): JarReceiptLine[] {
  const byJar = new Map<string, Vnd>();
  for (const s of spends) {
    const part = jarPartOf(s, notDaily);
    if (part > 0 && s.fromPot != null) byJar.set(s.fromPot, (byJar.get(s.fromPot) ?? 0) + part);
  }
  return [...byJar].map(([potId, amount]) => ({ potId, amount }));
}

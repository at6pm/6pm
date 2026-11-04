import {
  jarReceiptLines,
  type CountedSpend,
  type PotRow,
  type SpendRow,
  type Vnd,
} from '@6pm/domain';

import type { I18n } from '../../i18n/i18n';
import { jarName } from '../pots/jar-name';

/** A spend as the money rules read it: what it is, and the jar it came out of. */
export function countedSpendOf(s: SpendRow): CountedSpend {
  return {
    amount: s.amount,
    category: s.categoryId,
    status: s.status,
    forWork: s.forWork,
    paysBill: s.paysBill,
    direction: s.direction,
    fromPot: s.fromPot,
    fromPotAmount: s.fromPotAmount,
  };
}

/**
 * "From {jar}" for a spend taken from a jar, in the phone's language. Future you is named by the
 * catalogue, never by its row; a jar since deleted keeps its name; one the phone no longer has at
 * all reads "From a jar".
 */
export function fromJarLabeller(
  pots: readonly Pick<PotRow, 'id' | 'name'>[],
  t: I18n['t'],
): (potId: string) => string {
  const byId = new Map(pots.map((p) => [p.id, p]));
  return (potId) => {
    const pot = byId.get(potId);
    return pot ? t('diary.fromJar', { jar: jarName(pot, t) }) : t('potsClose.fromJar');
  };
}

/** A day list's "From {jar}" line: what one jar covered of the spends printed above it. */
export interface JarLineView {
  readonly potId: string;
  readonly label: string;
  readonly amount: Vnd;
}

/**
 * The lines a day list prints under its spends (M13): each spend stays in full, and one line per
 * jar takes off what the jars covered, so the lines add up to what the day counted.
 */
export function jarLinesOf(
  spends: readonly SpendRow[],
  notDaily: ReadonlySet<string>,
  label: (potId: string) => string,
): JarLineView[] {
  return jarReceiptLines(spends.map(countedSpendOf), notDaily).map((line) => ({
    potId: line.potId,
    label: label(line.potId),
    amount: line.amount,
  }));
}

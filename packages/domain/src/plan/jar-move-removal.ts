import type { Vnd } from '../money/format';
import type { LocalDate } from '../time/local-date';
import type { PotMove } from './pots';

/**
 * A line of a jar's moves: a payday's set-aside, a top-up, money added that was already saved, a
 * spend taken from it, its start.
 */
export type JarMoveKind = 'payday' | 'topUp' | 'alreadySaved' | 'spent' | 'started';

/**
 * Whether a line of a jar's moves can be removed (M4, M13). A payday's set-aside never can: it is
 * what the plan does each payday. A start with nothing before 6pm has nothing to remove.
 */
export function canRemoveJarMove(line: {
  readonly kind: JarMoveKind;
  readonly amount: Vnd;
}): boolean {
  return line.kind !== 'payday' && line.amount > 0;
}

/**
 * What removing a top-up writes, so the money goes back to this cycle's free money (M4). One made
 * this cycle is deleted, and the cycle's top-ups fall by it. One made in an earlier cycle was that
 * cycle's money, long counted: it stays where it was and this cycle takes it back out of the jar
 * (a top-up of minus the amount), so the jar holds less and this cycle has that much more free.
 * Either way the undo is exact: put the row back, or delete the taking back.
 */
export type TopUpRemoval =
  { readonly kind: 'delete' } | { readonly kind: 'takeBack'; readonly move: PotMove };

export function topUpRemoval(
  topUp: Pick<PotMove, 'potId' | 'cycle' | 'amount'>,
  currentCycle: LocalDate,
): TopUpRemoval {
  if (topUp.cycle >= currentCycle) return { kind: 'delete' };
  return {
    kind: 'takeBack',
    move: {
      potId: topUp.potId,
      kind: 'topUp',
      cycle: currentCycle,
      amount: -Math.abs(Math.round(topUp.amount)),
    },
  };
}

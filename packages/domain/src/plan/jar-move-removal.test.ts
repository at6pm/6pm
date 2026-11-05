import { describe, expect, it } from 'vitest';

import { canRemoveJarMove, topUpRemoval } from './jar-move-removal';
import { potTotals, type PotMove } from './pots';

const jar = new Set(['trip']);
const now = '2026-10-31';
const moves: PotMove[] = [
  { potId: 'trip', kind: 'opening', cycle: '2026-08-31', amount: 5_000_000 },
  { potId: 'trip', kind: 'setAside', cycle: '2026-09-30', amount: 400_000 },
  { potId: 'trip', kind: 'topUp', cycle: '2026-09-30', amount: 300_000 },
  { potId: 'trip', kind: 'setAside', cycle: now, amount: 400_000 },
  { potId: 'trip', kind: 'topUp', cycle: now, amount: 200_000 },
];

describe('which of a jar’s moves can be removed', () => {
  it('never a payday’s set-aside, and not a start with nothing in it', () => {
    expect(canRemoveJarMove({ kind: 'payday', amount: 400_000 })).toBe(false);
    expect(canRemoveJarMove({ kind: 'started', amount: 0 })).toBe(false);
    expect(canRemoveJarMove({ kind: 'started', amount: 5_000_000 })).toBe(true);
    expect(canRemoveJarMove({ kind: 'topUp', amount: 200_000 })).toBe(true);
    expect(canRemoveJarMove({ kind: 'spent', amount: 1_200_000 })).toBe(true);
  });
});

describe('removing a top-up', () => {
  it('deletes one made this cycle, which gives it back to this cycle’s free money', () => {
    expect(topUpRemoval(moves[4] as PotMove, now)).toEqual({ kind: 'delete' });
    const before = potTotals(moves, jar, now);
    const after = potTotals(moves.slice(0, 4), jar, now);
    expect(before.topUps - after.topUps).toBe(200_000);
    expect((before.saved.trip ?? 0) - (after.saved.trip ?? 0)).toBe(200_000);
  });

  it('takes one from an earlier cycle back out this cycle, so this cycle has it free', () => {
    const removal = topUpRemoval(moves[2] as PotMove, now);
    expect(removal).toEqual({
      kind: 'takeBack',
      move: { potId: 'trip', kind: 'topUp', cycle: now, amount: -300_000 },
    });
    if (removal.kind !== 'takeBack') return;
    const before = potTotals(moves, jar, now);
    const after = potTotals([...moves, removal.move], jar, now);
    // This cycle's top-ups come out of free money: 300k fewer is 300k more free.
    expect(before.topUps - after.topUps).toBe(300_000);
    expect((before.saved.trip ?? 0) - (after.saved.trip ?? 0)).toBe(300_000);
    // The earlier cycle is left as it was counted.
    expect(potTotals([...moves, removal.move], jar, '2026-09-30').topUps).toBe(300_000);
  });

  it('is undone exactly by deleting what it wrote', () => {
    const removal = topUpRemoval(moves[2] as PotMove, now);
    if (removal.kind !== 'takeBack') throw new Error('expected a take back');
    const undone = [...moves, removal.move].filter((m) => m !== removal.move);
    expect(potTotals(undone, jar, now)).toEqual(potTotals(moves, jar, now));
  });
});

import { describe, expect, it } from 'vitest';

import { payCycleOn } from './pay-cycle';
import {
  BUFFER_POT_ID,
  bufferPotRow,
  futureYouPotRow,
  isBufferPot,
  jarFillOf,
  newJarLocked,
  occasionsOf,
  potSetAside,
} from './pots';

const at = '2026-11-01T00:00:00.000Z';

function ownJar(id: string) {
  return { ...bufferPotRow(at), id, name: id };
}

describe('the buffer jar', () => {
  it('is never one of the free jars', () => {
    const three = [ownJar('a'), ownJar('b'), ownJar('c')];
    const two = three.slice(0, 2);
    expect(newJarLocked([futureYouPotRow(at), bufferPotRow(at), ...two], false)).toBe(false);
    expect(newJarLocked([futureYouPotRow(at), bufferPotRow(at), ...three], false)).toBe(true);
  });

  it('is filled by hand only, so no payday sets money aside in it or out of free money', () => {
    const buffer = bufferPotRow(at);
    expect(isBufferPot(buffer)).toBe(true);
    expect(isBufferPot(BUFFER_POT_ID)).toBe(true);
    expect(jarFillOf(buffer)).toBe('byHand');
    const cycle = payCycleOn('2026-11-15', { kind: 'sameDay', day: 1 });
    expect(potSetAside({ pot: buffer, savedBefore: 7_100_000, futureYou: 500_000, cycle })).toBe(0);
    expect(occasionsOf([buffer], { [BUFFER_POT_ID]: 0 })).toBe(0);
  });
});

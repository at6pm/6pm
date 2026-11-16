import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  APART_PAIRS_MAX,
  TYPED_TWIN_WINDOW_MS,
  apartIndex,
  areApart,
  typedTwinOf,
  withApart,
  type TwinRow,
} from './typed-twin';

// Every name and amount here is made up.

const T0 = Date.parse('2026-11-14T03:30:00.000Z');
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();

const typed = (over: Partial<TwinRow> = {}): TwinRow => ({
  id: 'typed',
  amount: 50_000,
  source: 'manual',
  status: 'kept',
  at: at(0),
  keys: ['typed'],
  ...over,
});

const caught = (over: Partial<TwinRow> = {}): TwinRow => ({
  id: 'alert',
  amount: 50_000,
  source: 'alert',
  status: 'caught',
  at: at(1),
  keys: ['alert'],
  ...over,
});

const none: ReadonlySet<string> = new Set();

describe('typedTwinOf', () => {
  it('offers a caught payment as the spend typed a minute before it', () => {
    expect(typedTwinOf(caught(), [typed(), caught()], none)?.id).toBe('typed');
  });

  it('offers it typed after the payment too, within the window', () => {
    const later = typed({ at: at(1 + TYPED_TWIN_WINDOW_MS / 60_000) });
    expect(typedTwinOf(caught(), [later], none)?.id).toBe('typed');
    const tooLate = typed({ at: at(2 + TYPED_TWIN_WINDOW_MS / 60_000) });
    expect(typedTwinOf(caught(), [tooLate], none)).toBeNull();
  });

  it('offers spoken and cash spends, never another caught one', () => {
    expect(typedTwinOf(caught(), [typed({ source: 'voice' })], none)?.id).toBe('typed');
    expect(typedTwinOf(caught(), [typed({ source: 'cash' })], none)?.id).toBe('typed');
    expect(typedTwinOf(caught(), [typed({ source: 'email' })], none)).toBeNull();
  });

  it('never offers another amount, money the other way, or a row answered', () => {
    expect(typedTwinOf(caught(), [typed({ amount: 55_000 })], none)).toBeNull();
    expect(typedTwinOf(caught(), [typed({ direction: 'in' })], none)).toBeNull();
    expect(typedTwinOf(caught(), [typed({ status: 'deleted' })], none)).toBeNull();
    expect(typedTwinOf(caught({ status: 'skipped' }), [typed()], none)).toBeNull();
  });

  it('never offers a typed spend already joined to a payment', () => {
    expect(typedTwinOf(caught(), [typed({ keys: ['typed', 'mail'] })], none)).toBeNull();
  });

  it('never offers a pair the person said is two', () => {
    const apart = apartIndex(withApart([], ['alert'], ['typed']));
    expect(typedTwinOf(caught(), [typed()], apart)).toBeNull();
  });

  it('offers a typed spend once, to the caught payment nearest it', () => {
    const near = caught({ id: 'near', keys: ['near'], at: at(0.5) });
    const far = caught({ id: 'far', keys: ['far'], at: at(4) });
    const rows = [typed(), near, far];
    expect(typedTwinOf(near, rows, none)?.id).toBe('typed');
    expect(typedTwinOf(far, rows, none)).toBeNull();
  });

  it('offers the nearest of two typed spends', () => {
    const rows = [typed({ id: 'old', keys: ['old'], at: at(-9) }), typed()];
    expect(typedTwinOf(caught(), rows, none)?.id).toBe('typed');
  });
});

describe('the pairs said to be two', () => {
  it('holds every sighting of one apart from every sighting of the other', () => {
    const apart = apartIndex(withApart([], ['a1', 'a2'], ['b1']));
    expect(areApart(['a2'], ['b1', 'x'], apart)).toBe(true);
    expect(areApart(['b1'], ['a1'], apart)).toBe(true);
    expect(areApart(['a1'], ['a2'], apart)).toBe(false);
  });

  it('keeps the newest pairs, a pair said again moving to the end', () => {
    let pairs = withApart([], ['a'], ['b']);
    for (let i = 0; i < APART_PAIRS_MAX; i += 1) pairs = withApart(pairs, [`x${i}`], [`y${i}`]);
    expect(areApart(['a'], ['b'], apartIndex(pairs))).toBe(false);
    pairs = withApart(pairs, ['x3'], ['y3']);
    expect(pairs.at(-1)).toEqual(['x3', 'y3']);
    expect(pairs).toHaveLength(APART_PAIRS_MAX);
  });

  it('never joins a sighting split away again, whatever else was said apart', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string(), fc.string())),
        fc.string(),
        fc.array(fc.string(), { minLength: 1 }),
        (said, leaving, staying) => {
          const kept = staying.filter((k) => k !== leaving);
          const pairs = withApart(said, [leaving], kept);
          const apart = apartIndex(pairs.slice(-APART_PAIRS_MAX));
          if (kept.length > 0) expect(areApart([leaving], kept, apart)).toBe(true);
        },
      ),
    );
  });
});

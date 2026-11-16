import { describe, expect, it } from 'vitest';

import {
  closeReducer,
  startClose,
  stepPosition,
  type CloseEvent,
  type CloseState,
} from './close-flow';

function run(state: CloseState, ...events: CloseEvent[]): CloseState {
  return events.reduce(closeReducer, state);
}

describe('a seller’s close ends on today’s takings', () => {
  it('comes after the cards and the questions, before the receipt', () => {
    let s = startClose([{ id: 'bhx' }, { id: 'thao', moneyIn: true }], { takings: true });
    s = run(
      s,
      { type: 'decide', id: 'bhx', verdict: 'kept' },
      { type: 'decide', id: 'thao', verdict: 'kept' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
    );
    expect(s.step).toBe('takings');
    expect(stepPosition('takings')).toEqual({ index: 3, of: 5 });
    s = run(s, { type: 'takingsDone' });
    expect(s.step).toBe('receipt');
    expect(s.takingsDone).toBe(true);
  });

  it('is asked even on a day with nothing caught', () => {
    const s = run(startClose([], { takings: true }), { type: 'cashDone' });
    expect(s.step).toBe('takings');
  });

  it('comes before a jar’s ready moment', () => {
    const s = run(startClose([], { takings: true, readyPot: 'dalat' }), { type: 'cashDone' });
    expect(s.step).toBe('takings');
    expect(run(s, { type: 'takingsDone' }).step).toBe('potReady');
  });

  it('is never part of a close for someone who does not sell', () => {
    const s = startClose([]);
    expect(s.takings).toBeUndefined();
    expect(run(s, { type: 'cashDone' }).step).toBe('receipt');
    // Its event does nothing anywhere else.
    expect(run(s, { type: 'takingsDone' })).toBe(s);
  });

  it('pauses on the takings and resumes there', () => {
    const s = run(startClose([], { takings: true }), { type: 'cashDone' }, { type: 'pause' });
    expect(s.step).toBe('takings');
    expect(run(s, { type: 'resume' }).step).toBe('takings');
  });
});

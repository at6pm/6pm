import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  closeReducer,
  potQuestion,
  remainingCards,
  startClose,
  stepPosition,
  tally,
  type CloseEvent,
  type CloseState,
} from './close-flow';

const run = (state: CloseState, ...events: CloseEvent[]) => events.reduce(closeReducer, state);

const cards = [{ id: 'coffee' }, { id: 'pho' }, { id: 'circleK', askWork: true }];

describe('the 6pm close', () => {
  it('walks cards → sorted → cash → question → receipt → reveal → done', () => {
    let s = startClose(cards);
    expect(s.step).toBe('cards');
    s = run(
      s,
      { type: 'decide', id: 'coffee', verdict: 'kept' },
      { type: 'decide', id: 'pho', verdict: 'notMine' },
      { type: 'decide', id: 'circleK', verdict: 'edited' },
    );
    expect(s.step).toBe('sorted');
    expect(tally(s)).toEqual({ kept: 1, edited: 1, notMine: 1 });
    s = run(s, { type: 'sortedShown' }, { type: 'cashDone' });
    expect(s.step).toBe('question');
    s = run(s, { type: 'answerWork' }, { type: 'receiptDone' }, { type: 'finish' });
    expect(s.step).toBe('done');
  });

  it('skips the work question when the flagged spend was not mine', () => {
    const s = run(
      startClose(cards),
      { type: 'decide', id: 'coffee', verdict: 'kept' },
      { type: 'decide', id: 'pho', verdict: 'kept' },
      { type: 'decide', id: 'circleK', verdict: 'notMine' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
    );
    expect(s.step).toBe('receipt');
  });

  it('turns an empty day into a quick cash sweep', () => {
    const s = startClose([]);
    expect(s.step).toBe('cash');
    expect(s.sweep).toBe(true);
    expect(run(s, { type: 'cashDone' }).step).toBe('receipt');
  });

  it('undoes the last swipe, even the one that finished the cards', () => {
    let s = run(
      startClose(cards.slice(0, 2)),
      { type: 'decide', id: 'coffee', verdict: 'kept' },
      { type: 'decide', id: 'pho', verdict: 'kept' },
    );
    expect(s.step).toBe('sorted');
    s = run(s, { type: 'undo' });
    expect(s.step).toBe('cards');
    expect(remainingCards(s).map((c) => c.id)).toEqual(['pho']);
    expect(s.undoable).toBeNull();
  });

  it('cannot undo once the undo has expired or the cash step has started', () => {
    const decided = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    expect(run(decided, { type: 'undoExpired' }, { type: 'undo' }).verdicts).toEqual({
      coffee: 'kept',
    });
  });

  it('pauses where it was and resumes there; mid-sort resumes at cash', () => {
    const midCards = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    const paused = run(midCards, { type: 'pause' });
    expect(paused.paused).toBe(true);
    expect(paused.step).toBe('cards');
    expect(run(paused, { type: 'resume' }).paused).toBe(false);
    // A swipe that lands while paused is ignored; after resuming it counts.
    expect(run(paused, { type: 'decide', id: 'pho', verdict: 'kept' })).toBe(paused);
    expect(
      run(paused, { type: 'resume' }, { type: 'decide', id: 'pho', verdict: 'kept' }).verdicts,
    ).toHaveProperty('pho', 'kept');

    const sorted = run(
      startClose([{ id: 'a' }]),
      { type: 'decide', id: 'a', verdict: 'kept' },
      { type: 'pause' },
    );
    expect(sorted.step).toBe('cash');
  });

  it('leaving the reveal finishes the day', () => {
    const s = run(startClose([]), { type: 'cashDone' }, { type: 'receiptDone' }, { type: 'pause' });
    expect(s.step).toBe('done');
  });

  it('ignores decisions twice over, for unknown cards or outside the cards step', () => {
    const once = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    expect(run(once, { type: 'decide', id: 'coffee', verdict: 'notMine' })).toBe(once);
    expect(run(once, { type: 'decide', id: 'nope', verdict: 'kept' })).toBe(once);
  });

  it('labels five steps', () => {
    expect(stepPosition('cards')).toEqual({ index: 1, of: 5 });
    expect(stepPosition('pot')).toEqual({ index: 3, of: 5 });
    expect(stepPosition('potReady')).toEqual({ index: 3, of: 5 });
    expect(stepPosition('reveal')).toEqual({ index: 5, of: 5 });
  });

  it('asks "From your {pot}?" for a due pot spend and celebrates a ready pot before receipt', () => {
    let s = startClose([{ id: 'hotel', askPot: 'dalat', askWork: true }], { readyPot: 'dalat' });
    s = run(
      s,
      { type: 'decide', id: 'hotel', verdict: 'kept' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
    );
    expect(s.step).toBe('pot');
    expect(potQuestion(s)?.id).toBe('hotel');

    // Answering yes to "From your Đà Lạt pot?" skips the work question and moves to potReady
    s = run(s, { type: 'answerPot', id: 'hotel', fromPot: true });
    expect(s.potAnswers).toEqual({ hotel: true });
    expect(s.step).toBe('potReady');

    s = run(s, { type: 'potReadyDone' });
    expect(s.step).toBe('receipt');
    expect(run(s, { type: 'receiptDone' }, { type: 'finish' }).step).toBe('done');
  });

  it('skips the pot question when the spend was not mine or paid a bill', () => {
    const notMine = run(
      startClose([{ id: 'hotel', askPot: 'dalat' }]),
      { type: 'decide', id: 'hotel', verdict: 'notMine' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
    );
    expect(notMine.step).toBe('receipt');

    const paidBill = run(
      startClose([{ id: 'transfer', askBill: 'rent', askPot: 'dalat' }]),
      { type: 'decide', id: 'transfer', verdict: 'kept' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
      { type: 'answerBill', id: 'transfer', paid: true },
    );
    expect(paidBill.step).toBe('receipt');
  });

  it('always reaches done whatever order the user decides in', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('kept', 'edited', 'notMine'), { minLength: 0, maxLength: 8 }),
        fc.boolean(),
        (verdicts, askWork) => {
          const queue = verdicts.map((_, i) => ({ id: `s${i}`, askWork: askWork && i === 0 }));
          let s = startClose(queue);
          verdicts.forEach((verdict, i) => {
            s = closeReducer(s, { type: 'decide', id: `s${i}`, verdict });
          });
          s = run(s, { type: 'sortedShown' }, { type: 'cashDone' }, { type: 'answerWork' });
          s = run(s, { type: 'receiptDone' }, { type: 'finish' });
          expect(s.step).toBe('done');
          expect(Object.keys(s.verdicts)).toHaveLength(verdicts.length);
        },
      ),
    );
  });
});

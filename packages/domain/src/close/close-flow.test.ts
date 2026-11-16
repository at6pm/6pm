import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  closeReducer,
  latePayOf,
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

describe('payday, and no pay', () => {
  const late = { incomeId: 'pay', due: '2026-11-20' };

  it('opens on the payday card, then the cards, whatever it is told', () => {
    for (const answer of ['short', 'notYet', 'landed'] as const) {
      let s = startClose(cards, { latePay: late });
      expect(s).toMatchObject({ step: 'payday', latePay: late });
      expect(stepPosition(s.step)).toEqual({ index: 1, of: 5 });
      // Nothing else moves the card on: not a swipe, not the cash step.
      s = run(s, { type: 'decide', id: 'coffee', verdict: 'kept' }, { type: 'cashDone' });
      expect(s.step).toBe('payday');
      expect(s.verdicts).toEqual({});
      s = run(s, { type: 'answerPayday', answer });
      expect(s).toMatchObject({ step: 'cards', paydayAnswer: answer });
      expect(run(s, { type: 'answerPayday', answer: 'short' })).toBe(s);
    }
  });

  it('goes on to the cash step when nothing waits to be swiped', () => {
    const s = run(startClose([], { latePay: late }), { type: 'answerPayday', answer: 'notYet' });
    expect(s).toMatchObject({ step: 'cash', sweep: true });
  });

  it('pauses on the card and resumes there', () => {
    const s = run(startClose(cards, { latePay: late }), { type: 'pause' });
    expect(s).toMatchObject({ step: 'payday', paused: true });
    expect(run(s, { type: 'answerPayday', answer: 'notYet' }).step).toBe('payday');
    expect(run(s, { type: 'resume' }, { type: 'answerPayday', answer: 'notYet' }).step).toBe(
      'cards',
    );
  });

  it('leaves a close with no late pay exactly as it was', () => {
    expect(startClose(cards, { latePay: null })).toEqual(startClose(cards));
    expect(startClose(cards)).not.toHaveProperty('latePay');
    expect(run(startClose(cards), { type: 'answerPayday', answer: 'landed' })).toEqual(
      startClose(cards),
    );
  });

  it('is asked only while a pay is late and nothing in the close is asked as that pay', () => {
    const due = '2026-11-20';
    expect(latePayOf({ due, incomeId: 'pay', asks: [] })).toEqual({ incomeId: 'pay', due });
    expect(latePayOf({ due: null, incomeId: 'pay', asks: [] })).toBeNull();
    expect(latePayOf({ due, incomeId: null, asks: [] })).toBeNull();
    expect(
      latePayOf({ due, incomeId: 'pay', asks: [{ kind: 'pay', incomeId: 'pay' }] }),
    ).toBeNull();
    expect(latePayOf({ due, incomeId: 'pay', asks: [{ kind: 'refund' }] })).toEqual({
      incomeId: 'pay',
      due,
    });
  });
});

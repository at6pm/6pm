import { describe, expect, it } from 'vitest';

import {
  closeReducer,
  moneyQuestion,
  remainingCards,
  remainingMoneyCards,
  startClose,
  stepPosition,
  tally,
  type CloseEvent,
  type CloseState,
} from './close-flow';

const run = (state: CloseState, ...events: CloseEvent[]) => events.reduce(closeReducer, state);

describe('money in on the cards step', () => {
  const cards = [{ id: 'coffee' }, { id: 'gift', moneyIn: true }, { id: 'pho' }];

  it('is spread or saved like a keep, and tallied as kept', () => {
    const s = run(
      startClose(cards),
      { type: 'decide', id: 'coffee', verdict: 'kept' },
      { type: 'decide', id: 'gift', verdict: 'saved' },
      { type: 'decide', id: 'pho', verdict: 'notMine' },
    );
    expect(s.step).toBe('sorted');
    expect(tally(s)).toEqual({ kept: 2, edited: 0, notMine: 1 });
  });

  it('can be undone like any swipe', () => {
    let s = run(startClose(cards), { type: 'decide', id: 'gift', verdict: 'spread' });
    s = run(s, { type: 'undo' });
    expect(s.verdicts).toEqual({});
    expect(remainingCards(s).map((c) => c.id)).toEqual(['coffee', 'gift', 'pho']);
  });
});

describe('money the close asks about', () => {
  const cards = [
    { id: 'coffee' },
    { id: 'salary', moneyIn: true, askMoney: 'pay' as const },
    { id: 'shopee', moneyIn: true, askMoney: 'refund' as const },
  ];

  it('skips the cards and is asked about after the cash step, in order', () => {
    let s = startClose(cards);
    expect(remainingCards(s).map((c) => c.id)).toEqual(['coffee']);
    s = run(s, { type: 'decide', id: 'coffee', verdict: 'kept' }, { type: 'sortedShown' });
    s = run(s, { type: 'cashDone' });
    expect(s.step).toBe('money');
    expect(stepPosition(s.step).index).toBe(3);
    expect(moneyQuestion(s)?.id).toBe('salary');
    s = run(s, { type: 'answerMoney', id: 'salary', yes: true });
    expect(moneyQuestion(s)?.id).toBe('shopee');
    s = run(s, { type: 'answerMoney', id: 'shopee', yes: true });
    expect(s.step).toBe('receipt');
    expect(s.moneyAnswers).toEqual({ salary: true, shopee: true });
  });

  it('opens on the cash step when only money to ask about was caught', () => {
    const s = startClose([{ id: 'salary', moneyIn: true, askMoney: 'pay' }]);
    expect(s.step).toBe('cash');
    expect(s.sweep).toBe(false);
  });

  it('cards the pay’s extra after the questions, to spread or save', () => {
    let s = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    s = run(s, { type: 'sortedShown' }, { type: 'cashDone' });
    s = run(s, { type: 'answerMoney', id: 'salary', yes: true, extra: 'salary-extra' });
    s = run(s, { type: 'answerMoney', id: 'shopee', yes: true });
    expect(s.step).toBe('moneyCards');
    expect(stepPosition(s.step).index).toBe(3);
    expect(remainingMoneyCards(s).map((c) => c.id)).toEqual(['salary-extra']);
    s = run(s, { type: 'decide', id: 'salary-extra', verdict: 'spread' });
    expect(s.step).toBe('receipt');
  });

  it('makes money that was not what it looked like an ordinary card', () => {
    let s = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    s = run(s, { type: 'sortedShown' }, { type: 'cashDone' });
    s = run(s, { type: 'answerMoney', id: 'salary', yes: false });
    s = run(s, { type: 'answerMoney', id: 'shopee', yes: true });
    expect(remainingMoneyCards(s).map((c) => c.id)).toEqual(['salary']);
    s = run(s, { type: 'decide', id: 'salary', verdict: 'saved' });
    expect(s.verdicts['salary']).toBe('saved');
  });

  it('undoes the last money card back onto its step', () => {
    let s = run(startClose(cards), { type: 'decide', id: 'coffee', verdict: 'kept' });
    s = run(s, { type: 'sortedShown' }, { type: 'cashDone' });
    s = run(s, { type: 'answerMoney', id: 'salary', yes: false });
    s = run(s, { type: 'answerMoney', id: 'shopee', yes: true });
    s = run(s, { type: 'decide', id: 'salary', verdict: 'spread' }, { type: 'undo' });
    expect(s.step).toBe('moneyCards');
    expect(remainingMoneyCards(s).map((c) => c.id)).toEqual(['salary']);
  });

  it('ignores an answer out of turn and a swipe on money still to ask about', () => {
    let s = startClose(cards);
    expect(run(s, { type: 'answerMoney', id: 'salary', yes: true })).toBe(s);
    expect(run(s, { type: 'decide', id: 'salary', verdict: 'spread' })).toBe(s);
    s = run(s, { type: 'decide', id: 'coffee', verdict: 'kept' }, { type: 'sortedShown' });
    s = run(s, { type: 'cashDone' });
    expect(run(s, { type: 'answerMoney', id: 'shopee', yes: true })).toBe(s);
  });

  it('asks the bill questions first and the work question last', () => {
    const mixed = [
      { id: 'statement', askBill: 'card' },
      { id: 'laptop', askWork: true },
      { id: 'salary', moneyIn: true, askMoney: 'pay' as const },
    ];
    let s = run(
      startClose(mixed),
      { type: 'decide', id: 'statement', verdict: 'kept' },
      { type: 'decide', id: 'laptop', verdict: 'kept' },
      { type: 'sortedShown' },
      { type: 'cashDone' },
    );
    expect(s.step).toBe('bill');
    s = run(s, { type: 'answerBill', id: 'statement', paid: true });
    expect(s.step).toBe('money');
    s = run(s, { type: 'answerMoney', id: 'salary', yes: true });
    expect(s.step).toBe('question');
  });
});

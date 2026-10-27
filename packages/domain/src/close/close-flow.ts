/**
 * The 6pm Close as a state machine, independent of any screen:
 *
 *   cards → sorted → cash (or sweep) → bill? → money? → moneyCards? → question? → receipt → reveal
 *
 * - `cards`: each waiting spend is kept, edited (then kept) or marked not mine; money that came in
 *   is spread over the days, saved, edited or marked not mine. The last swipe can be undone.
 * - `sorted`: a beat that tallies the swipes, then moves on by itself.
 * - `cash`: anything paid in cash today; `sweep` is the same step when nothing was caught.
 * - `bill`: one question per kept spend that looks like a bill's payment ("Is this your {bill}?")
 *   or a repayment with no bill ("Paying off a card or loan?"), in the queue's order.
 * - `money`: one question per money in that looks like the pay, a refund or a payback ("Is this
 *   your pay?"), in the queue's order. Such money skips the cards: the question places it.
 * - `moneyCards`: money in the questions turned into cards: the pay's extra, or money that was not
 *   what it looked like. Decided as on the cards step, with no tally beat after.
 * - `question`: asked only when a kept spend is flagged as maybe-for-work and not yet answered.
 * - `receipt` and `reveal`: the printed day and tomorrow's number.
 *
 * Leaving at any step pauses the close; resuming returns to that step (`sorted` resumes at cash).
 */

export type CloseStep =
  | 'cards'
  | 'sorted'
  | 'cash'
  | 'bill'
  | 'money'
  | 'moneyCards'
  | 'question'
  | 'receipt'
  | 'reveal'
  | 'done';

/** `spread` and `saved` are money in's keeps: over the days left, or up into Future you. */
export type CardVerdict = 'kept' | 'edited' | 'notMine' | 'spread' | 'saved';

/** What the close asks about money in before placing it (see `moneyInAsk`). */
export type MoneyAsk = 'pay' | 'refund' | 'payback';

export interface CloseCard {
  readonly id: string;
  /** The spend might be for work: the close asks once. */
  readonly askWork?: boolean;
  /**
   * The spend may have paid a bill: the bill's id, or `REPAYMENT` for a card or loan with no bill.
   * The close asks once.
   */
  readonly askBill?: string;
  /** Money that came in: decided by spreading or saving it, not keeping. */
  readonly moneyIn?: boolean;
  /** Money in that looks like the pay, a refund or a payback: asked about, never carded first. */
  readonly askMoney?: MoneyAsk;
}

export interface CloseState {
  readonly step: CloseStep;
  /** The queue as it was when the close opened; its order never changes during the close. */
  readonly cards: readonly CloseCard[];
  readonly verdicts: Readonly<Record<string, CardVerdict>>;
  /** The last decided card, while its undo is still offered. */
  readonly undoable: string | null;
  /** Nothing was caught today: the cash step is a quick sweep. */
  readonly sweep: boolean;
  readonly workAnswered: boolean;
  /** Bill questions answered, by card id: true when the spend paid it. */
  readonly billAnswers: Readonly<Record<string, boolean>>;
  /** Money questions answered, by card id: true when it was what it looked like. */
  readonly moneyAnswers: Readonly<Record<string, boolean>>;
  /** Money in carded by the questions (the pay's extra, or a no), in the order they came. */
  readonly moneyCards: readonly CloseCard[];
  readonly paused: boolean;
}

export type CloseEvent =
  | { readonly type: 'decide'; readonly id: string; readonly verdict: CardVerdict }
  | { readonly type: 'undo' }
  | { readonly type: 'undoExpired' }
  | { readonly type: 'sortedShown' }
  | { readonly type: 'cashDone' }
  | { readonly type: 'answerBill'; readonly id: string; readonly paid: boolean }
  /**
   * A money question answered. A yes to the pay may bring its `extra` (a new card's id): money
   * beyond the plan, placed next. A no makes the money an ordinary card.
   */
  | {
      readonly type: 'answerMoney';
      readonly id: string;
      readonly yes: boolean;
      readonly extra?: string | undefined;
    }
  | { readonly type: 'answerWork' }
  | { readonly type: 'receiptDone' }
  | { readonly type: 'finish' }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' };

export function startClose(cards: readonly CloseCard[]): CloseState {
  const swiped = cards.filter((card) => card.askMoney === undefined);
  return {
    step: swiped.length > 0 ? 'cards' : 'cash',
    cards,
    verdicts: {},
    undoable: null,
    sweep: cards.length === 0,
    workAnswered: false,
    billAnswers: {},
    moneyAnswers: {},
    moneyCards: [],
    paused: false,
  };
}

/** The cards still to swipe on the cards step, in order: money to ask about waits for its question. */
export function remainingCards(state: CloseState): readonly CloseCard[] {
  return state.cards.filter(
    (card) => card.askMoney === undefined && state.verdicts[card.id] === undefined,
  );
}

/** The money cards the questions made that are still to place, in order. */
export function remainingMoneyCards(state: CloseState): readonly CloseCard[] {
  return state.moneyCards.filter((card) => state.verdicts[card.id] === undefined);
}

export interface CloseTally {
  readonly kept: number;
  readonly edited: number;
  readonly notMine: number;
}

export function tally(state: CloseState): CloseTally {
  const verdicts = Object.values(state.verdicts);
  return {
    kept: verdicts.filter((v) => v === 'kept' || v === 'spread' || v === 'saved').length,
    edited: verdicts.filter((v) => v === 'edited').length,
    notMine: verdicts.filter((v) => v === 'notMine').length,
  };
}

/** The next card the close asks "Is this your bill?" about, or null when none is left. */
export function billQuestion(state: CloseState): CloseCard | null {
  return (
    state.cards.find(
      (card) =>
        card.askBill !== undefined &&
        state.verdicts[card.id] !== 'notMine' &&
        state.billAnswers[card.id] === undefined,
    ) ?? null
  );
}

/** The next money in the close asks about ("Is this your pay?"), or null when none is left. */
export function moneyQuestion(state: CloseState): CloseCard | null {
  return (
    state.cards.find(
      (card) => card.askMoney !== undefined && state.moneyAnswers[card.id] === undefined,
    ) ?? null
  );
}

/** A spend that paid a bill is not spending, so it is never asked about as work. */
function needsWorkQuestion(state: CloseState): boolean {
  if (state.workAnswered) return false;
  return state.cards.some(
    (card) =>
      card.askWork === true &&
      state.verdicts[card.id] !== 'notMine' &&
      state.billAnswers[card.id] !== true,
  );
}

/** Where the close goes after the cash step, each answer and the last money card. */
function afterCash(state: CloseState): CloseState {
  const step = billQuestion(state)
    ? 'bill'
    : moneyQuestion(state)
      ? 'money'
      : remainingMoneyCards(state).length > 0
        ? 'moneyCards'
        : needsWorkQuestion(state)
          ? 'question'
          : 'receipt';
  return { ...state, step };
}

function isMoneyCard(state: CloseState, id: string): boolean {
  return state.moneyCards.some((card) => card.id === id);
}

export function closeReducer(state: CloseState, event: CloseEvent): CloseState {
  switch (event.type) {
    case 'decide': {
      // A paused close takes no swipes until it is resumed.
      if (state.paused || state.verdicts[event.id] !== undefined) return state;
      if (state.step === 'moneyCards') {
        if (!remainingMoneyCards(state).some((card) => card.id === event.id)) return state;
        const verdicts = { ...state.verdicts, [event.id]: event.verdict };
        const next = { ...state, verdicts, undoable: event.id };
        return remainingMoneyCards(next).length === 0 ? afterCash(next) : next;
      }
      if (state.step !== 'cards') return state;
      if (!remainingCards(state).some((card) => card.id === event.id)) return state;
      const verdicts = { ...state.verdicts, [event.id]: event.verdict };
      const next = { ...state, verdicts, undoable: event.id };
      return remainingCards(next).length === 0 ? { ...next, step: 'sorted' } : next;
    }
    case 'undo': {
      if (state.undoable === null) return state;
      const money = isMoneyCard(state, state.undoable);
      const from: readonly CloseStep[] = money
        ? ['moneyCards', 'question', 'receipt']
        : ['cards', 'sorted'];
      if (!from.includes(state.step)) return state;
      const { [state.undoable]: _undone, ...verdicts } = state.verdicts;
      return { ...state, verdicts, undoable: null, step: money ? 'moneyCards' : 'cards' };
    }
    case 'undoExpired':
      return { ...state, undoable: null };
    case 'sortedShown':
      return state.step === 'sorted' ? { ...state, step: 'cash', undoable: null } : state;
    case 'cashDone':
      return state.step === 'cash' ? afterCash(state) : state;
    case 'answerBill': {
      if (state.step !== 'bill' || billQuestion(state)?.id !== event.id) return state;
      return afterCash({ ...state, billAnswers: { ...state.billAnswers, [event.id]: event.paid } });
    }
    case 'answerMoney': {
      if (state.step !== 'money' || moneyQuestion(state)?.id !== event.id) return state;
      const carded = event.yes
        ? event.extra !== undefined
          ? [{ id: event.extra, moneyIn: true }]
          : []
        : [{ id: event.id, moneyIn: true }];
      return afterCash({
        ...state,
        undoable: null,
        moneyAnswers: { ...state.moneyAnswers, [event.id]: event.yes },
        moneyCards: [...state.moneyCards, ...carded],
      });
    }
    case 'answerWork':
      return state.step === 'question'
        ? { ...state, workAnswered: true, undoable: null, step: 'receipt' }
        : state;
    case 'receiptDone':
      return state.step === 'receipt' ? { ...state, step: 'reveal' } : state;
    case 'finish':
      return state.step === 'reveal' ? { ...state, step: 'done', paused: false } : state;
    case 'pause':
      // Leaving the reveal finishes the day; leaving mid-sort comes back at the cash step.
      if (state.step === 'reveal') return { ...state, step: 'done' };
      if (state.step === 'done') return state;
      return {
        ...state,
        paused: true,
        undoable: null,
        step: state.step === 'sorted' ? 'cash' : state.step,
      };
    case 'resume':
      return { ...state, paused: false };
  }
}

/** "CAUGHT · 1/5" … "TOMORROW · 5/5": the step label and its position in the five-step bar. */
export function stepPosition(step: CloseStep): { index: number; of: 5 } {
  const index =
    step === 'cards' || step === 'sorted'
      ? 1
      : step === 'cash'
        ? 2
        : step === 'bill' || step === 'money' || step === 'moneyCards' || step === 'question'
          ? 3
          : step === 'receipt'
            ? 4
            : 5;
  return { index, of: 5 };
}

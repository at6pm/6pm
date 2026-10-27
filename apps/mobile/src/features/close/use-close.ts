import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import {
  billPaymentAsks,
  closeQueue,
  closeReducer,
  designAmount,
  FUTURE_YOU,
  moneyInAsk,
  receiptBankOf,
  remainingCards,
  remainingMoneyCards,
  startClose,
  type CardVerdict,
  type BillRow,
  type CloseState,
  type Currency,
  type GivableSpend,
  type MoneyInAsk,
  type PayCycle,
  REPAYMENT,
  type SpendRow,
} from '@6pm/domain';

import type { MoneyInPlace } from '../../data/money-in-actions';

import { useMoney, useMoneyActions } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';
import { homeCurrencyOf } from '../../money/use-money-format';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { useRunAction } from '../companion/use-run-action';
import { useSpendLabels, useSpendRows } from '../today/use-spend-rows';
import type { CloseCardContent } from './close-card';
import { clearClose, parkClose, parkedClose } from './close-session';
import type { CashChip } from './close-steps';
import { useCloseMoney } from './use-close-money';

const UNDO_MS = 4500;
const SORTED_MS = 1700;
/**
 * A spend worth asking about: big enough to plausibly be claimed back, read from a receipt. The
 * design's 100.000₫, worth the same in the home currency.
 */
const WORK_QUESTION_MIN = 100_000;

interface Start {
  readonly queue: readonly SpendRow[];
  readonly state: CloseState;
  readonly cash: readonly CashChip[];
  readonly moneyAsks: Readonly<Record<string, MoneyInAsk>>;
}

const comesIn = (spend: SpendRow) => spend.direction === 'in';

/**
 * The close opens on the day's waiting spends, or where it was left: a close parked past the
 * cards step picks up at that step with the same queue and the cash already added. Waiting
 * spends from earlier days are part of the queue.
 */
function startOf(
  spends: readonly SpendRow[],
  day: string,
  home: Currency,
  bills: readonly BillRow[],
  cycle: PayCycle,
  money: { readonly income: number; readonly givable: readonly GivableSpend[] },
): Start {
  const parked = parkedClose(day);
  if (parked !== null && parked.state.step !== 'cards' && parked.state.step !== 'done') {
    const byId = new Map(spends.map((s) => [s.id, s]));
    return {
      queue: parked.queueIds.flatMap((id) => byId.get(id) ?? []),
      state: closeReducer(parked.state, { type: 'resume' }),
      cash: parked.cash,
      moneyAsks: parked.moneyAsks,
    };
  }
  const queue = closeQueue(spends, day);
  const spending = queue.filter((s) => !comesIn(s));
  const askWorkId = workCandidate(queue, designAmount(WORK_QUESTION_MIN, home));
  const asks = new Map(
    billPaymentAsks(spending, bills, cycle).map((ask) => [ask.spendId, ask.billId ?? REPAYMENT]),
  );
  // Each spend is given back once: a second refund of the same order is an ordinary card.
  const taken = new Set<string>();
  const moneyAsks: Record<string, MoneyInAsk> = {};
  for (const s of queue.filter(comesIn)) {
    const givable = money.givable.filter((g) => !taken.has(g.id));
    const ask = moneyInAsk(
      {
        day: s.day,
        amount: s.amount,
        merchant: s.merchant,
        note: s.note,
        memo: s.memo,
        hint: s.moneyIn === 'refund' ? 'refund' : null,
      },
      { income: money.income, cycle, spends: givable },
    );
    if (ask === null) continue;
    if (ask.kind !== 'pay') taken.add(ask.spendId);
    moneyAsks[s.id] = ask;
  }
  return {
    queue,
    state: startClose(
      queue.map((s) => {
        if (comesIn(s)) {
          const ask = moneyAsks[s.id];
          return { id: s.id, moneyIn: true, ...(ask ? { askMoney: ask.kind } : {}) };
        }
        const askBill = asks.get(s.id);
        return {
          id: s.id,
          askWork: s.id === askWorkId,
          ...(askBill === undefined ? {} : { askBill }),
        };
      }),
    ),
    cash: [],
    moneyAsks,
  };
}

function workCandidate(queue: readonly SpendRow[], min: number): string | null {
  const candidates = queue.filter(
    (s) => !comesIn(s) && s.amount >= min && (s.source === 'shared' || s.source === 'email'),
  );
  return [...candidates].sort((a, b) => b.amount - a.amount)[0]?.id ?? null;
}

/**
 * The close for the day's waiting spends: the tested state machine, plus writing each decision to
 * the database the moment it is made (so leaving mid-close loses nothing). Leaving parks the
 * close at its step; reopening resumes it.
 */
export function useClose(givable: readonly GivableSpend[]) {
  const snap = useMoney();
  const moneyIn = useCloseMoney();
  const actions = useMoneyActions();
  const run = useRunAction();
  const { t, language } = useI18n();
  const labels = useSpendLabels();
  // The day being closed is fixed when the close opens, even if the money day turns over under it.
  const [day] = useState(snap.today);

  // Fixed when the close opens; its order never changes underneath the user.
  const home = homeCurrencyOf(snap.plan);
  const [start] = useState(() =>
    startOf([...snap.cycleSpends, ...snap.waitingBefore], day, home, snap.bills, snap.cycle, {
      income: snap.plan?.income ?? 0,
      givable,
    }),
  );
  const { queue, moneyAsks } = start;
  const askWorkId = useMemo(
    () => workCandidate(queue, designAmount(WORK_QUESTION_MIN, home)),
    [queue, home],
  );
  const [state, dispatch] = useReducer(closeReducer, start.state);
  const [cash, setCash] = useState<readonly CashChip[]>(start.cash);
  // Money the questions carded mid-close (the pay's extra) was not in the queue it opened with.
  const extras = useMemo(
    () =>
      state.moneyCards.flatMap((card) =>
        queue.some((s) => s.id === card.id) ? [] : (findSpend(snap, card.id) ?? []),
      ),
    [state.moneyCards, queue, snap],
  );
  const everything = useMemo(() => [...queue, ...extras], [queue, extras]);
  const rows = useSpendRows(everything);
  const categories = useMemo(
    () => new Map(snap.categories.map((c) => [c.id, c])),
    [snap.categories],
  );
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const weekday = useMemo(
    () => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB', { weekday: 'short' }),
    [language],
  );

  // Leaving by any route parks the close where it stands, unless the day was closed.
  const latest = useRef({ state, cash });
  useEffect(() => {
    latest.current = { state, cash };
  });
  const finished = useRef(false);
  const queueIds = useMemo(() => queue.map((s) => s.id), [queue]);
  useEffect(
    () => () => {
      if (finished.current) return;
      const { state: left, cash: added } = latest.current;
      parkClose({
        day,
        // Leaving the reveal keeps the reveal; every other step pauses as the machine says.
        state:
          left.step === 'reveal'
            ? { ...left, paused: true }
            : closeReducer(left, { type: 'pause' }),
        queueIds,
        cash: added,
        moneyAsks,
      });
    },
    [day, queueIds, moneyAsks],
  );
  /** The day is closed: nothing is left to resume. */
  const settle = useCallback(() => {
    finished.current = true;
    clearClose();
  }, []);

  const keptBefore = queue
    .filter(
      (s) => !comesIn(s) && (state.verdicts[s.id] === 'kept' || state.verdicts[s.id] === 'edited'),
    )
    .reduce((sum, s) => sum + (findSpend(snap, s.id)?.amount ?? s.amount), 0);
  // A shared receipt names its bank as the prototype words it, an emailed one the address it
  // came from; other sources show their detail.
  const cardDetail = (spend: SpendRow) => {
    if (spend.source === 'email' && spend.detail) {
      return t('receiptEmail.from', { address: spend.detail });
    }
    const bank = spend.source === 'shared' ? receiptBankOf(spend.detail) : null;
    return bank ? t('close.card.readFrom', { bank }) : spend.detail;
  };
  const extraIds = new Set(extras.map((s) => s.id));
  const contentOf = (id: string): CloseCardContent => {
    const spend = everything.find((s) => s.id === id);
    const found = rows.find((r) => r.id === id);
    if (!spend || !found) throw new Error('A close card lost its spend');
    const extra = extraIds.has(id);
    const index = extra ? queue.length + extras.indexOf(spend) : queue.indexOf(spend);
    const total = queue.length + extras.length;
    const time = labels.time(spend.at);
    const money = moneyIn.cardOf(spend);
    const row = money && found.name === '' ? { ...found, name: t('moneyIn.name') } : found;
    return {
      row,
      no: extra
        ? t('close.card.no', {
            n: String(index + 1).padStart(2, '0'),
            total: String(total).padStart(2, '0'),
            source: labels.source(spend.source),
          })
        : t('close.card.no', {
            n: String(index + 1).padStart(2, '0'),
            total: String(queue.length).padStart(2, '0'),
            source: labels.source(spend.source),
          }),
      source: labels.source(spend.source),
      // A waiting spend from an earlier day says which day.
      time: spend.day < day ? `${weekday.format(new Date(spend.at))} ${time}` : time,
      category: money
        ? t(extra ? 'moneyIn.extra.category' : 'moneyIn.name')
        : (categories.get(spend.categoryId)?.name ?? ''),
      amount: spend.amount,
      keptBefore,
      detail: extra ? moneyIn.countedAsPay : cardDetail(spend),
      ...(money ? { money } : {}),
      labels: {
        keptSoFar: t('close.card.keptSoFar'),
        withThis: t('close.card.withThis'),
        keep: t('close.stamp.keep'),
        edit: t('close.stamp.edit'),
        notMine: t('close.stamp.notMine'),
      },
    };
  };
  const cards: CloseCardContent[] = remainingCards(state).map((card) => contentOf(card.id));
  const moneyCards: CloseCardContent[] = remainingMoneyCards(state).map((card) =>
    contentOf(card.id),
  );

  const startUndo = useCallback(() => {
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => dispatch({ type: 'undoExpired' }), UNDO_MS);
  }, []);
  const decide = useCallback(
    (id: string, verdict: CardVerdict, edit?: { amount: number; categoryId: string }) => {
      dispatch({ type: 'decide', id, verdict });
      if (verdict === 'spread' || verdict === 'saved') {
        const place: MoneyInPlace =
          verdict === 'saved' ? { moneyIn: 'saved', savedTo: FUTURE_YOU } : { moneyIn: 'spread' };
        void run(() => actions.placeMoneyIn(id, place));
      } else {
        void run(() => actions.setStatus(id, verdict === 'notMine' ? 'skipped' : 'kept', edit));
      }
      startUndo();
    },
    [actions, run, startUndo],
  );
  /** Money placed from the edit sheet: a pot, a payback, or spread or saved after all. */
  const decideMoney = useCallback(
    (id: string, place: MoneyInPlace) => {
      dispatch({ type: 'decide', id, verdict: 'edited' });
      void run(() => actions.placeMoneyIn(id, place));
      startUndo();
    },
    [actions, run, startUndo],
  );
  const undo = useCallback(() => {
    const id = state.undoable;
    if (!id) return;
    haptics.tap();
    const verdict = state.verdicts[id];
    const spend = everything.find((s) => s.id === id);
    if (spend && comesIn(spend) && verdict !== 'notMine') {
      void run(() => actions.unplaceMoneyIn(id));
    } else {
      // An edit changed the amount and category too; undoing puts the card back as it arrived.
      const restore =
        verdict === 'edited' && spend ? { amount: spend.amount, categoryId: spend.categoryId } : {};
      void run(() => actions.undo(id, restore));
    }
    dispatch({ type: 'undo' });
  }, [actions, run, everything, state.undoable, state.verdicts]);

  // The sorted beat moves on by itself.
  useEffect(() => {
    if (state.step !== 'sorted') return;
    haptics.success();
    const timer = setTimeout(() => dispatch({ type: 'sortedShown' }), SORTED_MS);
    return () => clearTimeout(timer);
  }, [state.step]);
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const undone = state.undoable ? everything.find((s) => s.id === state.undoable) : undefined;
  const undoVerdict = undone ? state.verdicts[undone.id] : undefined;
  const undoText = undone
    ? t(
        undoVerdict === 'notMine'
          ? 'close.undoSkipped'
          : undoVerdict === 'edited'
            ? 'close.undoEdited'
            : undoVerdict === 'spread'
              ? 'moneyIn.undoSpread'
              : undoVerdict === 'saved'
                ? 'moneyIn.undoSaved'
                : 'close.undoKept',
        { name: undone.merchant || t('moneyIn.name') },
      )
    : null;

  return {
    day,
    state,
    dispatch,
    queue,
    everything,
    extraIds,
    cards,
    moneyCards,
    moneyAsks,
    moneyIn,
    decide,
    decideMoney,
    undo,
    undoText,
    askWorkId,
    keptBefore,
    cash,
    setCash,
    settle,
    run,
  };
}

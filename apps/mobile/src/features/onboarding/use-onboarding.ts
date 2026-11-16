import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  DEFAULT_CLOSE_AT,
  leadIncome,
  perPayOf,
  startingBankWork,
  type BankWork,
  type Payday,
} from '@6pm/domain';

import { useMoneyStore } from '../../data/money-provider';
import { importedSpentBetween } from '../../data/import-actions';
import { completeOnboarding } from '../../data/onboarding';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { GOT_PAID } from '../today/money-came-in-card';
import { useClock } from '../../ui/theme/clock';
import { billName } from './bill-copy';
import { billTotal, chosenBills, dealDeck, NO_BILL_ANSWERS, type BillAnswers } from './bill-deck';
import { DECK_START, type DeckNav } from './bill-deck-view';
import { askForReminders, scheduleCloseReminder } from './close-reminder';
import { firstDayOfIncomes } from './first-day-incomes';
import {
  lastsTo,
  moneyPages,
  planOfAnswers,
  toggleWay,
  type LastFor,
  type MoneyWay,
  type MoneyWaysAnswers,
  type PayEvery,
} from './money-ways';
import {
  firstDay,
  futureYouOfAnswers,
  landedFutureStartSteps,
  startingIncome,
  startingPay,
} from './onboarding-maths';
import { STEP_COUNT } from './onboarding-palette';

/**
 * The design's starting answers: a wheel has to rest somewhere. Bills always start at zero; money
 * in starts at 15.500.000₫, or about as much in the home currency.
 */
const START = { payday: 25, percent: 12 } as const;
/** "Open 6pm" holds the closing sky this long before Home takes over. */
const LEAVE_MS = 1100;
export const LAST_STEP = STEP_COUNT - 1;
export const WELCOME_STEP = 0;
export const PRIVACY_STEP = 1;
export const MONEY_IN_STEP = 2;
export const BILLS_STEP = 3;
export const FUTURE_STEP = 4;
export const PAY_WITH_STEP = 5;
export const AI_STEP = 6;
export const CATCH_STEP = 7;
export const CLOSE_STEP = 8;

/**
 * Steps a platform leaves out. Android has no model to run on the phone, so where 6pm thinks is
 * not a choice there: the server it already uses stays.
 */
const LEFT_OUT: readonly number[] = Platform.OS === 'android' ? [AI_STEP] : [];

/** How many steps this phone shows, for the progress bar. */
export const SHOWN_STEPS = STEP_COUNT - LEFT_OUT.length;

/** A step's place among the steps this phone shows. */
export function shownIndex(step: number): number {
  return step - LEFT_OUT.filter((s) => s < step).length;
}

/** Onboarding's answers and moves, and what follows from them. */
export function useOnboarding(startStep = 0) {
  const router = useRouter();
  const store = useMoneyStore();
  const i18n = useI18n();
  const { today } = useClock();
  const currency = useHomeCurrency();

  const [step, setStep] = useState(startStep);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [income, setIncome] = useState<number>(() => startingIncome(currency));
  // Money in's gesture guide plays the first time through, until the wheels are touched.
  const [wheelGuide, setWheelGuide] = useState(true);
  const [payday, setPaydayState] = useState<Payday>({ kind: 'sameDay', day: START.payday });
  // "How does money reach you?": the answers picked, each follow-up's own, and the page shown.
  const [ways, setWays] = useState<readonly MoneyWay[]>([]);
  const [payAmount, setPayAmount] = useState<number>(() => startingPay(currency));
  const [every, setEvery] = useState<PayEvery>('weekly');
  const [weekday, setWeekday] = useState<MoneyWaysAnswers['weekday']>(4);
  const [fortnightAfter, setFortnightAfter] = useState(false);
  const [twiceDays, setTwiceDays] = useState<MoneyWaysAnswers['twiceDays']>([15, 'last']);
  const [lastFor, setLastFor] = useState<LastFor>({ kind: 'monthEnd' });
  const [moneyPage, setMoneyPage] = useState(0);
  const [percent, setPercent] = useState<number>(START.percent);
  // Money that only lands sets Future you as an amount a month, in the slider's steps.
  const [landedSteps, setLandedSteps] = useState<number>(() => landedFutureStartSteps(currency));
  const [answers, setAnswers] = useState<BillAnswers>(NO_BILL_ANSWERS);
  const [nav, setNav] = useState<DeckNav>(DECK_START);
  const [wallets, setWallets] = useState<readonly string[]>([]);
  // Pay with's second beat, for someone who sells: which of the banks just chosen is for work.
  const [payPage, setPayPage] = useState<'banks' | 'work'>('banks');
  const [workBanks, setWorkBanks] = useState<Readonly<Record<string, BankWork>>>({});
  const [closeAt, setCloseAt] = useState(DEFAULT_CLOSE_AT);
  const [reminders, setReminders] = useState<boolean | null>(null);
  const [spentSincePayday, setSpentSincePayday] = useState<number | null>(null);
  const [futureYouAtPayday, setFutureYouAtPayday] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);
  // A currency picked on the way: every amount answered so far was in the old one, so they start
  // again where the design starts them.
  const [countedIn, setCountedIn] = useState(currency.code);
  if (countedIn !== currency.code) {
    setCountedIn(currency.code);
    setIncome(startingIncome(currency));
    setPayAmount(startingPay(currency));
    setLandedSteps(landedFutureStartSteps(currency));
    setAnswers(NO_BILL_ANSWERS);
    setNav(DECK_START);
    setSpentSincePayday(null);
  }

  const deck = dealDeck(answers);
  const bills = chosenBills(deck, answers);
  const billSum = billTotal(bills);
  const reach: MoneyWaysAnswers = {
    ways,
    income,
    payday,
    payAmount,
    every,
    weekday,
    fortnightAfter,
    twiceDays,
    lastFor,
  };
  const pages = moneyPages(reach);
  const sells = ways.includes('sell');
  const banksForWork = startingBankWork(wallets, workBanks);
  const page = pages[Math.min(moneyPage, pages.length - 1)] ?? 'ways';
  // Only a salary on a payday it knows is the plan as it always was; anything else holds incomes.
  const made = planOfAnswers(reach, today);
  const incomes = made.incomes?.incomes ?? null;
  const lastUntil = made.incomes?.lastUntil ?? null;
  const monthIncome = made.income;
  const planPayday = made.payday;
  // Nothing counted on: Future you is an amount a month, set aside from landings after the bills.
  const landed = incomes !== null && leadIncome(incomes) === null;
  const futureYou = futureYouOfAnswers({ landed, monthIncome, percent, landedSteps }, currency);
  const firstOfIncomes =
    incomes === null
      ? null
      : firstDayOfIncomes(
          { incomes, anchor: planPayday, lastUntil, bills, futureYou },
          today,
          currency,
        );
  const first =
    firstOfIncomes ??
    firstDay(
      { income, payday, bills: billSum, futureYou, spentSincePayday, futureYouAtPayday },
      today,
      currency,
    );
  const dailyHint = firstDay({ income, payday, bills: 0, futureYou: 0 }, today, currency).line;
  // History brought in from another app stands in for the estimate: its real spending since
  // payday (M2a), read again whenever onboarding comes back from the bring-in.
  const joinedSince = first.joined ? first.since : null;
  useFocusEffect(
    useCallback(() => {
      if (joinedSince === null) return;
      void importedSpentBetween(store, joinedSince, today).then((spent) => {
        if (spent > 0) setSpentSincePayday(spent);
      });
    }, [joinedSince, store, today]),
  );

  /** Ends onboarding and opens Home; `then` is a sheet to open over it once it has. */
  const finish = async (then?: Href) => {
    if (busy.current) return;
    busy.current = true;
    setLeaving(true);
    haptics.tap();
    const shown = new Promise((resolve) => setTimeout(resolve, LEAVE_MS));
    try {
      await completeOnboarding(
        store,
        {
          income: monthIncome,
          payday: planPayday,
          futureYou,
          bills: bills.map((b) => ({
            name: billName(i18n, b.card, b.option),
            icon: b.icon,
            hue: b.hue,
            amount: b.amount,
            dueDay: b.dueDay,
            kind: b.kind,
            ...(b.monthsLeft === undefined ? {} : { monthsLeft: b.monthsLeft }),
          })),
          wallets,
          closeAt,
          spentSincePayday: first.joined ? spentSincePayday : null,
          futureYouAtPayday: first.futureYouSkipped,
          ...(made.incomes === null
            ? {}
            : {
                incomes: {
                  ...made.incomes,
                  ...(made.incomes.work ? { workBanks: banksForWork } : {}),
                },
              }),
        },
        { today, language: i18n.language },
      );
    } catch {
      // Nothing was committed: the overlay lifts and "Open 6pm" can be tried again.
      busy.current = false;
      setLeaving(false);
      return;
    }
    // The month is set up either way; a reminder iOS refuses to schedule must not undo that.
    if (reminders) await scheduleCloseReminder(i18n.language, closeAt).catch(() => undefined);
    await shown;
    router.replace('/');
    if (then) router.push(then);
  };

  /**
   * Turns to another page or step in `toward`. A money page leaves sideways the way it was last
   * drawn, so when the way turns round it is drawn once more facing it before it goes.
   */
  const turn = (toward: 1 | -1, apply: () => void) => {
    if (toward === direction || (step !== MONEY_IN_STEP && step !== PAY_WITH_STEP)) {
      setDirection(toward);
      apply();
      return;
    }
    setDirection(toward);
    requestAnimationFrame(apply);
  };

  const go = (target: number) => {
    if (target > LAST_STEP) {
      void finish();
      return;
    }
    let next = Math.max(0, target);
    while (LEFT_OUT.includes(next)) next += target >= step ? 1 : -1;
    haptics.tap();
    turn(next >= step ? 1 : -1, () => {
      if (step === 1 && next !== 1) setWheelGuide(false);
      // Coming back into the money step lands on its last follow-up; going forward, on the question.
      if (next === MONEY_IN_STEP) setMoneyPage(next < step ? pages.length - 1 : 0);
      if (next === PAY_WITH_STEP) setPayPage(next < step && sells ? 'work' : 'banks');
      // Coming back to the deck shows its top card without replaying the last fling.
      if (next === BILLS_STEP) setNav((n) => ({ ...n, from: null }));
      setStep(next);
    });
  };

  const next = async () => {
    if (step === MONEY_IN_STEP) {
      // The question needs an answer; then each follow-up comes in turn, sliding in from the right.
      if (page === 'ways' && ways.length === 0) return;
      const at = pages.indexOf(page);
      if (at < pages.length - 1) {
        haptics.tap();
        turn(1, () => setMoneyPage(at + 1));
        return;
      }
    }
    // Someone who sells answers which of the banks they just chose is for work.
    if (step === PAY_WITH_STEP && sells && payPage === 'banks') {
      haptics.tap();
      turn(1, () => setPayPage('work'));
      return;
    }
    if (step === CLOSE_STEP && reminders === null) {
      haptics.tap();
      const granted = await askForReminders().catch(() => false);
      setReminders(granted);
      go(step + 1);
      return;
    }
    go(step + 1);
  };

  return {
    step,
    direction,
    reach,
    page,
    moneyPage: pages.indexOf(page),
    monthIncome,
    planPayday,
    firstOfIncomes,
    lastsTo: lastsTo(lastFor, today, planPayday, incomes ?? []),
    toggleWay: (way: MoneyWay) => setWays((w) => toggleWay(w, way)),
    setPayAmount,
    setEvery,
    setWeekday,
    setFortnightAfter,
    setTwiceDays,
    setLastFor,
    currency,
    leaving,
    today,
    income,
    payday,
    wheelGuide,
    percent,
    /** Nothing is counted on: the Future you step asks for an amount a month. */
    landed,
    landedSteps,
    setLandedSteps,
    answers,
    nav,
    deck,
    bills,
    billSum,
    futureYou,
    /** What each usual pay sets aside for Future you, as Today's Pots line says it. */
    futureYouEachPay: perPayOf(futureYou, incomes ?? undefined, currency),
    first,
    dailyHint,
    wallets,
    payPage,
    workBanks: banksForWork,
    answerWorkBank: (code: string, answer: BankWork) =>
      setWorkBanks((was) => ({ ...startingBankWork(wallets, was), [code]: answer })),
    closeAt,
    reminders,
    go,
    next: () => void next(),
    /** "I got paid" on the last step: Home, then Quick add on its money-in face. */
    finishThenGotPaid: () => void finish(GOT_PAID),
    back: () => {
      if (step === PAY_WITH_STEP && payPage === 'work') {
        haptics.tap();
        turn(-1, () => setPayPage('banks'));
        return;
      }
      const at = pages.indexOf(page);
      if (step === MONEY_IN_STEP && at > 0) {
        haptics.tap();
        turn(-1, () => setMoneyPage(at - 1));
        return;
      }
      go(step - 1);
    },
    skip: () => go(step + 1),
    setIncome,
    // The strip ticks as each day passes, so a new kind of payday needs no haptic of its own.
    setPayday: setPaydayState,
    endWheelGuide: () => setWheelGuide(false),
    setPercent,
    setAnswers,
    billGo: (index: number, dir: 1 | -1) => {
      haptics.tap();
      setNav((n) => ({ index, from: n.index, direction: dir, moves: n.moves + 1 }));
    },
    toggleWallet: (id: string) => {
      haptics.tap();
      setWallets((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    },
    setCloseAt,
    setSpentSincePayday,
    setFutureYouAtPayday: (on: boolean) => {
      haptics.tap();
      setFutureYouAtPayday(on);
    },
  };
}

export type Onboarding = ReturnType<typeof useOnboarding>;

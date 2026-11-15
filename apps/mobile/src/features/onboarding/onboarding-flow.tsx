import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { writeFirstCatch } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import { useI18n, type I18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import type { CompanionMood } from '../../ui/companion/companion-mood';
import { useDesignInsets } from '../../ui/layout/design-insets';
import type { AiMode } from '../privacy/ai-mode';
import { useAiMode } from '../privacy/use-ai-mode';
import { useAlertAccess } from '../capture-guide/alert-access';
import { useCaptureHealth } from '../capture-guide/use-capture-health';
import { nativeReach } from '../surfaces/native-reach';
import {
  catchWaysFor,
  listenWaysOf,
  readyWays,
  setupCardsOf,
  type CatchWay,
  type ListenWay,
} from './catch-ways';
import { ownBankOf, tryWay } from './first-catch-try';
import { CompanionLine, OnboardingCta, OnboardingHeader } from './onboarding-chrome';
import { pageExiting, stepEntering } from './onboarding-motion';
import { LANDED_FUTURE_STEPS, landedFutureStep } from './onboarding-maths';
import { onboardingPalette } from './onboarding-palette';
import { OnboardingSky } from './onboarding-sky';
import { StepBills } from './step-bills';
import { StepAi } from './step-ai';
import { StepCatching } from './step-catching';
import { StepCloseTime } from './step-close-time';
import { StepFirstLanded } from './step-first-landed';
import { LeavingOverlay, StepFirstNumber } from './step-first-number';
import { StepFutureYou } from './step-future-you';
import { StepAsItComes } from './step-as-it-comes';
import { StepEachPay } from './step-each-pay';
import { StepMoneyIn } from './step-money-in';
import { StepMoneyWays } from './step-money-ways';
import { ordinalDay } from './step-parts';
import { StepPayWith } from './step-pay-with';
import { StepPrivacy } from './step-privacy';
import { StepWelcome } from './step-welcome';
import { StepWorkBanks } from './step-work-banks';
import { billName } from './bill-copy';
import { useFirstCatch } from './use-first-catch';
import {
  AI_STEP,
  BILLS_STEP,
  CATCH_STEP,
  CLOSE_STEP,
  FUTURE_STEP,
  LAST_STEP,
  MONEY_IN_STEP,
  PAY_WITH_STEP,
  PRIVACY_STEP,
  useOnboarding,
  WELCOME_STEP,
  type Onboarding,
} from './use-onboarding';

/**
 * The companion's line for the step, from what has been answered so far. The welcome and the
 * privacy promise have none: the companion is already the picture on both.
 */
function stepLine(o: Onboarding, i18n: I18n, mode: AiMode): string | null {
  const { t } = i18n;
  switch (o.step) {
    case MONEY_IN_STEP:
      return moneyLine(o, i18n);
    case BILLS_STEP:
      return o.nav.index >= o.deck.length
        ? t('onboarding.line.billsDone')
        : o.bills.length
          ? t('onboarding.line.billsSoFar', { count: o.bills.length })
          : t('onboarding.line.billsStart');
    case FUTURE_STEP:
      return o.percent === 0
        ? t('onboarding.line.futureNone')
        : o.percent >= 20
          ? t('onboarding.line.futureBig')
          : t('onboarding.line.future');
    case PAY_WITH_STEP:
      if (o.payPage === 'work') return t('work.banks.line');
      return o.wallets.length === 0
        ? t('onboarding.line.walletsNone')
        : t('onboarding.line.wallets', { count: o.wallets.length });
    case AI_STEP:
      return t(mode === 'device' ? 'onboarding.line.aiDevice' : 'onboarding.line.aiServer');
    case CATCH_STEP: {
      const ways = catchWaysFor(o.currency, mode, nativeReach);
      return t('onboarding.line.catch', { count: readyWays(ways), total: ways.length });
    }
    case CLOSE_STEP:
      return t('onboarding.line.close', { time: o.closeAt });
    default:
      return null;
  }
}

/** The money step's line, page by page: the picks counted, then each follow-up's answer. */
function moneyLine(o: Onboarding, i18n: I18n): string {
  const { t } = i18n;
  switch (o.page) {
    case 'ways':
      return t(`onboarding.line.reach${Math.min(4, o.reach.ways.length) as 0 | 1 | 2 | 3 | 4}`);
    case 'pay':
      return o.reach.every === 'twiceMonthly'
        ? t('onboarding.line.payTwice')
        : t(`onboarding.line.payDay${o.reach.weekday}`);
    case 'asItComes':
      return t('onboarding.line.landed');
    case 'salary':
      return o.payday.kind === 'varies'
        ? t('onboarding.line.paydayVaries')
        : o.payday.kind === 'lastDay'
          ? t('onboarding.line.paydayLast')
          : t('onboarding.line.paydayDay', { day: ordinalDay(i18n, o.payday.day) });
  }
}

function stepMood(o: Onboarding): CompanionMood {
  if (o.step === MONEY_IN_STEP) return 'think';
  if (o.step === FUTURE_STEP && o.percent >= 20) return 'happy';
  return o.step === LAST_STEP ? 'happy' : 'calm';
}

function ctaFor(o: Onboarding, { t }: I18n) {
  if (o.step === LAST_STEP)
    return { label: t('onboarding.reveal.open'), icon: 'arrow_forward' } as const;
  if (o.step === CLOSE_STEP && o.reminders === null) {
    return {
      label: t('onboarding.close.remind', { time: o.closeAt }),
      icon: 'notifications',
    } as const;
  }
  if (o.step === BILLS_STEP && o.nav.index < o.deck.length) {
    const label = o.bills.length ? t('onboarding.bills.allDone') : t('onboarding.bills.skipAll');
    return { label, icon: 'arrow_forward' } as const;
  }
  return { label: t('onboarding.continue'), icon: 'arrow_forward' } as const;
}

/**
 * Onboarding: from morning to dusk, the welcome and the privacy promise, then the steps that set up
 * the month (money in, payday, bills, Future you, banks, where AI runs, catching, close time),
 * ending on the first real number.
 */
export function OnboardingFlow({ startStep = 0 }: { readonly startStep?: number }) {
  const o = useOnboarding(startStep);
  const i18n = useI18n();
  const money = useMoneyFormat();
  const reduceMotion = useReducedMotion();
  const { top, bottom, insets } = useDesignInsets();
  const pal = onboardingPalette(o.step);
  const aiMode = useAiMode();
  const line = stepLine(o, i18n, aiMode);
  const cta = ctaFor(o, i18n);
  const store = useMoneyStore();
  const alertAccess = useAlertAccess();

  // The first catch: once a way is set up the catching step waits for one, live, from the moment
  // the step first opened (a receipt shared while a set-up sheet was open counts).
  const onCatchStep = o.step === CATCH_STEP;
  const since = useRef<string | null>(null);
  if (onCatchStep && since.current === null) since.current = new Date().toISOString();
  const [listening, setListening] = useState(false);
  const [setUp, setSetUp] = useState<readonly CatchWay[]>([]);
  const [walked, setWalked] = useState<ListenWay | null>(null);
  const catchWays = catchWaysFor(o.currency, aiMode, nativeReach);
  // A way that catches by itself counts as set up once walked here, once Android's access is on,
  // or once it has caught something (an automation set up before), as Settings' heartbeat says.
  const health = useCaptureHealth();
  const ranBefore = health
    .filter((row) => row.state.kind === 'caught' || row.state.kind === 'quiet')
    .map((row) => row.way)
    .filter((way): way is 'alerts' | 'wallet' => way === 'alerts' || way === 'wallet');
  const listenWays = listenWaysOf(catchWays, [
    ...setUp,
    ...ranBefore,
    ...(alertAccess === true ? (['alerts'] as const) : []),
  ]);
  const setupWays = setupCardsOf(catchWays, listenWays, alertAccess, nativeReach.alertListener);
  const listen = useFirstCatch(onCatchStep && listening, since.current ?? '');
  const waiting = onCatchStep && listening;
  useEffect(() => {
    if (!onCatchStep) setListening(false);
  }, [onCatchStep]);
  // Android's Notification access turned on from this step: its alerts are set up.
  const hadAccess = useRef(alertAccess);
  useEffect(() => {
    if (onCatchStep && hadAccess.current === false && alertAccess === true) {
      setWalked('alerts');
      setListening(true);
    }
    hadAccess.current = alertAccess;
  }, [alertAccess, onCatchStep]);
  const later = () => {
    // "Later" always moves on; Today picks it up the next morning.
    void writeFirstCatch(store.db, {
      state: 'later',
      day: o.today,
      at: new Date().toISOString(),
      ways: [...setUp],
    }).catch(() => undefined);
    o.next();
  };

  const body = (() => {
    switch (o.step) {
      case WELCOME_STEP:
        return <StepWelcome pal={pal} onStart={() => o.go(PRIVACY_STEP)} />;
      case PRIVACY_STEP:
        return <StepPrivacy pal={pal} onNext={o.next} />;
      case MONEY_IN_STEP:
        switch (o.page) {
          case 'ways':
            return <StepMoneyWays pal={pal} ways={o.reach.ways} onToggle={o.toggleWay} />;
          case 'pay':
            return (
              <StepEachPay
                pal={pal}
                answers={o.reach}
                today={o.today}
                onAmount={o.setPayAmount}
                onEvery={o.setEvery}
                onWeekday={o.setWeekday}
                onFortnightAfter={o.setFortnightAfter}
                onTwiceDays={o.setTwiceDays}
              />
            );
          case 'asItComes':
            return (
              <StepAsItComes
                pal={pal}
                lastFor={o.reach.lastFor}
                today={o.today}
                lastsTo={o.lastsTo}
                onLastFor={o.setLastFor}
              />
            );
          case 'salary':
            return (
              <StepMoneyIn
                pal={pal}
                income={o.income}
                payday={o.payday}
                dailyHint={o.dailyHint}
                guide={o.wheelGuide}
                onIncome={o.setIncome}
                onPayday={o.setPayday}
                onGuideDone={o.endWheelGuide}
              />
            );
        }
        return null;
      case BILLS_STEP:
        return (
          <StepBills
            pal={pal}
            deck={o.deck}
            bills={o.bills}
            answers={o.answers}
            nav={o.nav}
            onAnswers={o.setAnswers}
            onGo={o.billGo}
          />
        );
      case FUTURE_STEP:
        return (
          <StepFutureYou
            pal={pal}
            percent={o.percent}
            amount={o.futureYouEachPay}
            free={o.monthIncome - o.billSum - o.futureYou}
            // Money that only lands has no daily number until it does.
            {...(o.firstOfIncomes?.landed ? {} : { line: o.first.line })}
            onPercent={o.setPercent}
            landed={
              o.landed
                ? {
                    steps: o.landedSteps,
                    most: LANDED_FUTURE_STEPS,
                    fullAt: LANDED_FUTURE_STEPS / 2,
                    amount: o.futureYou,
                    step: landedFutureStep(o.currency),
                    onSteps: o.setLandedSteps,
                  }
                : undefined
            }
          />
        );
      case PAY_WITH_STEP:
        return o.payPage === 'work' ? (
          <StepWorkBanks pal={pal} banks={o.workBanks} onAnswer={o.answerWorkBank} />
        ) : (
          <StepPayWith pal={pal} wallets={o.wallets} onToggle={o.toggleWallet} />
        );
      case AI_STEP:
        return <StepAi pal={pal} />;
      case CATCH_STEP:
        return (
          <StepCatching
            pal={pal}
            date={`${i18n.weekday(new Date())} ${i18n.dayMonth(new Date())}`}
            closeAt={o.closeAt}
            safe={money.short(o.first.line)}
            listening={listening}
            listen={listen}
            listenWays={listenWays}
            setupWays={setupWays}
            walked={walked}
            bankId={ownBankOf(o.wallets)}
            onWalked={(way) => {
              setSetUp((ways) => (ways.includes(way) ? ways : [...ways, way]));
              if (way === 'alerts' || way === 'wallet') setWalked(way);
            }}
            onListen={() => setListening(true)}
            onTry={(way) => {
              setWalked(way);
              tryWay(way, ownBankOf(o.wallets));
            }}
            onLater={later}
            onContinue={o.next}
          />
        );
      case CLOSE_STEP:
        return <StepCloseTime pal={pal} closeAt={o.closeAt} onCloseAt={o.setCloseAt} />;
      default:
        // Money that only lands opens on Today as it will be: no number made from a guess.
        if (o.firstOfIncomes?.landed) {
          const due = o.firstOfIncomes.firstDue;
          const bill = due === null ? undefined : o.bills[due.index];
          return (
            <StepFirstLanded
              pal={pal}
              billsStillNeed={o.firstOfIncomes.billsStillNeed}
              firstDue={
                due && bill ? { name: billName(i18n, bill.card, bill.option), due: due.due } : null
              }
              closeAt={o.closeAt}
              reminded={o.reminders !== false}
              onGotPaid={o.finishThenGotPaid}
            />
          );
        }
        return (
          <StepFirstNumber
            pal={pal}
            income={o.monthIncome}
            incomes={o.firstOfIncomes?.pay ? { pay: o.firstOfIncomes.pay } : null}
            bills={o.billSum}
            futureYou={o.futureYou}
            first={o.first}
            closeAt={o.closeAt}
            reminded={o.reminders !== false}
            leaving={o.leaving}
            onSpentSincePayday={o.setSpentSincePayday}
            onFutureYouAtPayday={o.setFutureYouAtPayday}
          />
        );
    }
  })();

  // The money step and Pay with have pages of their own, which slide like steps.
  const paged =
    o.step === MONEY_IN_STEP || (o.step === PAY_WITH_STEP && o.reach.ways.includes('sell'));
  // The welcome rises and the reveal fades in on their own; every other step slides in.
  const ownEntrance = o.step === WELCOME_STEP || o.step === LAST_STEP;
  // The welcome and the privacy promise carry their own button, and so does the wait for a catch.
  const ownButton = o.step === WELCOME_STEP || o.step === PRIVACY_STEP || waiting;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={pal.dark ? 'light' : 'dark'} animated />
      <OnboardingSky step={o.step} safeTop={insets.top} />
      <View
        style={{
          flex: 1,
          paddingTop: top(60),
          paddingHorizontal: 20,
          paddingBottom: bottom(30),
        }}
      >
        <OnboardingHeader
          step={o.step}
          pal={pal}
          showSkip={o.step >= BILLS_STEP && o.step <= AI_STEP}
          onBack={waiting ? () => setListening(false) : o.back}
          onSkip={o.skip}
          ahead={waiting && listen.caught ? 1 : 0}
        />
        {line !== null && !waiting ? (
          <CompanionLine
            step={o.step}
            line={line}
            mood={stepMood(o)}
            pal={pal}
            top={top(112)}
            {...(o.step === MONEY_IN_STEP
              ? { page: o.page }
              : o.step === PAY_WITH_STEP && o.payPage === 'work'
                ? { page: o.payPage }
                : {})}
          />
        ) : null}
        <Animated.View
          // The money step's follow-ups slide in like steps, without a progress segment of their own.
          key={
            o.step === MONEY_IN_STEP
              ? `${o.step}:${o.page}`
              : o.step === PAY_WITH_STEP
                ? `${o.step}:${o.payPage}`
                : o.step
          }
          {...(ownEntrance ? {} : { entering: stepEntering(o.direction, reduceMotion) })}
          // The money step's pages leave sideways as the next one slides in.
          {...(paged ? { exiting: pageExiting(o.direction, reduceMotion) } : {})}
          style={{ flex: 1, minHeight: 0 }}
        >
          {body}
        </Animated.View>
        {ownButton ? null : (
          <OnboardingCta
            label={cta.label}
            icon={cta.icon}
            hot={o.step === LAST_STEP}
            pal={pal}
            dim={o.step === MONEY_IN_STEP && o.page === 'ways' && o.reach.ways.length === 0}
            onPress={
              onCatchStep && (listenWays.length > 0 || setupWays.length > 0)
                ? () => setListening(true)
                : o.next
            }
          />
        )}
      </View>
      {o.leaving ? (
        <LeavingOverlay
          step={o.step}
          line={o.first.line}
          pal={pal}
          words={o.firstOfIncomes?.landed ? i18n.t('income.today.nothingLanded') : null}
        />
      ) : null}
    </View>
  );
}

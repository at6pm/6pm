import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { payCycleOn, type LocalDate, type Payday } from '@6pm/domain';

import { answerReach } from '../../data/income-plan-actions';
import { dayOf } from '../../data/money-store';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import type { PlanSettings } from '../../data/plan-settings';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency, useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { useTheme } from '../../ui/theme/theme';
import { PressScale } from '../../ui/primitives/press-scale';
import { body, display } from '../../ui/type/fonts';
import { useRunAction } from '../companion/use-run-action';
import {
  answersOfPlan,
  lastsTo,
  moneyPages,
  planOfAnswers,
  startingWays,
  toggleWay,
  type LastFor,
  type MoneyWay,
  type MoneyWaysAnswers,
  type PayEvery,
} from './money-ways';
import { OnboardingCta } from './onboarding-chrome';
import { startingPay } from './onboarding-maths';
import { pageExiting, stepEntering } from './onboarding-motion';
import { reachPaletteOf } from './reach-palette';
import { onboardingPalette } from './onboarding-palette';
import { OnboardingSky } from './onboarding-sky';
import { StepAsItComes } from './step-as-it-comes';
import { StepEachPay } from './step-each-pay';
import { StepMoneyIn } from './step-money-in';
import { StepMoneyWays } from './step-money-ways';
import { Card, StepHeading } from './step-parts';
import { MONEY_IN_STEP } from './use-onboarding';

/** Where the question was opened from, as the route says (`?from=`). */
export type ReachFrom =
  /** The card on Today, for someone counting on "It varies": nothing picked. */
  | 'today'
  /** Plan's edit: the plan's own answers ticked, each follow-up on its saved values. */
  | 'plan'
  /** "It varies" picked as the payday on Plan's month sheet: the salary ticked, its day varying. */
  | 'varies';

/**
 * "How does money reach you?" asked again: from the card on Today (nothing picked), from Plan's
 * edit (the answers the plan stands on ticked, in the look's own inks), or from "It varies" on
 * Plan's month sheet. Its follow-ups, then the number now and from today. Nothing changes until
 * they switch, and then it is saved as onboarding saves it (`answerReach`).
 */
export function ReachFlow({
  from = 'today',
  income: offered,
}: {
  readonly from?: ReachFrom;
  /** For `varies`: the month's income the sheet had. */
  readonly income?: number;
}) {
  const router = useRouter();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const currency = useHomeCurrency();
  const snap = useMoney();
  const store = useMoneyStore();
  const run = useRunAction();
  const reduceMotion = useReducedMotion();
  const { top, bottom, insets } = useDesignInsets();
  const { palette } = useTheme();
  const inLook = from === 'plan';
  const pal = inLook ? reachPaletteOf(palette) : onboardingPalette(MONEY_IN_STEP);
  const plan = snap.plan;
  const [first] = useState(() =>
    firstAnswers(from, plan, snap.today, startingPay(currency), offered),
  );
  const [ways, setWays] = useState<readonly MoneyWay[]>(first.ways);
  const [income, setIncome] = useState(first.income);
  const [payday, setPayday] = useState<Payday>(first.payday);
  const [payAmount, setPayAmount] = useState(first.payAmount);
  const [every, setEvery] = useState<PayEvery>(first.every);
  const [weekday, setWeekday] = useState<MoneyWaysAnswers['weekday']>(first.weekday);
  const [fortnightAfter, setFortnightAfter] = useState(first.fortnightAfter);
  const [twiceDays, setTwiceDays] = useState<MoneyWaysAnswers['twiceDays']>(first.twiceDays);
  const [lastFor, setLastFor] = useState<LastFor>(first.lastFor);
  const [at, setAt] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const busy = useRef(false);
  const answers: MoneyWaysAnswers = {
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
  const pages = [...moneyPages(answers), 'compare' as const];
  const page = pages[Math.min(at, pages.length - 1)] ?? 'ways';
  const made = planOfAnswers(answers, snap.today);
  const incomes = made.incomes?.incomes ?? [];
  const before = dayOf(snap)?.line ?? 0;
  const after =
    plan === null || made.incomes === null
      ? null
      : (dayOf({
          ...snap,
          cycle: payCycleOn(snap.today, made.payday),
          plan: {
            ...plan,
            payday: made.payday,
            incomes: [...made.incomes.incomes],
            lastUntil: made.incomes.lastUntil,
          },
        })?.line ?? 0);

  // The page leaving goes the way it was last drawn: when the way turns round it is drawn once
  // more facing it before the next page comes.
  const turn = (to: number) => {
    haptics.tap();
    const toward = to > at ? 1 : -1;
    setDirection(toward);
    if (toward === direction) setAt(to);
    else requestAnimationFrame(() => setAt(to));
  };
  const save = async () => {
    if (busy.current || plan === null) return;
    busy.current = true;
    const saved = await run(() => answerReach(store, made));
    if (!saved) {
      busy.current = false;
      return;
    }
    haptics.success();
    router.back();
  };
  const next = () => {
    if (page === 'ways' && ways.length === 0) return;
    // A salary on a day it knows is the plan as it always was: no number to compare.
    if (page !== 'compare' && at === pages.length - 2 && made.incomes === null) {
      void save();
      return;
    }
    if (page === 'compare') {
      void save();
      return;
    }
    turn(at + 1);
  };

  const content = (() => {
    switch (page) {
      case 'ways':
        return (
          <StepMoneyWays pal={pal} ways={ways} onToggle={(w) => setWays((x) => toggleWay(x, w))} />
        );
      case 'salary':
        return (
          <StepMoneyIn
            pal={pal}
            income={income}
            payday={payday}
            dailyHint={0}
            guide={false}
            onIncome={setIncome}
            onPayday={setPayday}
            onGuideDone={() => undefined}
          />
        );
      case 'pay':
        return (
          <StepEachPay
            pal={pal}
            answers={answers}
            today={snap.today}
            onAmount={setPayAmount}
            onEvery={setEvery}
            onWeekday={setWeekday}
            onFortnightAfter={setFortnightAfter}
            onTwiceDays={setTwiceDays}
          />
        );
      case 'asItComes':
        return (
          <StepAsItComes
            pal={pal}
            lastFor={lastFor}
            today={snap.today}
            lastsTo={lastsTo(lastFor, snap.today, plan?.payday ?? made.payday, incomes)}
            onLastFor={setLastFor}
          />
        );
      case 'compare':
        return (
          <View style={{ gap: 14 }}>
            <StepHeading title={t('income.ask.title')} sub={t('income.ask.sub')} pal={pal} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: t('income.ask.now'), line: before },
                { label: t('income.ask.after'), line: after },
              ].map((side) => (
                <Card key={side.label} pal={pal} style={{ flex: 1, padding: 16, gap: 6 }}>
                  <Text style={{ ...body(13, 600), color: pal.inkSoft }}>{side.label}</Text>
                  <Text style={{ ...display(26, 500, -0.02), color: pal.ink }}>
                    {side.line === null || side.line <= 0
                      ? t('income.ask.nothingYet')
                      : t('income.ask.perDay', { amount: money.short(side.line) })}
                  </Text>
                </Card>
              ))}
            </View>
            <PressScale
              accessibilityRole="button"
              onPress={() => router.back()}
              style={{ alignSelf: 'center', paddingVertical: 10 }}
            >
              <Text style={{ ...body(15, 600), color: pal.inkSoft }}>{t('income.ask.keep')}</Text>
            </PressScale>
          </View>
        );
    }
  })();

  return (
    <View style={{ flex: 1, ...(inLook ? { experimental_backgroundImage: palette.skyDeep } : {}) }}>
      {inLook ? null : <OnboardingSky step={MONEY_IN_STEP} safeTop={insets.top} />}
      <View
        style={{ flex: 1, paddingTop: top(60), paddingHorizontal: 20, paddingBottom: bottom(30) }}
      >
        <PressScale
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.back')}
          onPress={() => (at === 0 ? router.back() : turn(at - 1))}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: pal.cell,
            boxShadow: pal.cardShadow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name={at === 0 ? 'close' : 'arrow_back'} size={22} color={pal.ink} />
        </PressScale>
        <Animated.View
          key={page}
          entering={stepEntering(direction, reduceMotion)}
          exiting={pageExiting(direction, reduceMotion)}
          style={{ flex: 1, minHeight: 0, paddingTop: 16 }}
        >
          {content}
        </Animated.View>
        <OnboardingCta
          label={page === 'compare' ? t('income.ask.switch') : t('onboarding.continue')}
          icon="arrow_forward"
          hot={page === 'compare'}
          pal={pal}
          dim={page === 'ways' && ways.length === 0}
          onPress={next}
        />
      </View>
    </View>
  );
}

/** The answers the question opens on, by where it was opened from. */
function firstAnswers(
  from: ReachFrom,
  plan: PlanSettings | null,
  today: LocalDate,
  pay: number,
  offered: number | undefined,
): MoneyWaysAnswers {
  const start = startingWays(plan?.income ?? 0, pay);
  if (plan === null) return start;
  switch (from) {
    case 'today':
      return start;
    case 'plan':
      return answersOfPlan(plan, today, start);
    case 'varies':
      return {
        ...start,
        ways: ['salary'],
        income: offered ?? plan.income,
        payday: { kind: 'varies' },
      };
  }
}

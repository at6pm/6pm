import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import type { LocalDate } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useI18n, type I18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { IncomeWheels } from './money-in-controls';
import { fortnightAnchor, nextWeekday, type MoneyWaysAnswers, type PayEvery } from './money-ways';
import { keypadInksOf, type OnboardingPalette } from './onboarding-palette';
import { Card, ordinalDay, StepHeading } from './step-parts';

const REACH_Y = { top: 12, bottom: 12 } as const;
/** The heading's one-line title and sub, plus the room a two-line companion line takes. */
const HEADING_MIN = 100;
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const DAY_WIDTHS: readonly number[] = WEEKDAYS.map(() => 64);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const EVERY: readonly PayEvery[] = ['weekly', 'everyTwoWeeks', 'twiceMonthly'];
/** The sheet curve the strips and the card's height follow as the rhythm changes. */
const SHEET = Easing.bezier(...curves.enter);
const RESIZE = LinearTransition.duration(300).easing(SHEET).reduceMotion(ReduceMotion.System);

const dateOf = (day: LocalDate) => new Date(`${day}T12:00:00`);

/**
 * Every week or two: what each pay brings on the wheels, how often, and its day; the last card
 * says the one thing that is new, that a month's usual pays carry its bills and one beyond them
 * goes to the days in hand.
 */
export function StepEachPay({
  pal,
  answers,
  today,
  onAmount,
  onEvery,
  onWeekday,
  onFortnightAfter,
  onTwiceDays,
}: {
  readonly pal: OnboardingPalette;
  readonly answers: MoneyWaysAnswers;
  readonly today: LocalDate;
  readonly onAmount: (amount: number) => void;
  readonly onEvery: (every: PayEvery) => void;
  readonly onWeekday: (weekday: MoneyWaysAnswers['weekday']) => void;
  readonly onFortnightAfter: (after: boolean) => void;
  readonly onTwiceDays: (days: MoneyWaysAnswers['twiceDays']) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const { every } = answers;
  // The wheels count in the plan's currency: one picked on the way gives them new steps.
  const money = useMoneyFormat();
  return (
    <View style={{ gap: 12 }}>
      {/* Tall enough that the companion clears the wheels under a line that wraps in two. */}
      <View style={{ minHeight: HEADING_MIN }}>
        <StepHeading title={t('onboarding.pay.title')} sub={t('onboarding.pay.sub')} pal={pal} />
      </View>
      <Card pal={pal} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <IncomeWheels
          key={money.currency.code}
          income={answers.payAmount}
          onIncome={onAmount}
          colours={pal}
          reachY={REACH_Y}
          keypadInks={keypadInksOf(pal)}
        />
      </Card>
      <Animated.View layout={RESIZE}>
        <Card pal={pal} style={{ paddingVertical: 12, paddingHorizontal: 12, gap: 10 }}>
          <EverySwitch every={every} pal={pal} onEvery={onEvery} />
          {every === 'twiceMonthly' ? (
            <Animated.View
              key="twice"
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              <TwiceDays days={answers.twiceDays} pal={pal} onDays={onTwiceDays} />
              <Caption pal={pal} text={twiceCaption(i18n, answers.twiceDays)} />
            </Animated.View>
          ) : (
            <Animated.View
              key="weekday"
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              <View style={{ marginHorizontal: -12 }}>
                <Strip
                  items={WEEKDAYS.map((d) => t(`onboarding.pay.day${d}`))}
                  widths={DAY_WIDTHS}
                  index={answers.weekday}
                  onChange={(k) => onWeekday(WEEKDAYS[k] ?? 4)}
                  ink={pal.ink}
                  band={pal.chipBg}
                  label={t('onboarding.pay.title')}
                  spoken={WEEKDAYS.map((d) => i18n.weekday(dateOf(nextWeekday(today, d))))}
                  size={22}
                />
              </View>
              {/* Every two weeks, the two coming dates take the caption's place. */}
              {every === 'everyTwoWeeks' ? (
                <FortnightStart
                  answers={answers}
                  today={today}
                  pal={pal}
                  onAfter={onFortnightAfter}
                />
              ) : (
                <Caption pal={pal} text={weekdayCaption(i18n, answers, today)} />
              )}
            </Animated.View>
          )}
        </Card>
      </Animated.View>
      <CarryCard every={every} pal={pal} />
    </View>
  );
}

function weekdayCaption(i18n: I18n, answers: MoneyWaysAnswers, today: LocalDate): string {
  const next = nextWeekday(today, answers.weekday);
  return i18n.t('onboarding.pay.everyWeekday', {
    weekday: i18n.weekday(dateOf(next)),
    date: i18n.weekdayDate(dateOf(next)),
  });
}

function twiceCaption(i18n: I18n, days: MoneyWaysAnswers['twiceDays']): string {
  const [first, second] = days;
  return second === 'last'
    ? i18n.t('onboarding.pay.twiceLast', { first: ordinalDay(i18n, first) })
    : i18n.t('onboarding.pay.twiceOn', {
        first: ordinalDay(i18n, first),
        second: ordinalDay(i18n, second),
      });
}

function Caption({ pal, text }: { readonly pal: OnboardingPalette; readonly text: string }) {
  return (
    <Text style={{ ...body(14, 550), lineHeight: 20, textAlign: 'center', color: pal.inkSoft }}>
      {text}
    </Text>
  );
}

/** Every week, every 2 weeks, twice a month: a segmented switch whose pill slides. */
function EverySwitch({
  every,
  pal,
  onEvery,
}: {
  readonly every: PayEvery;
  readonly pal: OnboardingPalette;
  readonly onEvery: (every: PayEvery) => void;
}) {
  const { t } = useI18n();
  const [width, setWidth] = useState(0);
  const at = EVERY.indexOf(every);
  const column = width / EVERY.length;
  const pill = useAnimatedStyle(() => ({
    width: column,
    opacity: column > 0 ? 1 : 0,
    transform: [{ translateX: withTiming(at * column, { duration: 300, easing: SHEET }) }],
  }));
  const labels: Readonly<Record<PayEvery, string>> = {
    weekly: t('onboarding.pay.weekly'),
    everyTwoWeeks: t('onboarding.pay.fortnightly'),
    twiceMonthly: t('onboarding.pay.twiceMonthly'),
  };
  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 6)}
      style={{ flexDirection: 'row', padding: 3, borderRadius: 14, backgroundColor: pal.chipBg }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            bottom: 3,
            left: 3,
            borderRadius: 11,
            backgroundColor: pal.segOn,
            boxShadow: pal.segShadow,
          },
          pill,
        ]}
      />
      {EVERY.map((kind) => (
        <PressScale
          key={kind}
          scaleTo={0.97}
          onPress={() => {
            if (kind === every) return;
            haptics.tick();
            onEvery(kind);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: kind === every }}
          style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            numberOfLines={1}
            style={{
              ...body(13.5, kind === every ? 650 : 550),
              color: kind === every ? pal.ink : pal.inkSoft,
            }}
          >
            {labels[kind]}
          </Text>
        </PressScale>
      ))}
    </View>
  );
}

/** Every two weeks: which coming weekday the rhythm starts from, this one or the one after. */
function FortnightStart({
  answers,
  today,
  pal,
  onAfter,
}: {
  readonly answers: MoneyWaysAnswers;
  readonly today: LocalDate;
  readonly pal: OnboardingPalette;
  readonly onAfter: (after: boolean) => void;
}) {
  const i18n = useI18n();
  const chip = (after: boolean) => {
    const day = fortnightAnchor(today, answers.weekday, after);
    const on = answers.fortnightAfter === after;
    const date = i18n.weekdayDate(dateOf(day));
    return (
      <PressScale
        key={String(after)}
        scaleTo={0.96}
        onPress={() => {
          haptics.tick();
          onAfter(after);
        }}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 99,
          borderWidth: 1.5,
          borderColor: on ? pal.accent : pal.track,
          backgroundColor: on ? pal.cell : pal.chipBg,
        }}
      >
        <Text style={{ ...body(13.5, 600), color: pal.ink }}>
          {after
            ? i18n.t('onboarding.pay.nextOne', { date })
            : i18n.t('onboarding.pay.thisOne', { date })}
        </Text>
      </PressScale>
    );
  };
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 4 }}>
      {chip(false)}
      {chip(true)}
    </View>
  );
}

/** Twice a month: a strip for each of the two days, the second one able to be the last day. */
function TwiceDays({
  days,
  pal,
  onDays,
}: {
  readonly days: MoneyWaysAnswers['twiceDays'];
  readonly pal: OnboardingPalette;
  readonly onDays: (days: MoneyWaysAnswers['twiceDays']) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const [first, second] = days;
  const lastDay = t('onboarding.payday.lastDay');
  const firstItems = DAYS.map(String);
  const secondItems = [...DAYS.map(String), lastDay];
  const widths = (count: number, word: boolean) =>
    Array.from({ length: count }, (_, i) => (word && i === count - 1 ? 120 : 48));
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ ...body(13, 600), color: pal.inkSoft, paddingLeft: 4 }}>
        {t('onboarding.pay.firstPay')}
      </Text>
      <View style={{ marginHorizontal: -12 }}>
        <Strip
          items={firstItems}
          widths={widths(firstItems.length, false)}
          index={first - 1}
          onChange={(k) => onDays([k + 1, second])}
          ink={pal.ink}
          band={pal.chipBg}
          label={t('onboarding.pay.firstPay')}
          spoken={DAYS.map((n) => ordinalDay(i18n, n))}
          size={22}
        />
      </View>
      <Text style={{ ...body(13, 600), color: pal.inkSoft, paddingLeft: 4 }}>
        {t('onboarding.pay.secondPay')}
      </Text>
      <View style={{ marginHorizontal: -12 }}>
        <Strip
          items={secondItems}
          widths={widths(secondItems.length, true)}
          index={second === 'last' ? 31 : second - 1}
          onChange={(k) => onDays([first, k >= 31 ? 'last' : k + 1])}
          ink={pal.ink}
          band={pal.chipBg}
          label={t('onboarding.pay.secondPay')}
          spoken={[...DAYS.map((n) => ordinalDay(i18n, n)), lastDay]}
          size={22}
        />
      </View>
    </View>
  );
}

/** A bar growing from the baseline, 60 ms after the one before it. */
function barEntering(index: number, reduceMotion: boolean) {
  if (reduceMotion) return FadeIn.duration(200);
  return new Keyframe({
    0: { opacity: 0, transform: [{ scaleY: 0 }] },
    100: { opacity: 1, transform: [{ scaleY: 1 }], easing: Easing.bezier(0.2, 0.9, 0.25, 1.1) },
  })
    .duration(380)
    .delay(index * 60)
    .reduceMotion(ReduceMotion.Never);
}

/**
 * The month's pays as bars: the usual ones solid, one beyond them drawn empty, and what that
 * means said beside them.
 */
function CarryCard({ every, pal }: { readonly every: PayEvery; readonly pal: OnboardingPalette }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const usual = every === 'weekly' ? 4 : 2;
  const extra = every !== 'twiceMonthly';
  const text =
    every === 'weekly'
      ? t('onboarding.pay.carryWeekly')
      : every === 'everyTwoWeeks'
        ? t('onboarding.pay.carryFortnight')
        : t('onboarding.pay.carryTwice');
  return (
    <Card
      pal={pal}
      style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 14 }}
    >
      <View
        key={every}
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 26 }}
      >
        {Array.from({ length: usual + (extra ? 1 : 0) }, (_, i) => (
          <Animated.View
            key={i}
            entering={barEntering(i, reduceMotion)}
            style={{
              width: 6,
              height: 26,
              borderRadius: 2,
              transformOrigin: 'bottom',
              ...(i < usual
                ? { backgroundColor: pal.ink }
                : { borderWidth: 1.5, borderStyle: 'dashed', borderColor: pal.ring }),
            }}
          />
        ))}
      </View>
      <Text style={{ flex: 1, ...body(14, 550), lineHeight: 19, color: pal.ink }}>{text}</Text>
    </Card>
  );
}

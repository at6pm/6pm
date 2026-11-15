import { useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { addDays, designAmount, workIncomeOf, type WorkMode } from '@6pm/domain';
import { curves, workInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { setWorkMode } from '../../data/work-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { EdgeSheetScroll, FittedSheet } from '../../ui/navigation/edge-sheet';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { useRunAction } from '../companion/use-run-action';
import { IncomeWheels } from '../onboarding/money-in-controls';

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const DAY_WIDTHS: readonly number[] = WEEKDAYS.map(() => 64);
/** The sheet grows on the sheet curve as Pay myself unfolds its wheel and its days. */
const RESIZE = LinearTransition.duration(300)
  .easing(Easing.bezier(...curves.enter))
  .reduceMotion(ReduceMotion.System);
/** A wage to start the wheel on, when there is none yet. */
const START_WAGE = 1_500_000;

/** The month each card draws: takings most days for "as it comes", a wage each week for the other. */
const MONTHS: Readonly<Record<WorkMode, readonly number[]>> = {
  asItComes: [
    13, 16, 13, 19, 16, 22, 0, 13, 16, 13, 19, 16, 22, 0, 13, 16, 19, 13, 16, 22, 0, 16, 13, 16, 19,
    16, 22, 0,
  ],
  payMyself: Array.from({ length: 28 }, (_, day) => (day % 7 === 4 ? 26 : 0)),
};

/**
 * How work pays you: "As it comes" (the default) or "Pay myself", two cards as onboarding's, only
 * one picked. Pay myself unfolds the wage's wheel and its weekday, and is kept as an income from
 * work that pays each week; switching counts from the next close.
 */
export function WorkMoneySheet() {
  const router = useRouter();
  const snap = useMoney();
  const store = useMoneyStore();
  const run = useRunAction();
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const wage = workIncomeOf(snap.plan?.incomes);
  const weeklyWage = wage?.rhythm.kind === 'weekly' && wage.amount > 0 ? wage : null;
  const [mode, setMode] = useState<WorkMode>(snap.plan?.work?.mode ?? 'asItComes');
  const [amount, setAmount] = useState(
    weeklyWage?.amount ?? designAmount(START_WAGE, money.currency),
  );
  const [weekday, setWeekday] = useState<Weekday>(
    weeklyWage?.rhythm.kind === 'weekly' ? weeklyWage.rhythm.weekday : 4,
  );
  const busy = useRef(false);
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    const ok = await run(() =>
      setWorkMode(store, mode, mode === 'payMyself' ? { amount, weekday } : null),
    );
    busy.current = false;
    if (!ok) return;
    haptics.success();
    router.back();
  };
  const pick = (next: WorkMode) => {
    if (next === mode) return;
    haptics.tap();
    setMode(next);
  };
  const dayOf = (k: Weekday) => {
    const from = new Date(`${snap.today}T12:00:00`);
    const monFirst = (from.getDay() + 6) % 7;
    return new Date(`${addDays(snap.today, (k - monFirst + 7) % 7)}T12:00:00`);
  };

  return (
    <FittedSheet>
      <View style={{ paddingTop: 8, paddingHorizontal: 18, gap: 6 }}>
        <View
          style={{
            alignSelf: 'center',
            width: 36,
            height: 5,
            borderRadius: 9,
            backgroundColor: palette.inkSoft,
            opacity: 0.35,
          }}
        />
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <PressScale onPress={() => router.back()} style={{ width: 70, paddingVertical: 6 }}>
            <Text style={{ ...body(16), color: palette.inkSoft }}>{t('quick.cancel')}</Text>
          </PressScale>
          <Text style={{ ...body(17, 650), color: palette.ink }}>{t('work.money.title')}</Text>
          <PressScale
            onPress={() => void save()}
            style={{ width: 70, paddingVertical: 6, alignItems: 'flex-end' }}
          >
            <Text style={{ ...body(16, 650), color: palette.ink }}>{t('common.done')}</Text>
          </PressScale>
        </View>
      </View>
      <EdgeSheetScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: 28,
          gap: 10,
        }}
      >
        <ModeCard
          on={mode === 'asItComes'}
          bars={MONTHS.asItComes}
          title={t('work.money.asItComes')}
          sub={t('work.money.asItComesSub')}
          onPress={() => pick('asItComes')}
        />
        <Animated.View layout={RESIZE}>
          <ModeCard
            on={mode === 'payMyself'}
            bars={MONTHS.payMyself}
            title={t('work.money.payMyself')}
            sub={t('work.money.payMyselfSub')}
            onPress={() => pick('payMyself')}
          >
            {mode === 'payMyself' ? (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={{ gap: 8, paddingTop: 8 }}
              >
                <IncomeWheels income={amount} onIncome={setAmount} colours={palette} />
                <View style={{ marginHorizontal: -13 }}>
                  <Strip
                    items={WEEKDAYS.map((d) => t(`onboarding.pay.day${d}`))}
                    widths={DAY_WIDTHS}
                    index={weekday}
                    onChange={(k) => setWeekday(WEEKDAYS[k] ?? 4)}
                    ink={palette.ink}
                    band={palette.chipBg}
                    label={t('work.money.payMyself')}
                    spoken={WEEKDAYS.map((d) => i18n.weekday(dayOf(d)))}
                    size={22}
                  />
                </View>
                <Text style={{ ...body(13, 500), textAlign: 'center', color: palette.inkSoft }}>
                  {t('work.money.wage', { weekday: i18n.weekday(dayOf(weekday)) })}
                </Text>
              </Animated.View>
            ) : null}
          </ModeCard>
        </Animated.View>
        <Animated.Text
          layout={RESIZE}
          style={{
            ...body(13, 500),
            lineHeight: 18,
            textAlign: 'center',
            color: palette.inkSoft,
            paddingHorizontal: 24,
            paddingTop: 6,
          }}
        >
          {t('work.money.note')}
        </Animated.Text>
      </EdgeSheetScroll>
    </FittedSheet>
  );
}

/** One way work can pay: the month it makes as bars, what it means, and its check. */
function ModeCard({
  on,
  bars,
  title,
  sub,
  onPress,
  children,
}: {
  readonly on: boolean;
  readonly bars: readonly number[];
  readonly title: string;
  readonly sub: string;
  readonly onPress: () => void;
  readonly children?: ReactNode;
}) {
  const { palette } = useTheme();
  const outline = useAnimatedStyle(() => ({
    borderColor: withTiming(on ? palette.accent : `${palette.accent}00`, { duration: 200 }),
  }));
  const fill = useAnimatedStyle(() => ({
    backgroundColor: withTiming(on ? palette.accent : `${palette.accent}00`, { duration: 200 }),
    borderColor: withTiming(on ? palette.accent : palette.hair, { duration: 200 }),
  }));
  return (
    <Animated.View
      style={[
        {
          borderRadius: 24,
          borderWidth: 2,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          paddingVertical: 13,
          paddingLeft: 13,
          paddingRight: 14,
        },
        outline,
      ]}
    >
      <PressScale
        scaleTo={0.98}
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}
      >
        <View
          style={{
            width: 88,
            height: 64,
            borderRadius: 16,
            backgroundColor: palette.chipBg,
            paddingTop: 11,
            paddingHorizontal: 8,
            paddingBottom: 12,
            justifyContent: 'flex-end',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 41 }}>
            {bars.map((height, day) => (
              <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={
                    height > 0
                      ? { width: 2.5, height, borderRadius: 1, backgroundColor: workInk.bars }
                      : { width: 1.5, height: 1.5, borderRadius: 1, backgroundColor: palette.hair }
                  }
                />
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={{ ...body(17, 650, -0.02), color: palette.ink }}>{title}</Text>
          <Text style={{ ...body(13), lineHeight: 17.5, color: palette.inkSoft }}>{sub}</Text>
        </View>
        <Animated.View
          style={[
            {
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
            },
            fill,
          ]}
        >
          {on ? <Symbol name="check" size={18} weight={600} color={palette.accentFg} /> : null}
        </Animated.View>
      </PressScale>
      {children}
    </Animated.View>
  );
}

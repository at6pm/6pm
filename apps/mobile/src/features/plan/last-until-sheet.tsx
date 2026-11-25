import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ReduceMotion } from 'react-native-reanimated';

import { cycleMonth, lastUntilChoices, lastUntilPreview, type LocalDate } from '@6pm/domain';
import { inSentence } from '@6pm/i18n';
import { incomeInk } from '@6pm/theme';

import { setLastUntil } from '../../data/income-plan-actions';
import { dayOf, periodInputOf, periodOf } from '../../data/money-store';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { EdgeSheetScroll, FittedSheet } from '../../ui/navigation/edge-sheet';
import { Odometer } from '../../ui/odometer';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { useRunAction } from '../companion/use-run-action';
import { usePlanFormat } from './plan-format';

/** A strip cell: "End of Nov" is wider than "15 Dec". */
const FIRST_WIDTH = 132;
const DATE_WIDTH = 92;
/** The ruler ticks turn as the day changes, 20 ms apart. */
const TICK_MS = 20;
const reflow = LinearTransition.duration(380).reduceMotion(ReduceMotion.System);

/**
 * "Make it last until": the one control money that only lands has. A strip of days (the month's
 * end, then the 15th and the end of the months after) shows the day it would give, live, and a
 * ruler of the days at it: cream through the day chosen, in-hand lavender beyond. Further than
 * the money reaches and the day gets smaller; nearer, and the rest waits in hand.
 */
export function LastUntilSheet() {
  const router = useRouter();
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const run = useRunAction();
  const store = useMoneyStore();
  const snap = useMoney();
  const format = usePlanFormat(snap.today);
  const period = periodOf(snap);
  const input = periodInputOf(snap);
  const day = dayOf(snap);
  const choices = useMemo(
    () => lastUntilChoices(snap.today, snap.plan?.payday ?? { kind: 'sameDay', day: 1 }),
    [snap.today, snap.plan?.payday],
  );
  const saved = snap.plan?.lastUntil ?? null;
  const [at, setAt] = useState(() => {
    const k = saved === null ? 0 : choices.indexOf(saved);
    return k < 0 ? 0 : k;
  });
  const busy = useRef(false);
  const until: LocalDate = choices[at] ?? choices[0] ?? snap.today;
  // As the plan will count it once saved: the days at the line and in hand are Plan's.
  const preview = lastUntilPreview({
    today: snap.today,
    until,
    pool: Math.max(0, day?.startFree ?? 0),
    cap: period?.cap ?? null,
    minDays: period?.minDays ?? 0,
    cycle: snap.cycle,
    anchor: snap.plan?.payday ?? { kind: 'sameDay', day: 1 },
    bills: snap.bills,
    jars: input?.jars ?? 0,
    currency: money.currency,
  });
  const month = inSentence(
    (i18n.language === 'vi' ? format.monthLong : format.monthShort)(cycleMonth(snap.cycle)),
    i18n.language,
  );
  const labels = choices.map((d, k) =>
    k === 0 ? t('income.until.endOf', { month }) : format.dayMonthShort(d),
  );

  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    // The month's end is no choice at all: it is what money that only lands lasts to anyway.
    if (!(await run(() => setLastUntil(store, at === 0 ? null : until)))) {
      busy.current = false;
      return;
    }
    haptics.success();
    router.back();
  };

  const beyond = palette.dark ? incomeInk.rulerInHand.dark : incomeInk.rulerInHand.light;
  const ticks = preview.days + preview.inHandDays;
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
            <Text style={{ ...body(16), color: palette.inkSoft }}>{t('income.until.cancel')}</Text>
          </PressScale>
          <Text style={{ ...body(17, 650), color: palette.ink }}>
            {t('onboarding.landed.lastUntil')}
          </Text>
          <PressScale
            onPress={() => void save()}
            style={{ width: 70, paddingVertical: 6, alignItems: 'flex-end' }}
          >
            <Text style={{ ...body(16, 650), color: palette.ink }}>{t('income.until.done')}</Text>
          </PressScale>
        </View>
      </View>
      <EdgeSheetScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingHorizontal: 18,
          paddingBottom: 28,
          gap: 16,
        }}
      >
        <View style={{ marginHorizontal: -18 }}>
          <Strip
            items={labels}
            widths={choices.map((_, k) => (k === 0 ? FIRST_WIDTH : DATE_WIDTH))}
            index={at}
            onChange={setAt}
            ink={palette.ink}
            band={palette.chipBg}
            label={t('onboarding.landed.lastUntil')}
            spoken={choices.map((d) => i18n.weekdayDayShort(new Date(`${d}T12:00:00`)))}
            size={20}
          />
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: 4 }}
        >
          <Odometer value={preview.line} size={36} weight={500} color={palette.ink} />
          <Text style={{ ...body(15, 600), color: palette.inkSoft }}>
            {t('income.day.to', { date: format.dayMonthShort(until) })}
          </Text>
        </View>
        <Animated.View layout={reflow} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', height: 14, gap: ticks > 60 ? 1 : 2 }}>
            {Array.from({ length: Math.max(1, ticks) }, (_, k) => (
              <Animated.View
                key={k}
                entering={FadeIn.duration(200).delay(k * TICK_MS)}
                style={{
                  flex: 1,
                  borderRadius: 1,
                  backgroundColor: k < preview.days ? palette.ink : beyond,
                  opacity: ticks === 0 ? 0.2 : 1,
                }}
              />
            ))}
          </View>
          <Text style={{ ...body(13, 600), color: palette.ink }}>
            {t('income.until.daysAt', { count: preview.days, amount: money.short(preview.line) })}
            <Text style={{ ...body(13, 500), color: palette.inkSoft }}>
              {' · '}
              {preview.inHandDays > 0
                ? t('income.until.inHand', { count: preview.inHandDays })
                : t('income.until.nothingLeft')}
            </Text>
          </Text>
        </Animated.View>
        <Text style={{ ...body(13.5, 500), lineHeight: 19, color: palette.inkSoft }}>
          {t('income.until.explain')}
        </Text>
        <PressScale
          scaleTo={0.95}
          accessibilityRole="button"
          onPress={() => void save()}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>
            {t('income.until.save', { date: format.dayMonthShort(until) })}
          </Text>
        </PressScale>
      </EdgeSheetScroll>
    </FittedSheet>
  );
}

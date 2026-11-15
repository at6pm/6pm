import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { lineUsed, type DailyNumber } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useMoneySelector } from '../../data/money-provider';
import { daysLeftOf } from '../../data/money-store';
import { incomePlanOf } from '../plan/income-plan-view';
import { usePlanFormat } from '../plan/plan-format';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { AmountText } from '../quick-add/amount-text';
import { shortParts } from '../quick-add/typed-amount';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useClock } from '../../ui/theme/clock';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import type { HomeTab } from './home-tabs';
import { TopNav } from './top-nav';

/**
 * What the compact bar shows: on Today, a mini hero (the number, how much is used) with the
 * meter as a 3 pt line; on Plan and Diary, the page title and its context line.
 */
export const HomeTopNav = memo(function HomeTopNav({
  edge,
  tab,
  day,
  onPressTop,
  onQuickAdd,
}: {
  /** What the bar leaves clear on the right (see `TopNav`). */
  readonly edge: number;
  readonly tab: HomeTab;
  readonly day: DailyNumber;
  readonly onPressTop: () => void;
  readonly onQuickAdd: () => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { dayDate, today } = useClock();
  const format = usePlanFormat(today);
  // On the iPhone Duo, Add lives in the side rail.
  const { rail } = useDesignInsets();
  // The days the daily number divides by: to the next pay for a plan paid by the week.
  const daysLeft = useMoneySelector(daysLeftOf);
  // Money that only lands has no number until it does, as Today's hero says.
  const nothingLanded = useMoneySelector((snapshot) => {
    const plan = incomePlanOf(snapshot);
    return plan?.kind === 'landed' && plan.view.state !== 'landed';
  });
  // Money that only lands has no payday: Plan's bar names the day it is made to last to.
  const lastsTo = useMoneySelector((snapshot) => {
    const plan = incomePlanOf(snapshot);
    return plan?.kind === 'landed' ? plan.view.on : null;
  });
  // Nothing landed has no line to use up, and nothing is "over" (Today's hero draws it empty).
  const used = nothingLanded ? 0 : day.safe < 0 ? 1 : lineUsed(day);
  const meter = useAnimatedStyle(() => ({ width: `${used * 100}%` }));
  const meterTrack = palette.dark ? 'rgba(255,255,255,.2)' : 'rgba(27,30,46,.12)';
  const warn = palette.dark ? '#ffbe8a' : '#b8622a';

  if (tab === 'today') {
    return (
      <TopNav onPressTop={onPressTop} edge={edge}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <Text style={{ ...body(12, 600), color: palette.inkSoft }}>
              {t('today.safeToSpend')}
            </Text>
            {nothingLanded ? (
              <Text
                numberOfLines={1}
                style={{ ...leading(display(22, 500, -0.02), 27, true), color: palette.ink }}
              >
                {t('income.today.nothingLanded')}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <AmountText
                  parts={shortParts(Math.max(0, day.safe), money)}
                  style={{ ...leading(display(27, 500, -0.02), 27, true), color: palette.ink }}
                />
                <Text
                  numberOfLines={1}
                  style={{ ...body(12.5), ...tabular, color: palette.inkSoft, flexShrink: 1 }}
                >
                  {t('today.meterUsed', {
                    spent: money.short(day.spent),
                    line: money.short(day.line),
                  })}
                </Text>
              </View>
            )}
          </View>
          {rail > 0 ? null : (
            <PressScale
              onPress={onQuickAdd}
              accessibilityRole="button"
              accessibilityLabel={t('home.quickAdd')}
              hitSlop={4}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: palette.glass,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol name="add" size={22} color={palette.ink} />
            </PressScale>
          )}
        </View>
        <View
          style={{ height: 3, borderRadius: 3, backgroundColor: meterTrack, overflow: 'hidden' }}
        >
          <Animated.View
            style={[
              {
                height: 3,
                borderRadius: 3,
                backgroundColor: day.safe < 0 && !nothingLanded ? warn : palette.ink,
              },
              meter,
            ]}
          />
        </View>
      </TopNav>
    );
  }

  const month = new Intl.DateTimeFormat(localeOf(language), {
    month: 'long',
    year: 'numeric',
  }).format(dayDate);
  return (
    <TopNav onPressTop={onPressTop} edge={edge}>
      <View style={{ alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 40 }}>
        <Text style={{ ...body(17, 650, -0.01), color: palette.ink }}>
          {t(tab === 'plan' ? 'tabs.plan' : 'tabs.diary')}
        </Text>
        <Text style={{ ...body(12), color: palette.inkSoft }}>
          {tab !== 'plan'
            ? month
            : lastsTo !== null
              ? t('income.day.to', { date: format.dayMonthShort(lastsTo) })
              : t('plan.daysToPayday', { count: daysLeft })}
        </Text>
      </View>
    </TopNav>
  );
});

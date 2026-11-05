import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  designAmount,
  diffDays,
  jarPaydaysLeft,
  lineWithSetAside,
  dailyNumber,
  newYearAskOptions,
  newYearJarGoal,
  newYearJarMonth,
  NEW_YEAR_ASK_START,
  potSetAside,
  savedBefore,
  type NewYearAsk,
} from '@6pm/domain';
import { seasonInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { dailyInputOf } from '../../data/money-store';
import { usePlanActions } from '../../data/plan-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono, tabular } from '../../ui/type/fonts';
import { useCompanionToast } from '../companion/use-companion-toast';
import { useRunAction } from '../companion/use-run-action';
import { EnvelopeJar } from './envelopes';
import { expectLanding } from './jar-flight';
import { useNewYear } from './use-new-year';

/** The Tết jar's hue: the canvas's gold. */
export const NEW_YEAR_JAR_HUE = 85;
const ASKS: readonly { readonly id: NewYearAsk; readonly icon: SymbolName }[] = [
  { id: 'lixi', icon: 'mail' },
  { id: 'gifts', icon: 'redeem' },
  { id: 'trip', icon: 'directions_bus' },
];

/**
 * "A jar for Tết" (Tết Season canvas, first phone): three taps build the goal (lì xì, gifts home,
 * the trip home), every million drops one envelope into the jar, and what it costs each day is
 * shown before Start. Start makes the season's jar (or re-dates last season's), which flies onto
 * the shelf. Seollal and the Spring Festival get the same sheet in their own words.
 */
export function NewYearJarSheet() {
  const router = useRouter();
  const { palette } = useTheme();
  const { bottom } = useDesignInsets();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const actions = usePlanActions();
  const run = useRunAction();
  const say = useCompanionToast();
  const season = useNewYear();
  const { window, jar, festival, envelope } = season;
  const [picks, setPicks] = useState<Record<NewYearAsk, number>>({ ...NEW_YEAR_ASK_START });
  const [working, setWorking] = useState(false);
  const busy = useRef(false);
  const currency = money.currency;
  const goal = newYearJarGoal(picks, currency);
  const million = designAmount(1_000_000, currency);
  const month = window === null ? null : newYearJarMonth(window);

  const plan = useMemo(() => {
    if (month === null) return null;
    const held = jar ? savedBefore(snap.potMoves, jar.id, snap.cycle.start) : 0;
    const each = potSetAside({
      pot: { kind: 'occasion', goal, neededBy: month, share: null, paused: false },
      savedBefore: held,
      futureYou: 0,
      cycle: snap.cycle,
      currency,
    });
    const input = dailyInputOf(snap);
    const takes = jar ? (snap.setAsideThisCycle[jar.id] ?? 0) : 0;
    return {
      each,
      before: input ? dailyNumber(input).line : 0,
      after: input ? lineWithSetAside(input, each - takes) : 0,
      paydays: jarPaydaysLeft({
        goal,
        savedBefore: held,
        neededBy: month,
        monthly: null,
        cycle: snap.cycle,
      }),
    };
  }, [month, jar, snap, goal, currency]);
  if (window === null || plan === null || month === null) return null;

  const weeks = Math.max(1, Math.round(diffDays(window.newYear, snap.today) / 7));
  const askLabel = (id: NewYearAsk) =>
    id === 'lixi'
      ? envelope
      : t(id === 'gifts' ? 'season.offer.ask.gifts' : 'season.offer.ask.trip');

  const start = async () => {
    if (busy.current) return;
    busy.current = true;
    setWorking(true);
    const fill = { by: 'date', neededBy: month } as const;
    const ok = jar
      ? await run(() => actions.updatePot(jar.id, { goal, fill, paused: false }))
      : (expectLanding(),
        await run(() =>
          actions.createPot({
            name: festival,
            icon: 'local_florist',
            hue: NEW_YEAR_JAR_HUE,
            goal,
            fill,
            season: 'newYear',
          }),
        ));
    if (!ok) {
      expectLanding(false);
      busy.current = false;
      setWorking(false);
      return;
    }
    haptics.success();
    router.back();
    say('potMade');
  };

  const header = (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
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
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PressScale
          accessibilityRole="button"
          onPress={() => {
            // Later puts Today's card away until the next payday.
            void season.putOff(snap.cycle.payday);
            router.back();
          }}
          hitSlop={8}
          style={{ position: 'absolute', left: 0, paddingVertical: 8 }}
        >
          <Text style={{ ...body(17), color: palette.inkSoft }}>{t('season.offer.later')}</Text>
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>
          {t('season.offer.title', { festival })}
        </Text>
      </View>
    </View>
  );

  return (
    <SheetFrame header={header}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 18, paddingBottom: 12, gap: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 18 }}>
          <EnvelopeJar
            hue={NEW_YEAR_JAR_HUE}
            envelopes={Math.max(1, Math.round(goal / million))}
            level={Math.min(1, (goal / million) * 0.09)}
          />
          <View style={{ flex: 1, gap: 4, paddingBottom: 8 }}>
            <Text
              style={{
                ...mono(10.5, 500, 0.14),
                textTransform: 'uppercase',
                color: seasonInk.envelopeRim,
              }}
            >
              {t('season.offer.kicker', { festival, count: weeks })}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ ...leading(display(54, 500, -0.03), 51.3, true), color: palette.ink }}
            >
              {money.short(goal)}
            </Text>
            {plan.paydays === null ? null : (
              <Text style={{ ...leading(body(13.5), 18.2), color: palette.inkSoft }}>
                {t('season.offer.perPay', {
                  amount: money.short(plan.each),
                  count: plan.paydays,
                })}
              </Text>
            )}
          </View>
        </View>
        {ASKS.map((ask) => {
          const options = newYearAskOptions(ask.id, currency);
          return (
            <View key={ask.id} style={{ gap: 7 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Symbol name={ask.icon} size={18} color={seasonInk.envelopeRim} />
                <Text style={{ ...body(14, 600), color: palette.ink }}>{askLabel(ask.id)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {options.map((amount, i) => {
                  const on = picks[ask.id] === i;
                  return (
                    <PressScale
                      key={i}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      scaleTo={0.95}
                      onPress={() => {
                        if (on) return;
                        haptics.tap();
                        setPicks((p) => ({ ...p, [ask.id]: i }));
                      }}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: on ? palette.btnBg : palette.chipBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ ...body(14, 650), color: on ? palette.btnFg : palette.ink }}>
                        {amount === 0 ? t('season.offer.none') : money.short(amount)}
                      </Text>
                    </PressScale>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 18,
            backgroundColor: palette.cell,
          }}
        >
          <Symbol name="wb_twilight" size={20} color={palette.inkSoft} />
          <Text style={{ ...body(13.5), flex: 1, color: palette.inkSoft }}>
            {t('season.offer.daily', { festival })}
          </Text>
          <Text style={{ ...body(14, 650), ...tabular, color: palette.ink }}>
            {money.short(plan.before)} → {money.short(plan.after)}
          </Text>
        </View>
      </ScrollView>
      <View style={{ paddingTop: 12, paddingHorizontal: 18, paddingBottom: bottom(34) }}>
        <PressScale
          accessibilityRole="button"
          scaleTo={0.97}
          disabled={working}
          onPress={() => void start()}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>
            {t('season.offer.start', { festival })}
          </Text>
        </PressScale>
      </View>
    </SheetFrame>
  );
}

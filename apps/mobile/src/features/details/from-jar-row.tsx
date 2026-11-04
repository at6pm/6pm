import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { isFutureYouPot, type PotRow, type SpendRow } from '@6pm/domain';
import { oklchSrgbHex, springs } from '@6pm/theme';

import { useMoney, useMoneyActions } from '../../data/money-provider';
import { dayOf } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { Switch } from '../../ui/primitives/switch';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { jarChoiceOf } from '../close/jar-choice-of';
import { JarSplit } from '../close/jar-split';
import { useRunAction } from '../companion/use-run-action';
import { Jar, jarLevel } from '../pots/jar';
import { jarName } from '../pots/jar-name';

const STAYS_BG = `${oklchSrgbHex(0.72, 0.15, 150)}33`;
const STAYS_FG = oklchSrgbHex(0.88, 0.12, 150);

/**
 * The jars a spend can come from: every jar holding something (Future you last, as it is spent
 * from only by choice), and the one it already comes from even when that one is now empty.
 */
export function jarsToSpendFrom(
  pots: readonly PotRow[],
  saved: Readonly<Record<string, number>>,
  picked: string | null | undefined,
): PotRow[] {
  const open = pots.filter(
    (p) => p.archivedAt === null && ((saved[p.id] ?? 0) > 0 || p.id === picked),
  );
  return [...open.filter((p) => !isFutureYouPot(p)), ...open.filter((p) => isFutureYouPot(p))];
}

/** Whether a spend can come from a jar at all: spending that counts, not work or a bill. */
export function canComeFromJar(spend: SpendRow): boolean {
  return (
    spend.direction !== 'in' &&
    !spend.forWork &&
    spend.paysBill == null &&
    spend.status !== 'skipped' &&
    spend.status !== 'deleted'
  );
}

/** A jar on the picker row: what it holds drops on the pop spring when the spend comes from it. */
export function MiniJar({
  jar,
  saved,
  width,
  height,
}: {
  readonly jar: PotRow;
  readonly saved: number;
  readonly width: number;
  readonly height: number;
}) {
  const { palette } = useTheme();
  const target = jarLevel(saved, jar.goal);
  const level = useSharedValue(target);
  useEffect(() => {
    level.set(withSpring(target, { ...springs.pop, reduceMotion: ReduceMotion.System }));
  }, [level, target]);
  return (
    <Jar
      width={width}
      height={height}
      hue={jar.hue}
      icon=""
      level={level}
      ringColor={palette.cell}
    />
  );
}

/**
 * "From a jar": its own row with a switch. On, a row of jars slides open (250 ms), the spend comes
 * out of the picked one as far as it holds (`takeFromJar`), and a jar too small shows its split.
 */
export function FromJarRow({ spend }: { readonly spend: SpendRow }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const actions = useMoneyActions();
  const run = useRunAction();
  const picked = spend.fromPot ?? null;
  const [on, setOn] = useState(picked !== null);
  useEffect(() => setOn(picked !== null), [picked]);
  const jars = jarsToSpendFrom(snap.pots, snap.potSaved, picked);
  if (!canComeFromJar(spend) || jars.length === 0) return null;

  const take = (jarId: string | null) => void run(() => actions.takeFromJar(spend.id, jarId));
  const toggle = (next: boolean) => {
    setOn(next);
    if (!next) return take(null);
    // The first jar that holds it all, else the first that holds anything.
    const first =
      jars.find((j) => (snap.potSaved[j.id] ?? 0) >= spend.amount && !isFutureYouPot(j)) ?? jars[0];
    if (first) take(first.id);
  };
  const jar = picked ? snap.pots.find((p) => p.id === picked) : undefined;
  const choice = jar ? jarChoiceOf(snap, spend, jar.id) : null;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 0.5,
          borderTopColor: palette.hair,
        }}
      >
        <Text style={{ ...body(16), color: palette.inkSoft, flex: 1 }}>
          {t('potsClose.fromJar')}
        </Text>
        <Switch value={on} onChange={toggle} accessibilityLabel={t('potsClose.fromJar')} />
      </View>
      {on ? (
        <Animated.View entering={FadeInUp.duration(250)} exiting={FadeOut.duration(150)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}
          >
            {jars.map((j) => {
              const chosen = j.id === picked;
              return (
                <PressScale
                  key={j.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: chosen }}
                  onPress={() => {
                    if (chosen) return;
                    haptics.tick();
                    take(j.id);
                  }}
                  style={{
                    width: 70,
                    borderRadius: 16,
                    paddingTop: 10,
                    paddingBottom: 8,
                    backgroundColor: chosen ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.04)',
                    boxShadow: chosen ? `inset 0 0 0 1.5px ${palette.ink}` : undefined,
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <MiniJar jar={j} saved={snap.potSaved[j.id] ?? 0} width={28} height={36} />
                  <Text
                    numberOfLines={1}
                    style={{ ...body(11.5, 650), color: palette.ink, maxWidth: 64 }}
                  >
                    {jarName(j, t)}
                  </Text>
                  <Text style={{ ...body(10.5), ...tabular, color: palette.inkSoft }}>
                    {money.short(snap.potSaved[j.id] ?? 0)}
                  </Text>
                </PressScale>
              );
            })}
          </ScrollView>
          {jar && choice && choice.rest > 0 ? (
            <View
              key={`${jar.id}-${spend.amount}`}
              style={{ paddingHorizontal: 16, paddingBottom: 14 }}
            >
              <JarSplit
                hue={jar.hue}
                icon={jar.icon}
                label={t('potsClose.ask.allOfJar')}
                cover={choice.cover}
                rest={choice.rest}
              />
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * The pill under the amount: "Counts today", or "Today stays 49.000₫" once the spend comes from a
 * jar. The words cross-fade and the pill's colour follows.
 */
export function TodayPill({ spend }: { readonly spend: SpendRow }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const fromJar = spend.fromPot != null;
  const tint = useSharedValue(fromJar ? 1 : 0);
  useEffect(() => {
    tint.set(withTiming(fromJar ? 1 : 0, { duration: 300, reduceMotion: ReduceMotion.System }));
  }, [tint, fromJar]);
  const off = palette.chipBg;
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(tint.get(), [0, 1], [off, STAYS_BG]),
  }));
  const day = dayOf(snap);
  if (!canComeFromJar(spend) || spend.day !== snap.today || !day) return null;
  const fg = fromJar ? STAYS_FG : palette.ink;
  return (
    <Animated.View
      style={[
        {
          height: 30,
          paddingLeft: 9,
          paddingRight: 12,
          borderRadius: 99,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        key={fromJar ? 'stays' : 'counts'}
        entering={FadeIn.duration(300)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
      >
        <Symbol name={fromJar ? 'check_circle' : 'wb_twilight'} size={16} color={fg} />
        <Text style={{ ...body(13, 650), ...tabular, color: fg }}>
          {fromJar
            ? t('potsClose.ask.stays', { amount: money.full(Math.max(0, day.safe)) })
            : t('potsClose.details.counts')}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

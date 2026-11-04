import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  isTripJar,
  jarEarly,
  jarStopsLine,
  readyKey,
  type CloseEvent,
  type CloseState,
  type PotRow,
} from '@6pm/domain';
import { curves, springs } from '@6pm/theme';

import { markReadyShown } from '../../data/jar-ready';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { homeCurrencyOf, useMoneyFormat } from '../../money/use-money-format';
import { useI18n } from '../../i18n/i18n';
import { Companion } from '../../ui/companion/companion';
import { haptics } from '../../ui/haptics';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import { Jar } from '../pots/jar';
import { jarColours } from '../pots/jar-colours';
import { jarName } from '../pots/jar-name';
import { captureView } from '../sharing/capture-view';
import { shareFileName } from '../sharing/share-file';
import { useShareImage } from '../sharing/use-share-image';
import { CLOSE_SHADE } from './jar-split';

const enter = Easing.bezier(...curves.enter);
const check = Easing.bezier(...curves.jarCheck);
const motion = { reduceMotion: ReduceMotion.System };
const SPARK = '#ffd36e';
const RISE_MS = 600;
/** The last part of the jar that fills on the pop spring. */
const LAST = 0.08;

/** Why the jar is ready: full, or its month has come (`readyJarFor`). */
function reasonOf(jar: PotRow, held: number): 'full' | 'date' {
  return jar.goal > 0 && held >= jar.goal ? 'full' : 'date';
}

/**
 * A jar is ready: one card after the swipes on the evening it fills or its month comes, shown
 * once per jar and reason (remembered on the phone the moment it shows).
 */
export function PotReadyStep({
  state,
  dispatch,
}: {
  readonly state: CloseState;
  readonly dispatch: (event: CloseEvent) => void;
}) {
  const snap = useMoney();
  const store = useMoneyStore();
  // Fixed as the card opens: what it celebrates does not change under it.
  const [jar] = useState(() => snap.pots.find((p) => p.id === state.readyPot));
  const [held] = useState(() => (jar ? (snap.potSaved[jar.id] ?? 0) : 0));
  const reason = jar ? reasonOf(jar, held) : 'date';
  // A jar emptied tonight by its own question has nothing left to celebrate.
  const gone = !jar || (reason === 'date' && held <= 0);
  useEffect(() => {
    if (!jar || gone) return;
    void markReadyShown(store.db, readyKey(jar.id, reason)).catch(() => undefined);
  }, [store, jar, reason, gone]);
  useEffect(() => {
    if (gone) dispatch({ type: 'potReadyDone' });
  }, [gone, dispatch]);
  if (gone) return null;
  return (
    <PotReady
      jar={jar}
      held={held}
      reason={reason}
      onDone={() => dispatch({ type: 'potReadyDone' })}
    />
  );
}

function PotReady({
  jar,
  held,
  reason,
  onDone,
}: {
  readonly jar: PotRow;
  readonly held: number;
  readonly reason: 'full' | 'date';
  readonly onDone: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const { share } = useShareImage();
  const card = useRef<ComponentRef<typeof View>>(null);
  const c = jarColours(jar.hue);
  const name = jarName(jar, t);
  const full = reason === 'full';
  const level = full ? 1 : Math.min(1, jar.goal > 0 ? held / jar.goal : 0.62);

  const rise = useSharedValue(0);
  const fill = useSharedValue(Math.max(0, level - LAST));
  const stamp = useSharedValue(0);
  const glow = useSharedValue(0);
  useEffect(() => {
    rise.set(withTiming(1, { duration: RISE_MS, easing: enter, ...motion }));
    fill.set(
      withDelay(
        RISE_MS - 100,
        withSpring(level, { ...springs.pop, ...motion }, (done) => {
          if (done) runOnJS(haptics.success)();
        }),
      ),
    );
    stamp.set(withDelay(RISE_MS + 250, withTiming(1, { duration: 360, easing: check, ...motion })));
    glow.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
  }, [rise, fill, stamp, glow, level]);
  const riseStyle = useAnimatedStyle(() => ({
    opacity: rise.get(),
    transform: [{ translateY: 28 * (1 - rise.get()) }],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, stamp.get() * 2),
    transform: [{ scale: stamp.get() }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * glow.get() }));

  const plan = snap.plan;
  const early = full ? jarEarly(snap.today, jar.neededBy) : null;
  const earlyText = early
    ? t(
        early.unit === 'month'
          ? 'potsClose.ready.earlyMonths'
          : early.unit === 'week'
            ? 'potsClose.ready.earlyWeeks'
            : 'potsClose.ready.earlyDays',
        { count: early.count },
      )
    : null;
  const sub = full
    ? [money.short(held), earlyText].filter(Boolean).join(' · ')
    : jar.goal > 0
      ? t('potsClose.ready.of', { saved: money.short(held), target: money.short(jar.goal) })
      : money.short(held);
  const line = plan
    ? jarStopsLine({
        today: snap.today,
        payday: plan.payday,
        income: plan.income,
        bills: snap.bills,
        futureYou: plan.futureYou,
        occasions: snap.pots.reduce(
          (sum, p) => (p.kind === 'occasion' ? sum + (snap.setAsideThisCycle[p.id] ?? 0) : sum),
          0,
        ),
        took: snap.setAsideThisCycle[jar.id] ?? 0,
        fromSlice: jar.kind !== 'occasion',
        currency: homeCurrencyOf(plan),
      })
    : null;
  const persona = plan?.persona ?? 'soft';
  const companion = plan?.serious
    ? null
    : t(
        `potsClose.ready.line.${isTripJar(jar) ? 'trip' : 'other'}.${persona}` as 'potsClose.ready.line.other.soft',
      );

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View
        ref={card}
        collapsable={false}
        style={{
          flex: 1,
          alignSelf: 'stretch',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <Animated.View style={[{ width: 160, height: 210 }, riseStyle]}>
          <Spark style={{ left: -26, top: 40 }} size={10} delay={0} />
          <Spark style={{ right: -20, top: 10 }} size={8} delay={600} />
          <Spark style={{ right: -30, top: 110 }} size={6} delay={1200} />
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 3,
                right: 3,
                top: 16,
                bottom: 0,
                borderTopLeftRadius: 44,
                borderTopRightRadius: 44,
                borderBottomLeftRadius: 52,
                borderBottomRightRadius: 52,
                boxShadow: `0 0 60px ${c.glow}`,
              },
              glowStyle,
            ]}
          />
          <Jar
            width={160}
            height={210}
            hue={jar.hue}
            icon=""
            level={fill}
            ringColor={palette.glass}
          >
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                inset: 0,
                top: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSymbolName(jar.icon) ? (
                <Symbol name={jar.icon} size={48} fill={1} color={c.iconHigh} />
              ) : null}
            </View>
          </Jar>
          <Animated.View
            style={[
              {
                position: 'absolute',
                right: -6,
                top: 4,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: palette.btnBg,
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,.3)',
              },
              stampStyle,
            ]}
          >
            <Symbol name="check" size={24} weight={600} color={palette.btnFg} />
          </Animated.View>
        </Animated.View>
        <Text style={{ ...leading(display(42, 500), 43), color: palette.ink, textAlign: 'center' }}>
          {t(full ? 'potsClose.ready.full' : 'potsClose.ready.month', { jar: name })}
        </Text>
        <Text style={{ ...display(22, 500), ...tabular, color: palette.ink, opacity: 0.8 }}>
          {sub}
        </Text>
        {line && line.after > line.before ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              height: 36,
              paddingHorizontal: 14,
              borderRadius: 99,
              backgroundColor: CLOSE_SHADE,
            }}
          >
            <Symbol name="wb_twilight" size={18} color={palette.accent} />
            <Text style={{ ...body(14, 600), ...tabular, color: palette.ink }}>
              {t('potsClose.ready.fromPayday')}{' '}
              <Text style={{ opacity: 0.55 }}>{money.short(line.before)} →</Text>{' '}
              {money.short(line.after)}
            </Text>
          </View>
        ) : null}
        {companion ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingTop: 4 }}>
            <Companion size={56} mood="happy" />
            <View
              style={{
                marginBottom: 22,
                paddingVertical: 8,
                paddingHorizontal: 13,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                borderBottomLeftRadius: 4,
                backgroundColor: palette.bubbleBg,
              }}
            >
              <Text style={{ ...display(16, 500), color: palette.bubbleFg }}>{companion}</Text>
            </View>
          </View>
        ) : null}
      </View>
      <View style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 8 }}>
        <PressScale
          scaleTo={0.97}
          onPress={() => {
            haptics.tap();
            onDone();
          }}
          style={{
            flex: 1,
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.accent,
            boxShadow: '0 8px 22px rgba(255,120,70,.35), inset 0 1px 0 rgba(255,255,255,.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 650), color: palette.accentFg }}>
            {t('potsClose.ready.lovely')}
          </Text>
        </PressScale>
        <PressScale
          accessibilityLabel={t('potsClose.ready.share')}
          onPress={() => void share(shareFileName('jar', jar.id), () => captureView(card))}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: palette.glass,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="ios_share" size={22} color={palette.ink} />
        </PressScale>
      </View>
    </View>
  );
}

/** A spark beside the full jar, breathing on its own beat. */
function Spark({
  style,
  size,
  delay,
}: {
  readonly style: { left?: number; right?: number; top: number };
  readonly size: number;
  readonly delay: number;
}) {
  const beat: SharedValue<number> = useSharedValue(0);
  useEffect(() => {
    beat.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
          undefined,
          ReduceMotion.System,
        ),
      ),
    );
  }, [beat, delay]);
  const anim = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * beat.get(),
    transform: [{ scale: 0.7 + 0.45 * beat.get() }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: SPARK,
        },
        style,
        anim,
      ]}
    />
  );
}

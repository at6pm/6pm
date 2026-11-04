import { useEffect, useRef, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { WHAT_IF_SHARE } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { BalancedText } from '../../ui/type/balanced-text';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import { Jar } from '../pots/jar';
import { jarColours } from '../pots/jar-colours';
import type { OnboardingPalette } from './onboarding-palette';
import { Card } from './step-parts';

/** Future you's jar is warm: the canvas's hue 70. */
const FUTURE_HUE = 70;
const fillEase = Easing.bezier(...curves.jarFill);
const FILL_MS = 350;
const THUMB = 30;
/** The slider reaches M5's share of money in, in whole percents. */
const MOST = Math.round(WHAT_IF_SHARE * 100);
/** The jar is drawn full at this share; the slider runs on past it. */
const FULL_AT = 30;

/**
 * Pay future you first: Future you's jar on the left fills as the slice slides, "12% of each pay"
 * and what goes in each payday beside it, and the daily number answering underneath from the
 * same engine as the first number (`line`).
 */
export function StepFutureYou({
  pal,
  percent,
  amount,
  line,
  onPercent,
}: {
  readonly pal: OnboardingPalette;
  readonly percent: number;
  /** Set aside each payday, in the home currency. */
  readonly amount: number;
  /** Money in less bills and this, for the month. */
  readonly free: number;
  /** Safe to spend each day with this slice: the first number's line. */
  readonly line?: number;
  readonly onPercent: (percent: number) => void;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const c = jarColours(FUTURE_HUE);
  // The range never ends below the slice already set (M5).
  const [max] = useState(() => Math.max(MOST, percent));

  const level = useSharedValue(Math.min(1, (percent / FULL_AT) * 0.92));
  const lit = useSharedValue(percent > 0 ? 1 : 0);
  useEffect(() => {
    const motion = { duration: FILL_MS, easing: fillEase, reduceMotion: ReduceMotion.System };
    level.set(withTiming(Math.min(1, (percent / FULL_AT) * 0.92), motion));
    lit.set(withTiming(percent > 0 ? 1 : 0, motion));
  }, [percent, level, lit]);
  const jarStyle = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * lit.get() }));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 20, paddingRight: 76 }}>
        <BalancedText
          accessibilityRole="header"
          style={{ ...leading(display(36, 600, -0.03), 36), color: pal.ink }}
        >
          {t('potsClose.first.title')}
        </BalancedText>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        <Animated.View style={jarStyle}>
          <Jar
            width={150}
            height={198}
            hue={FUTURE_HUE}
            icon="sunny"
            futureYou
            level={level}
            ringColor={pal.cell}
            slosh
          />
        </Animated.View>
        <View style={{ gap: 2 }}>
          <Text style={{ ...leading(display(52, 600, -0.03), 49), ...tabular, color: pal.ink }}>
            {percent}%
          </Text>
          <Text style={{ ...body(15, 600), color: pal.inkSoft }}>
            {t('potsClose.first.ofEachPay')}
          </Text>
          <Text style={{ ...display(22, 500), ...tabular, color: pal.ink, paddingTop: 10 }}>
            {amount > 0 ? money.short(amount) : t('potsClose.first.nothing')}
          </Text>
          <Text style={{ ...body(13), color: pal.inkSoft, opacity: 0.8 }}>
            {t('potsClose.first.eachPayday')}
          </Text>
        </View>
      </View>
      <SliceSlider
        percent={percent}
        max={max}
        fill={c.fill}
        track={pal.track}
        thumb={pal.light}
        label={t('potsClose.first.slider')}
        onPercent={onPercent}
      />
      {line !== undefined ? (
        <Card
          pal={pal}
          style={{
            marginTop: 18,
            borderRadius: 22,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Symbol name="wb_twilight" size={22} color={pal.accent} />
          <Text style={{ ...body(15, 600), color: pal.ink, flex: 1 }}>
            {t('potsClose.first.safe')}
          </Text>
          <Text style={{ ...display(26, 500), ...tabular, color: pal.ink }}>
            {money.short(line)}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

/**
 * The slice's slider: the track fills to the thumb as it is dragged (on the UI thread), the
 * percent changes in whole steps with a light haptic every 5%.
 */
function SliceSlider({
  percent,
  max,
  fill,
  track,
  thumb,
  label,
  onPercent,
}: {
  readonly percent: number;
  readonly max: number;
  readonly fill: string;
  readonly track: string;
  readonly thumb: string;
  readonly label: string;
  readonly onPercent: (percent: number) => void;
}) {
  const width = useSharedValue(0);
  const x = useSharedValue(0);
  const last = useRef(percent);
  const [ready, setReady] = useState(false);
  const report = (next: number) => {
    if (next === last.current) return;
    // A light tap each time the slice crosses a multiple of 5%.
    if (Math.floor(next / 5) !== Math.floor(last.current / 5)) haptics.tap();
    last.current = next;
    onPercent(next);
  };
  useEffect(() => {
    last.current = percent;
  }, [percent]);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - THUMB;
    width.set(w);
    x.set((percent / max) * w);
    setReady(true);
  };
  const move = (at: number) => {
    'worklet';
    const w = width.get();
    if (w <= 0) return;
    const clamped = Math.min(w, Math.max(0, at - THUMB / 2));
    x.set(clamped);
    runOnJS(report)(Math.round((clamped / w) * max));
  };
  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => move(e.x))
    .onUpdate((e) => move(e.x))
    .onFinalize(() => {
      const w = width.get();
      if (w <= 0) return;
      // The thumb settles on the whole percent it reported.
      x.set(withTiming((Math.round((x.get() / w) * max) / max) * w, { duration: 120 }));
    });
  const fillStyle = useAnimatedStyle(() => ({ width: x.get() + THUMB / 2 }));
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: percent, text: `${percent}%` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          report(
            Math.min(
              max,
              Math.max(0, percent + (e.nativeEvent.actionName === 'increment' ? 5 : -5)),
            ),
          )
        }
        style={{ height: 34, marginHorizontal: 4, justifyContent: 'center' }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 14,
            height: 6,
            borderRadius: 6,
            backgroundColor: track,
          }}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 14,
              height: 6,
              borderRadius: 6,
              backgroundColor: fill,
            },
            fillStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 2,
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: thumb,
              boxShadow: '0 4px 12px rgba(0,0,0,.35)',
              opacity: ready ? 1 : 0,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { localeOf } from '@6pm/i18n';
import { catchInk, curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { nativeReach } from '../surfaces/native-reach';
import { useFirstCatchCard } from './use-first-catch-card';

/** The sheet's gap under each card: taken back as the card folds away, so nothing jumps. */
const SHEET_GAP = 28;
/** The real slip shows in the outline this long before the card folds away. */
const PRINTED_MS = 1100;
const COLLAPSE_MS = 400;
const BREATHE_MS = 2600;

/** The ways a first catch can come from on this phone, as the card's icons show them. */
const WAYS: readonly { readonly icon: SymbolName; readonly on: boolean }[] = [
  { icon: 'account_balance', on: nativeReach.bankAlerts },
  { icon: 'ios_share', on: nativeReach.share },
  { icon: 'contactless', on: nativeReach.wallet },
];

/**
 * Today's "Your first receipt goes here": the morning after "I'll do it later", an empty dashed
 * slip waiting to be filled, the ways left to set up, and "Catch one", which opens the wait for a
 * first catch again. When a real capture lands, its slip prints into the outline, then the card
 * folds away (400 ms) and what is under it slides up; it never comes back.
 */
export function FirstCatchCard() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { due, caught, settle } = useFirstCatchCard();
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);
  const height = useSharedValue(0);
  const fold = useSharedValue(0);
  const settled = useRef(false);

  useEffect(() => {
    if (!due) return;
    settled.current = false;
    fold.set(0);
    setGone(false);
    setShown(true);
  }, [due, fold]);

  // A real catch landed while the card was up: print it, then fold the card away for good.
  useEffect(() => {
    if (!shown || caught === null || settled.current) return undefined;
    settled.current = true;
    haptics.success();
    settle();
    const timer = setTimeout(() => {
      fold.set(
        withTiming(
          1,
          {
            duration: reduceMotion ? 200 : COLLAPSE_MS,
            easing: Easing.bezier(...curves.enter),
            reduceMotion: ReduceMotion.Never,
          },
          (done) => {
            if (done) scheduleOnRN(setGone, true);
          },
        ),
      );
    }, PRINTED_MS);
    return () => clearTimeout(timer);
  }, [shown, caught, settle, fold, reduceMotion]);

  const folding = useAnimatedStyle(() => {
    const p = fold.get();
    if (p === 0) return { opacity: 1 };
    return {
      height: height.get() * (1 - p),
      marginBottom: -SHEET_GAP * p,
      opacity: interpolate(p, [0, 0.7], [1, 0], 'clamp'),
      overflow: 'hidden',
    };
  });

  if (!shown || gone) return null;
  const ways = WAYS.filter((way) => way.on);
  return (
    <Animated.View
      style={folding}
      onLayout={(e) => {
        if (fold.get() === 0) height.set(e.nativeEvent.layout.height);
      }}
    >
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View style={{ width: 104, transform: [{ rotate: '-3deg' }] }}>
          {caught ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                height: 138,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                experimental_backgroundImage: `linear-gradient(180deg, ${catchInk.paperTop} 0%, ${catchInk.paperBottom} 100%)`,
                paddingVertical: 10,
                paddingHorizontal: 9,
                gap: 7,
              }}
            >
              <SlipHead ink={catchInk.soft} time={caught.at} rule={catchInk.rule} />
              <Text numberOfLines={2} style={{ ...body(11, 650), color: catchInk.ink }}>
                {caught.merchant || t(`source.${caught.source}`)}
              </Text>
              <View style={{ flex: 1 }} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ ...display(20, 500), color: catchInk.ink }}
              >
                {money.full(Math.abs(caught.amount))}
              </Text>
            </Animated.View>
          ) : (
            <GhostSlip ink={palette.ink} />
          )}
          <Scallops color={caught ? catchInk.paperBottom : palette.ink} filled={caught !== null} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
          <Text style={{ ...leading(display(21, 500), 23.5), color: palette.ink }}>
            {t('firstCatch.card.title')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {ways.map((way) => (
              <View
                key={way.icon}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  backgroundColor: palette.chipBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Symbol name={way.icon} size={17} color={palette.ink} />
              </View>
            ))}
          </View>
          <PressScale
            scaleTo={0.96}
            accessibilityRole="button"
            onPress={() => {
              haptics.tap();
              router.push('/first-catch');
            }}
            style={{
              height: 44,
              borderRadius: 99,
              backgroundColor: palette.accent,
              boxShadow: `0 8px 22px ${palette.accentGlow}, inset 0 1px 0 rgba(255,255,255,.5)`,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Text style={{ ...body(15, 650), color: palette.accentFg }}>
              {t('firstCatch.card.action')}
            </Text>
            <Symbol name="arrow_forward" size={18} color={palette.accentFg} />
          </PressScale>
        </View>
      </View>
    </Animated.View>
  );
}

/** "Nº 001" and the time over a dashed rule, at the slip's small size. */
function SlipHead({
  ink,
  time,
  rule,
}: {
  readonly ink: string;
  readonly time: string | null;
  readonly rule: string;
}) {
  const { t, language } = useI18n();
  const clock =
    time === null
      ? '--:--'
      : new Intl.DateTimeFormat(localeOf(language), {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date(time));
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...mono(8, 500, 0.08), color: ink }}>
          {t('firstCatch.slip.no', { no: '001' })}
        </Text>
        <Text style={{ ...mono(8, 500, 0.08), color: ink }}>{clock}</Text>
      </View>
      <DashedRule color={rule} />
    </>
  );
}

/** The empty slip: a dashed outline that breathes (.5 → .9 over 2.6 s), "?" where the amount goes. */
function GhostSlip({ ink }: { readonly ink: string }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(
      withRepeat(
        withTiming(1, { duration: BREATHE_MS / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [pulse, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: reduceMotion ? 0.7 : 0.5 + 0.4 * pulse.get() }));
  return (
    <Animated.View
      style={[
        {
          height: 138,
          borderWidth: 1.5,
          borderBottomWidth: 0,
          borderStyle: 'dashed',
          borderColor: ink,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          paddingVertical: 10,
          paddingHorizontal: 9,
          gap: 7,
        },
        style,
      ]}
    >
      <SlipHead ink={ink} time={null} rule={ink} />
      <View
        style={{ height: 5, width: '70%', borderRadius: 3, backgroundColor: ink, opacity: 0.22 }}
      />
      <View
        style={{ height: 5, width: '45%', borderRadius: 3, backgroundColor: ink, opacity: 0.16 }}
      />
      <View style={{ flex: 1 }} />
      <Text style={{ ...display(26, 400), color: ink, opacity: 0.5 }}>?</Text>
    </Animated.View>
  );
}

/** The slip's torn foot: a row of arcs, outlined while empty, paper once filled. */
function Scallops({ color, filled }: { readonly color: string; readonly filled: boolean }) {
  return (
    <View
      style={{ height: 7, flexDirection: 'row', overflow: 'hidden', opacity: filled ? 1 : 0.4 }}
    >
      {Array.from({ length: 11 }, (_, k) => (
        <View
          key={k}
          style={{
            width: 10,
            height: 10,
            marginTop: 2,
            borderRadius: 5,
            borderWidth: filled ? 0 : 1,
            borderColor: color,
            backgroundColor: filled ? color : 'transparent',
          }}
        />
      ))}
    </View>
  );
}

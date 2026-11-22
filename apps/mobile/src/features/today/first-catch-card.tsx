import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  LayoutAnimationConfig,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { FirstCatchReminder } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { catchInk, curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { REMINDER_ICON } from './first-catch-ways';
import { useFirstCatchCard } from './use-first-catch-card';

/** The sheet's gap under each card: taken back as the card folds away, so nothing jumps. */
const SHEET_GAP = 28;
/** The real slip shows in the outline this long before the card folds away. */
const PRINTED_MS = 1100;
const COLLAPSE_MS = 400;
const BREATHE_MS = 2600;

/** Folds the card away (400 ms, the entrance curve), then takes it out of the sheet. */
function foldAway(
  fold: SharedValue<number>,
  reduceMotion: boolean,
  onGone: (gone: boolean) => void,
): void {
  fold.set(
    withTiming(
      1,
      {
        duration: reduceMotion ? 200 : COLLAPSE_MS,
        easing: Easing.bezier(...curves.enter),
        reduceMotion: ReduceMotion.Never,
      },
      (done) => {
        if (done) scheduleOnRN(onGone, true);
      },
    ),
  );
}

/**
 * Today's reminder to let spending log itself, from the morning after the catching step ended:
 * an empty dashed slip waiting to be filled, the ways that run by themselves on this phone, and
 * what to do next. With none of them set up it says "Let your payments log themselves" over "Set
 * it up"; once one is set up and nothing has come from it, "Waiting for your first one…" over
 * "Check it". Either opens the wait for a first catch again. "Not now" folds the card away for a
 * week, and for good the third time. When a bank alert, a Wallet tap or a forwarded email lands,
 * its slip prints into the outline, then the card folds away (400 ms) and what is under it slides
 * up; it never comes back.
 */
export function FirstCatchCard() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { reminder, ways, caught, putAway } = useFirstCatchCard();
  // What the card says stays while it prints a catch and folds away.
  const [said, setSaid] = useState<FirstCatchReminder>('notSetUp');
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);
  const height = useSharedValue(0);
  const fold = useSharedValue(0);
  const settled = useRef(false);

  useEffect(() => {
    if (reminder === null) return;
    settled.current = false;
    fold.set(0);
    setSaid(reminder);
    setGone(false);
    setShown(true);
  }, [reminder, fold]);

  // A way that runs by itself caught something while the card was up: print it, then fold the
  // card away for good.
  useEffect(() => {
    if (!shown || caught === null || settled.current) return undefined;
    settled.current = true;
    haptics.success();
    const timer = setTimeout(() => foldAway(fold, reduceMotion, setGone), PRINTED_MS);
    return () => clearTimeout(timer);
  }, [shown, caught, fold, reduceMotion]);

  const notNow = () => {
    if (settled.current) return;
    settled.current = true;
    haptics.tap();
    putAway();
    foldAway(fold, reduceMotion, setGone);
  };

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
  const waiting = said === 'waiting';
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
          {/* The words fade over when a way gets set up; the card itself arrives with them in place. */}
          <LayoutAnimationConfig skipEntering>
            <Animated.View key={said} entering={FadeIn.duration(300)}>
              <Text style={{ ...leading(display(21, 500), 23.5), color: palette.ink }}>
                {t(waiting ? 'firstCatch.waiting' : 'firstCatch.card.title')}
              </Text>
            </Animated.View>
          </LayoutAnimationConfig>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {ways.map((way) => (
              <View
                key={way}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  backgroundColor: palette.chipBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Symbol name={REMINDER_ICON[way]} size={17} color={palette.ink} />
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
              {t(waiting ? 'firstCatch.card.check' : 'firstCatch.card.action')}
            </Text>
            <Symbol name="arrow_forward" size={18} color={palette.accentFg} />
          </PressScale>
          {/* The quiet way out, as the season's card has it; its tap area reaches into the gaps. */}
          <PressScale
            accessibilityRole="button"
            onPress={notNow}
            style={{
              height: 40,
              marginTop: -6,
              marginBottom: -8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...body(15), color: palette.inkSoft }}>
              {t('firstCatch.card.notNow')}
            </Text>
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

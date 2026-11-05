import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { diffDays } from '@6pm/domain';
import { curves, seasonInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, leading } from '../../ui/type/fonts';
import { jarColours } from './jar-colours';
import { NEW_YEAR_JAR_HUE } from './new-year-jar-sheet';
import { useNewYear } from './use-new-year';

/** The sheet's gap under each card: taken back as the card folds away, so nothing jumps. */
const SHEET_GAP = 28;
const FOLD_MS = 400;

/** The small jar on the card, with one envelope in it (the canvas's Today jar row, 30 × 40). */
function MiniJar() {
  const c = jarColours(NEW_YEAR_JAR_HUE);
  return (
    <View style={{ width: 30, height: 40 }}>
      <View
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          top: 0,
          height: 6,
          borderRadius: 3,
          backgroundColor: c.lid,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 5,
          bottom: 0,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          borderBottomLeftRadius: 11,
          borderBottomRightRadius: 11,
          backgroundColor: c.glass,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.18)',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: 12,
            height: 16,
            borderRadius: 2,
            transform: [{ rotate: '-8deg' }],
            experimental_backgroundImage: `linear-gradient(180deg, ${seasonInk.envelopeTop}, ${seasonInk.envelopeBottom})`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: seasonInk.envelopeRim }}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Today's card offering the season's jar, from 1 December to the day before the season, for those
 * who keep Tết (or Seollal, or the Spring Festival). "Set it up" opens the offer; "Not now" folds
 * the card away (400 ms, the sheet closing over it) until the next payday. On the day 6pm is set
 * up, with mùng 1 ten weeks away or less, the offer opens once by itself.
 */
export function NewYearOfferCard() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const snap = useMoney();
  const reduceMotion = useReducedMotion();
  const { offer, festival, putOff, onboardingShown, markOnboardingShown } = useNewYear();
  const path = usePathname();
  // Onboarding ends on the offer when mùng 1 is ten weeks away or less: the day 6pm was set up,
  // Today opens it once, over itself, for that season.
  const year = offer?.window.year ?? null;
  const offerOnboarding =
    offer?.onboarding === true &&
    year !== null &&
    snap.plan?.startedOn === snap.today &&
    onboardingShown !== year &&
    path === '/';
  useEffect(() => {
    if (!offerOnboarding || year === null) return undefined;
    const timer = setTimeout(() => {
      void markOnboardingShown(year);
      router.push('/new-year-jar');
    }, 700);
    return () => clearTimeout(timer);
  }, [offerOnboarding, year, markOnboardingShown, router]);
  const height = useSharedValue(0);
  const fold = useSharedValue(0);
  const [gone, setGone] = useState(false);
  const due = offer?.card === true;
  const wasDue = useRef(due);
  useEffect(() => {
    if (due && !wasDue.current) {
      fold.set(0);
      setGone(false);
    }
    wasDue.current = due;
  }, [due, fold]);

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

  if (!offer || !due || gone) return null;
  const weeks = Math.max(1, Math.round(diffDays(offer.window.newYear, snap.today) / 7));
  const later = () => {
    haptics.tap();
    fold.set(
      withTiming(
        1,
        {
          duration: reduceMotion ? 200 : FOLD_MS,
          easing: Easing.bezier(...curves.enter),
          reduceMotion: ReduceMotion.Never,
        },
        (done) => {
          if (done) scheduleOnRN(setGone, true);
        },
      ),
    );
    void putOff(snap.cycle.payday);
  };

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
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <MiniJar />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...body(16, 650), color: palette.ink }}>
              {t('season.card.title', { festival })}
            </Text>
            <Text style={{ ...leading(body(12.5), 16.5), color: palette.inkSoft }}>
              {t('season.card.sub', { festival, count: weeks })}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PressScale
            accessibilityRole="button"
            scaleTo={0.97}
            onPress={() => {
              haptics.tap();
              router.push('/new-year-jar');
            }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...body(15, 650), color: palette.btnFg }}>{t('season.card.open')}</Text>
          </PressScale>
          <PressScale
            accessibilityRole="button"
            onPress={later}
            style={{ height: 40, paddingHorizontal: 14, justifyContent: 'center' }}
          >
            <Text style={{ ...body(15), color: palette.inkSoft }}>{t('season.card.later')}</Text>
          </PressScale>
        </View>
      </View>
    </Animated.View>
  );
}

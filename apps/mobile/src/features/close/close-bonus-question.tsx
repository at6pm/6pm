import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { bonusSplit, floorToStep, FUTURE_YOU, type SpendRow } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { curves, seasonInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import type { MoneyInPlace } from '../../data/money-in-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { WordFitText } from '../../ui/type/word-fit-text';
import { jarColours } from '../pots/jar-colours';
import { useNewYear } from '../pots/use-new-year';

const slipEase = Easing.bezier(0.2, 0.9, 0.25, 1.1);
const tearEase = Easing.bezier(0.4, 0, 0.2, 1);
const fillEase = Easing.bezier(...curves.jarIn);
const STAGE = 420;
const JAR_W = 110;
const JAR_H = 144;
const LEFT_PIECE = 128;
/** The most day bars drawn: a month. */
const MOST_BARS = 31;

/** Day bars of different heights, the same every time (the canvas's seeded 40–100 %). */
function barHeights(count: number): number[] {
  let seed = 4;
  return Array.from({ length: count }, () => {
    seed = (seed * 9301 + 49297) % 233280;
    return 0.4 + (seed / 233280) * 0.6;
  });
}

function Bar({ height, rise }: { readonly height: number; readonly rise: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transformOrigin: '50% 100%',
    transform: [{ scaleY: 0.35 + 0.65 * rise.get() }],
  }));
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          height: `${height * 100}%`,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderBottomLeftRadius: 1,
          borderBottomRightRadius: 1,
          backgroundColor: seasonInk.dayBar,
        },
        style,
      ]}
    />
  );
}

/**
 * "Your Tết bonus?" (Tết Season canvas, third phone): the bonus slip comes in, then tears at its
 * perforation; the left piece, what the Tết jar is still missing, flies into the jar, which tops
 * out (success haptic), and the right piece, the rest, falls into the days to payday, whose bars
 * rise. "Yes, split it like that" spreads the rest; "Save the {rest} instead" puts it in Future
 * you. Either way the jar's part is a top-up of the jar, and the card is placed.
 */
export function BonusQuestionStep({
  spend,
  jarId,
  toJar,
  canSave,
  onPlace,
}: {
  readonly spend: SpendRow;
  readonly jarId: string;
  readonly toJar: number;
  /** Future you has somewhere to keep money: "Save … instead" is offered. */
  readonly canSave: boolean;
  readonly onPlace: (place: MoneyInPlace) => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const { festival } = useNewYear();
  const reduceMotion = useReducedMotion();
  const jar = snap.pots.find((p) => p.id === jarId);
  const goal = jar?.goal ?? 0;
  // Held still once the card is answered: the jar's top-up must not redraw the slip as it goes.
  const [{ held, part, rest }] = useState(() => {
    const before = snap.potSaved[jarId] ?? 0;
    const split =
      goal > 0
        ? bonusSplit(spend.amount, { goal, held: before })
        : bonusSplit(spend.amount, { goal: before + toJar, held: before });
    return { held: before, part: split.toJar, rest: split.rest };
  });
  const full = goal > 0 && held + part >= goal;
  const c = jarColours(jar?.hue ?? 85);
  const days = Math.max(1, snap.cycle.daysLeft);
  const daily = floorToStep(rest / days, money.currency);
  const bars = useMemo(() => barHeights(Math.min(MOST_BARS, days + 1)), [days]);
  const locale = localeOf(language);
  const payday = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
    new Date(`${snap.cycle.payday}T12:00:00`),
  );
  const clock = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(spend.at));
  const said = (spend.memo ?? '').trim() || spend.merchant.trim() || t('moneyIn.name');

  const slip = useSharedValue(reduceMotion ? 1 : 0);
  const tear = useSharedValue(reduceMotion ? 1 : 0);
  const fill = useSharedValue(reduceMotion ? 1 : 0);
  const rise = useSharedValue(reduceMotion ? 1 : 0);
  const [width, setWidth] = useState(362);
  const answered = useRef(false);
  useEffect(() => {
    if (reduceMotion) return;
    const m = { reduceMotion: ReduceMotion.Never };
    slip.set(withTiming(1, { ...m, duration: 600, easing: slipEase }));
    tear.set(withDelay(1400, withTiming(1, { ...m, duration: 900, easing: tearEase })));
    rise.set(withDelay(1900, withTiming(1, { ...m, duration: 700, easing: fillEase })));
    fill.set(
      withDelay(
        1900,
        withTiming(1, { ...m, duration: 700, easing: fillEase }, (done) => {
          if (done && full) scheduleOnRN(haptics.success);
        }),
      ),
    );
  }, [reduceMotion, slip, tear, fill, rise, full]);

  const from = goal > 0 ? Math.min(1, held / goal) : 0;
  const to = goal > 0 ? Math.min(1, (held + part) / goal) : 1;
  // Where the left piece lands: the jar's middle, from the piece's own middle.
  const flyX = width - 14 - JAR_W / 2 - LEFT_PIECE / 2;
  const slipStyle = useAnimatedStyle(() => ({
    opacity: slip.get(),
    transform: [{ translateY: -50 * (1 - slip.get()) }],
  }));
  const leftStyle = useAnimatedStyle(() => {
    const p = tear.get();
    return {
      opacity: p < 0.85 ? 1 : (1 - p) / 0.15,
      transform: [
        { translateX: flyX * p },
        { translateY: 150 * p },
        { scale: 1 - 0.7 * p },
        { rotate: `${10 * p}deg` },
      ],
    };
  });
  const rightStyle = useAnimatedStyle(() => {
    const p = tear.get();
    return {
      opacity: 1 - p,
      transformOrigin: '50% 0%',
      transform: [
        { translateX: 10 * p },
        { translateY: 150 * p },
        { rotate: `${4 * p}deg` },
        { scale: 1 - 0.4 * p },
      ],
    };
  });
  const fillStyle = useAnimatedStyle(() => ({
    height: `${(from + (to - from) * fill.get()) * 100}%`,
  }));

  const place = (save: boolean) => {
    if (answered.current) return;
    answered.current = true;
    haptics.tap();
    const jarFirst = { potId: jarId, amount: part };
    onPlace(
      save ? { moneyIn: 'saved', savedTo: FUTURE_YOU, jarFirst } : { moneyIn: 'spread', jarFirst },
    );
  };

  const piece = (kicker: string, amount: number) => (
    <>
      <Text style={{ ...mono(9.5, 500, 0.1), color: seasonInk.slipSoft }} numberOfLines={1}>
        {kicker.toUpperCase()}
      </Text>
      <Text style={{ ...mono(16, 600), color: seasonInk.slipInk }} numberOfLines={1}>
        {money.number(amount)}
      </Text>
    </>
  );

  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1 }}>
      <WordFitText
        style={{ ...leading(display(44, 500), 44.9), color: palette.ink, paddingTop: 26 }}
      >
        {t('season.bonus.title', { festival })}
      </WordFitText>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: STAGE, marginTop: 22 }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              flexDirection: 'row',
            },
            slipStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: LEFT_PIECE,
                paddingTop: 12,
                paddingHorizontal: 12,
                paddingBottom: 10,
                backgroundColor: seasonInk.slipPaper,
                // Each piece casts its own shadow, so none is left behind once they have gone.
                boxShadow: seasonInk.slipShadow,
                borderRightWidth: 2,
                borderStyle: 'dashed',
                borderRightColor: seasonInk.slipPerforation,
              },
              leftStyle,
            ]}
          >
            {piece(t('season.bonus.slipJar', { festival }), part)}
          </Animated.View>
          <Animated.View
            style={[
              {
                width: Math.max(160, Math.min(226, width - LEFT_PIECE)),
                paddingTop: 12,
                paddingHorizontal: 14,
                paddingBottom: 10,
                backgroundColor: seasonInk.slipPaper,
                boxShadow: seasonInk.slipShadow,
              },
              rightStyle,
            ]}
          >
            {piece(`+ ${said} · ${clock}`, rest)}
          </Animated.View>
        </Animated.View>
        <View style={{ position: 'absolute', right: 14, top: 96, width: JAR_W, height: JAR_H }}>
          <View
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              top: 0,
              height: 12,
              borderRadius: 5,
              backgroundColor: c.lid,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 2,
              right: 2,
              top: 10,
              bottom: 0,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              backgroundColor: c.glass,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,.2)',
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.fill },
                fillStyle,
              ]}
            />
            <View
              style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol name="local_florist" size={30} fill={1} color={c.iconHigh} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={{
              position: 'absolute',
              left: -20,
              right: -20,
              bottom: -22,
              textAlign: 'center',
              ...body(12, 650),
              color: palette.ink,
            }}
          >
            {full
              ? t('season.bonus.jarFull', { festival })
              : t('season.bonus.jarIn', { festival, amount: money.short(part) })}
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 270, gap: 8 }}>
          {rest > 0 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 112 }}>
                {bars.map((h, i) => (
                  <Bar key={i} height={h} rise={rise} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...mono(10, 400, 0.1), color: palette.inkSoft }}>
                  {t('season.bonus.today')}
                </Text>
                <Text style={{ ...mono(10, 400, 0.1), color: palette.inkSoft }}>
                  {t('season.bonus.payday', { date: payday.toUpperCase() })}
                </Text>
              </View>
              <Text style={{ ...body(13, 650), color: palette.ink }}>
                {t('season.bonus.spread', {
                  amount: money.short(rest),
                  daily: money.short(daily),
                  date: payday,
                })}
              </Text>
            </>
          ) : (
            <Text style={{ ...body(13, 650), color: palette.ink, paddingTop: 120 }}>
              {t('season.bonus.allIn')}
            </Text>
          )}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <PressScale
        accessibilityRole="button"
        scaleTo={0.97}
        onPress={() => place(false)}
        style={{
          height: 56,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 650), color: palette.btnFg }}>
          {rest > 0 ? t('season.bonus.yes') : t('season.bonus.yesAll')}
        </Text>
      </PressScale>
      {rest > 0 && canSave ? (
        <PressScale
          accessibilityRole="button"
          onPress={() => place(true)}
          style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ ...body(15), color: palette.inkSoft }}>
            {t('season.bonus.save', { amount: money.short(rest) })}
          </Text>
        </PressScale>
      ) : null}
    </Animated.View>
  );
}

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MOST_ENVELOPES } from '@6pm/domain';
import { curves, seasonInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { FanEnvelope } from '../pots/envelopes';
import { jarColours } from '../pots/jar-colours';

const spread = Easing.bezier(...curves.jarIn);
const FAN_MS = 450;

/** The quick add's three modes in the season: the keypad, lì xì by the envelope, and voice. */
export type QuickMode = 'keypad' | 'envelopes';

/**
 * The header's mode switch in the season (Tết Season canvas, second phone): Keypad, the lì xì
 * mode in the season's red, and Voice, which opens the microphone over the keypad as the mic
 * button does.
 */
export function QuickModeSwitch({
  mode,
  envelope,
  listening,
  onMode,
  onVoice,
}: {
  readonly mode: QuickMode;
  /** The lì xì mode's name in the season's words ("Lì xì", "세뱃돈"). */
  readonly envelope: string;
  readonly listening: boolean;
  readonly onMode: (mode: QuickMode) => void;
  readonly onVoice: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const segment = (label: string, on: boolean, red: boolean, onPress: () => void) => (
    <PressScale
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 99,
        backgroundColor: on ? (red ? seasonInk.red : palette.btnBg) : 'transparent',
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          ...body(13, on ? 650 : 600),
          color: on ? (red ? seasonInk.onRed : palette.btnFg) : palette.ink,
        }}
      >
        {label}
      </Text>
    </PressScale>
  );
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: 99,
        backgroundColor: palette.chipBg,
      }}
    >
      {segment(t('season.quick.keypad'), mode === 'keypad' && !listening, false, () =>
        onMode('keypad'),
      )}
      {segment(envelope, mode === 'envelopes', true, () => onMode('envelopes'))}
      {segment(t('season.quick.voice'), listening, false, onVoice)}
    </View>
  );
}

/** One envelope of the fan, turning to its place on (.3,1.3,.5,1) as the count changes. */
function Fanned({ angle, each }: { readonly angle: number; readonly each: string }) {
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.set(
      withTiming(angle, { duration: FAN_MS, easing: spread, reduceMotion: ReduceMotion.System }),
    );
  }, [turn, angle]);
  const style = useAnimatedStyle(() => ({
    transformOrigin: '50% 100%',
    transform: [{ rotate: `${turn.get()}deg` }, { translateY: -8 }],
  }));
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[{ position: 'absolute', left: -36, bottom: 0 }, style]}
    >
      <FanEnvelope each={each} />
    </Animated.View>
  );
}

/** Where the envelopes go: out of the Tết jar, counted today, or saved for Future you. */
export interface EnvelopeDestination {
  readonly kind: 'jar' | 'today' | 'saved';
  readonly title: string;
  readonly sub: string;
  /** The jar's hue and how full it is, before and after (0 to 1). */
  readonly hue: number;
  readonly level: number;
}

/**
 * Quick add's lì xì mode (Tết Season canvas, second phone): Given or Received, a fan of red
 * envelopes, "5 bao × 200k = 1tr", − and + to take one off or deal one more onto the fan (light
 * haptic each), what each holds, and where it goes. Today's number never moves while counting.
 */
export function LixiMode({
  given,
  count,
  each,
  amounts,
  total,
  destination,
  onGiven,
  onCount,
  onEach,
}: {
  readonly given: boolean;
  readonly count: number;
  readonly each: number;
  readonly amounts: readonly number[];
  readonly total: number;
  readonly destination: EnvelopeDestination;
  readonly onGiven: (given: boolean) => void;
  readonly onCount: (count: number) => void;
  readonly onEach: (each: number) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const eachText = money.short(each);
  const step = count === 1 ? 0 : Math.min(14, 70 / (count - 1));
  // Received points the other way: the given arrow turned round (the icon font has no south-west).
  const directions: readonly [boolean, string, SymbolName, number][] = [
    [true, t('season.quick.given'), 'north_east', 0],
    [false, t('season.quick.received'), 'north_east', 180],
  ];
  const c = jarColours(destination.hue);
  const level = useSharedValue(destination.level);
  useEffect(() => {
    level.set(
      withTiming(destination.level, {
        duration: 400,
        easing: spread,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [level, destination.level]);
  const levelStyle = useAnimatedStyle(() => ({ height: `${Math.max(0.04, level.get()) * 100}%` }));
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          padding: 3,
          borderRadius: 13,
          backgroundColor: palette.chipBg,
        }}
      >
        {directions.map(([value, label, icon, turn]) => (
          <PressScale
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: given === value }}
            onPress={() => {
              if (given === value) return;
              haptics.tick();
              onGiven(value);
            }}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 10,
              backgroundColor: given === value ? palette.glass : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Symbol
              name={icon}
              size={18}
              color={palette.ink}
              style={{ transform: [{ rotate: `${turn}deg` }] }}
            />
            <Text style={{ ...body(14, 650), color: palette.ink }}>{label}</Text>
          </PressScale>
        ))}
      </View>
      <View
        style={{ height: 230 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={{ position: 'absolute', left: '50%', bottom: 6, width: 0, height: 0 }}>
          {Array.from({ length: count }, (_, i) => (
            <Fanned
              key={i}
              angle={count === 1 ? 0 : (i - (count - 1) / 2) * step}
              each={eachText}
            />
          ))}
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text style={{ ...leading(display(38, 500), 38, true), color: palette.ink }}>
          {t('season.quick.count', { count, each: eachText })}
        </Text>
        <Text style={{ ...leading(display(20, 500), 24, true), color: palette.inkSoft }}>
          {t('season.quick.total', { amount: money.short(total) })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('season.quick.less')}
          scaleTo={0.92}
          disabled={count <= 1}
          onPress={() => {
            haptics.tick();
            onCount(count - 1);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: count <= 1 ? 0.5 : 1,
          }}
        >
          <Symbol name="remove" size={26} color={palette.ink} />
        </PressScale>
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {amounts.map((amount) => {
            const on = amount === each;
            return (
              <PressScale
                key={amount}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  if (on) return;
                  haptics.tick();
                  onEach(amount);
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: on ? palette.btnBg : palette.chipBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{ ...body(14, 650), color: on ? palette.btnFg : palette.ink }}
                >
                  {money.short(amount)}
                </Text>
              </PressScale>
            );
          })}
        </View>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('season.quick.more')}
          scaleTo={0.92}
          disabled={count >= MOST_ENVELOPES}
          onPress={() => {
            haptics.tap();
            onCount(count + 1);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: seasonInk.red,
            boxShadow: seasonInk.redShadow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="add" size={26} color={seasonInk.onRed} />
        </PressScale>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: palette.cell,
        }}
      >
        <View style={{ width: 26, height: 34 }}>
          <View
            style={{
              position: 'absolute',
              left: 7,
              right: 7,
              top: 0,
              height: 5,
              borderRadius: 2,
              backgroundColor: c.lid,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 4,
              bottom: 0,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 9,
              borderBottomRightRadius: 9,
              backgroundColor: c.glass,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,.18)',
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.fill },
                levelStyle,
              ]}
            />
          </View>
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ ...body(14.5, 650), color: palette.ink }}>{destination.title}</Text>
          <Text style={{ ...body(12.5), color: palette.inkSoft }}>{destination.sub}</Text>
        </View>
      </View>
    </View>
  );
}

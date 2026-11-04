import { useEffect, type ReactNode } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves, durations } from '@6pm/theme';

import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { jarColours, PARTNER_BADGE, PAST_DATE_WARM } from './jar-colours';

const FILL_EASE = Easing.bezier(...curves.jarFill);

/** What the jar shows beyond its fill: the edge states are drawn on the jar itself. */
export type JarState = 'normal' | 'paused' | 'pastDate' | 'full' | 'empty';

export interface JarProps {
  /** Outer size; everything inside scales from the shelf jar's 52 × 66. */
  readonly width: number;
  readonly height: number;
  readonly hue: number;
  /** A Material Symbols name; Future you's jar draws its sun instead. */
  readonly icon: string;
  readonly futureYou?: boolean;
  /**
   * How full, 0 to 1: what it holds over its target. A jar with no target is drawn at a steady
   * level (see `jarLevel`). A shared value moves on the UI thread (a hold, a slider).
   */
  readonly level: number | SharedValue<number>;
  /** The dashed target line near the neck: shown when the jar has a target and is not full. */
  readonly target?: boolean;
  readonly state?: JarState;
  /** A shared jar: the partner's initial and the part they put in (0 to 1 of the target). */
  readonly partner?: { readonly initial: string; readonly level: number } | null;
  /** The page behind the jar, for the ring around a badge. */
  readonly ringColor: string;
  /** Pressed (a hold to top up): scales to .94 on the pop spring. */
  readonly pressed?: SharedValue<number>;
  /** The surface sloshes slowly (a jar's page). */
  readonly slosh?: boolean;
  readonly children?: ReactNode;
  readonly style?: ViewProps['style'];
}

/** How full a jar is drawn: its share of the target, or a steady level for one with none. */
export function jarLevel(saved: number, target: number): number {
  if (target > 0) return Math.max(0, Math.min(1, saved / target));
  return saved > 0 ? 0.62 : 0;
}

/**
 * Every jar in the app: the shelf, the Pots list, a jar's page, Plan, the close, Details and
 * onboarding all draw this one. A lid, a glass body, what it holds rising from the bottom with the
 * jar curve, a highlight, the icon, and its state drawn on the glass (dim when paused, a warm
 * target line past its date, a check when full, a drip when spent to empty, two colours shared).
 */
export function Jar({
  width,
  height,
  hue,
  icon,
  futureYou = false,
  level,
  target = false,
  state = 'normal',
  partner = null,
  ringColor,
  pressed,
  slosh = false,
  children,
  style,
}: JarProps) {
  const c = jarColours(hue);
  const k = width / 52;
  const lidH = Math.max(3, Math.round(8 * (height / 66)));
  const bodyTop = Math.round(6 * (height / 66));
  const bodyH = height - bodyTop;
  const lineTop = Math.round(bodyH * 0.16);
  const showTarget = (target && state !== 'full') || state === 'pastDate';
  // With a target line, the target is the line; a full jar fills to the brim.
  const room = showTarget ? (bodyH - lineTop) / bodyH : 1;

  const fallback = useSharedValue(typeof level === 'number' ? level : 0);
  const shared = typeof level === 'number' ? null : level;
  useEffect(() => {
    if (typeof level !== 'number') return;
    fallback.value = withTiming(level, {
      duration: durations.jarFill,
      easing: FILL_EASE,
      reduceMotion: ReduceMotion.System,
    });
  }, [fallback, level]);
  const source = shared ?? fallback;
  const drawn = useDerivedValue(() => {
    const v = Math.max(0, Math.min(1, source.value));
    if (state === 'empty') return 0.03;
    if (state === 'paused') return 0;
    return state === 'full' ? 1 : Math.max(0.05, v * room);
  });
  const fillStyle = useAnimatedStyle(() => ({ height: `${drawn.value * 100}%` }));
  const partnerLevel = partner ? Math.max(0, Math.min(1, partner.level)) * room : 0;
  // The partner's part sits under one's own, inside what the jar holds.
  const partnerStyle = useAnimatedStyle(() => ({
    height: `${Math.min(100, (partnerLevel / Math.max(0.01, drawn.value)) * 100)}%`,
  }));
  const iconHigh = useDerivedValue(() => drawn.value > 0.48);
  const iconLowStyle = useAnimatedStyle(() => ({ opacity: iconHigh.value ? 0 : 1 }));
  const iconHighStyle = useAnimatedStyle(() => ({ opacity: iconHigh.value ? 1 : 0 }));

  const wave = useSharedValue(0);
  useEffect(() => {
    if (!slosh) return;
    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );
  }, [slosh, wave]);
  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -3 * k * wave.value }, { scaleY: 1 + 0.04 * wave.value }],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed ? 1 - 0.06 * pressed.value : 1 }],
  }));

  const iconSize = Math.round(20 * k);
  const glyph = (color: string) =>
    futureYou ? (
      <Sun size={iconSize} color={color} />
    ) : isSymbolName(icon) ? (
      <Symbol name={icon} size={iconSize} fill={1} weight={500} color={color} />
    ) : null;
  const badge = Math.round(Math.max(18, 20 * Math.min(1.2, k)));

  return (
    <View style={[{ width, height }, style]}>
      <Animated.View style={[{ width, height }, pressStyle]}>
        <View
          style={{
            position: 'absolute',
            left: Math.round(14 * k),
            right: Math.round(14 * k),
            top: 0,
            height: lidH,
            borderRadius: Math.max(2, lidH / 2),
            backgroundColor: c.lid,
            opacity: state === 'paused' ? 0.7 : 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: bodyTop,
            bottom: 0,
            borderTopLeftRadius: 15 * k,
            borderTopRightRadius: 15 * k,
            borderBottomLeftRadius: 18 * k,
            borderBottomRightRadius: 18 * k,
            backgroundColor: c.glass,
            borderWidth: state === 'paused' ? 1.5 : 1,
            borderStyle: state === 'paused' ? 'dashed' : 'solid',
            borderColor:
              state === 'paused'
                ? 'rgba(255,255,255,0.25)'
                : state === 'full'
                  ? 'rgba(255,255,255,0.25)'
                  : 'rgba(255,255,255,0.14)',
            overflow: 'hidden',
            boxShadow: state === 'full' ? `0 0 ${Math.round(26 * k)}px ${c.glow}` : undefined,
          }}
        >
          <Animated.View
            style={[
              { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.fill },
              fillStyle,
            ]}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: -4 * k,
                  right: -4 * k,
                  top: 0,
                  height: 2,
                  backgroundColor: state === 'full' ? c.fill : c.fillTop,
                },
                surfaceStyle,
              ]}
            />
            {partner ? (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: c.partner,
                  },
                  partnerStyle,
                ]}
              />
            ) : null}
          </Animated.View>
          {showTarget ? (
            <View
              style={{
                position: 'absolute',
                left: 8 * k,
                right: 8 * k,
                top: lineTop,
                borderTopWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: state === 'pastDate' ? PAST_DATE_WARM : 'rgba(251,244,236,0.45)',
              }}
            />
          ) : null}
          <View
            style={{
              position: 'absolute',
              left: 6 * k,
              top: 9 * k,
              width: Math.max(2, 4 * k),
              height: '38%',
              borderRadius: 4 * k,
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {state === 'paused' ? (
              <PauseGlyph size={iconSize} color="rgba(251,244,236,0.5)" />
            ) : (
              <>
                <Animated.View style={[{ position: 'absolute' }, iconLowStyle]}>
                  {glyph(c.iconLow)}
                </Animated.View>
                <Animated.View style={[{ position: 'absolute' }, iconHighStyle]}>
                  {glyph(c.iconHigh)}
                </Animated.View>
              </>
            )}
          </View>
        </View>
        {partner ? (
          <View
            style={{
              position: 'absolute',
              right: -5,
              bottom: -3,
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: PARTNER_BADGE.bg,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 0 2px ${ringColor}`,
            }}
          >
            <Text
              style={{ fontSize: badge / 2, fontWeight: '800', color: PARTNER_BADGE.fg }}
              allowFontScaling={false}
            >
              {partner.initial}
            </Text>
          </View>
        ) : null}
        {state === 'empty' ? <Drip hue={hue} k={k} /> : null}
        {children}
      </Animated.View>
    </View>
  );
}

/** Future you's sun: a disc and eight short rays, in the icon's colour. */
function Sun({ size, color }: { readonly size: number; readonly color: string }) {
  const disc = size * 0.42;
  const ray = size * 0.16;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: Math.max(1.5, size * 0.09),
            height: ray,
            borderRadius: size,
            backgroundColor: color,
            transform: [{ rotate: `${i * 45}deg` }, { translateY: -size * 0.4 }],
          }}
        />
      ))}
      <View style={{ width: disc, height: disc, borderRadius: disc, backgroundColor: color }} />
    </View>
  );
}

function PauseGlyph({ size, color }: { readonly size: number; readonly color: string }) {
  const bar = {
    width: size * 0.16,
    height: size * 0.55,
    borderRadius: size,
    backgroundColor: color,
  };
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.14 }}>
      <View style={bar} />
      <View style={bar} />
    </View>
  );
}

/** The last drip of a jar spent to empty. */
function Drip({ hue, k }: { readonly hue: number; readonly k: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.in(Easing.quad) }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.2 ? t.value * 5 : 1 - t.value,
    transform: [{ translateY: 22 * k * t.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          bottom: -6 * k,
          width: 5 * k,
          height: 7 * k,
          marginLeft: -2.5 * k,
          borderRadius: 4 * k,
          backgroundColor: jarColours(hue).fill,
        },
        style,
      ]}
    />
  );
}

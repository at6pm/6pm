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
import { useTheme } from '../../ui/theme/theme';
import { jarColours, PARTNER_BADGE, PAST_DATE_WARM, TARGET_LINE } from './jar-colours';
import { jarGeometry } from './jar-geometry';

const FILL_EASE = Easing.bezier(...curves.jarFill);
const CHECK_EASE = Easing.bezier(...curves.jarCheck);

/** What the jar shows beyond its fill: the edge states are drawn on the jar itself. */
export type JarState = 'normal' | 'paused' | 'pastDate' | 'full' | 'empty';

export interface JarProps {
  /** Outer size; the proportions follow the canvases' sizes (see `jarGeometry`). */
  readonly width: number;
  readonly height: number;
  readonly hue: number;
  /** A Material Symbols name; Future you's jar draws its sun instead. */
  readonly icon: string;
  readonly futureYou?: boolean;
  /**
   * How full, 0 to 1, of the glass: what it holds over its target. A jar with no target is drawn
   * at a steady level (see `jarLevel`). A shared value moves on the UI thread (a slider).
   */
  readonly level: number | SharedValue<number>;
  /** The dashed target line near the neck: shown when the jar has a target and is not full. */
  readonly target?: boolean;
  readonly state?: JarState;
  /** A shared jar: the partner's initial and the part they put in (0 to 1 of the glass). */
  readonly partner?: { readonly initial: string; readonly level: number } | null;
  /** The page behind the jar, for the ring around a badge. */
  readonly ringColor: string;
  /** The surface sloshes slowly (a jar's page). */
  readonly slosh?: boolean;
  /** No icon and no highlight: the Pots list's small jar. */
  readonly plain?: boolean;
  /** The least it is drawn holding; the canvases keep a sliver (5%) in an empty jar. */
  readonly minFill?: number;
  readonly children?: ReactNode;
  readonly style?: ViewProps['style'];
}

/** How full a jar is drawn: its share of the target, or a steady level for one with none. */
export function jarLevel(saved: number, target: number): number {
  if (target > 0) return Math.max(0, Math.min(1, saved / target));
  return saved > 0 ? 0.62 : 0;
}

/** Future you's jar on its page: the fill rises with the slice, as the canvas's slider moves it. */
export function futureYouLevel(slicePercent: number): number {
  'worklet';
  return Math.max(0, Math.min(1, (42 + slicePercent * 1.6) / 100));
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
  slosh = false,
  plain = false,
  minFill = 0.05,
  children,
  style,
}: JarProps) {
  const c = jarColours(hue);
  const g = jarGeometry(width, height);
  const showTarget = (target && state !== 'full') || state === 'pastDate';

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
    return state === 'full' ? 1 : Math.max(minFill, v);
  });
  const fillStyle = useAnimatedStyle(() => ({ height: `${drawn.value * 100}%` }));
  const partnerLevel = partner ? Math.max(0, Math.min(1, partner.level)) : 0;
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
  const k = width / 52;
  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -3 * k * wave.value }, { scaleY: 1 + 0.04 * wave.value }],
  }));
  // The sloshing fill reaches past the glass by more than it sways, so its edge never shows.
  const sloshReach = Math.ceil(3 * k) + 2;

  const glyph = (color: string) =>
    futureYou ? (
      <Sun size={g.icon} color={color} />
    ) : isSymbolName(icon) ? (
      <Symbol name={icon} size={g.icon} fill={1} weight={500} color={color} />
    ) : null;
  const bodyH = height - g.bodyTop;
  const borderColor =
    state === 'paused' || state === 'full'
      ? 'rgba(255,255,255,0.25)'
      : `rgba(255,255,255,${g.borderAlpha})`;
  const glow = state === 'full' ? `0 0 ${Math.round(26 * Math.min(1.4, k))}px ${c.glow}` : null;
  const inner = width >= 120 ? 'inset 0 -14px 26px rgba(0,0,0,0.16)' : null;
  // Small jars wear the partner's initial at the foot; the larger ones carry badges up top.
  const badgeHigh = width >= 64;

  return (
    <View style={[{ width, height }, style]}>
      <View style={{ width, height }}>
        <View
          style={{
            position: 'absolute',
            left: g.lidInset,
            right: g.lidInset,
            top: 0,
            height: g.lidH,
            borderRadius: Math.max(2, g.lidH / 2),
            backgroundColor: c.lid,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: g.bodyInset,
            right: g.bodyInset,
            top: g.bodyTop,
            bottom: 0,
            borderTopLeftRadius: g.radiusTop,
            borderTopRightRadius: g.radiusTop,
            borderBottomLeftRadius: g.radiusBottom,
            borderBottomRightRadius: g.radiusBottom,
            backgroundColor: c.glass,
            borderWidth: state === 'paused' ? 1.5 : 1,
            borderStyle: state === 'paused' ? 'dashed' : 'solid',
            borderColor,
            overflow: 'hidden',
            boxShadow: [glow, inner].filter((s) => s !== null).join(', ') || undefined,
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: slosh ? -sloshReach : 0,
                right: slosh ? -sloshReach : 0,
                bottom: 0,
                backgroundColor: c.fill,
                overflow: 'hidden',
              },
              fillStyle,
              slosh ? surfaceStyle : null,
            ]}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 2,
                backgroundColor: state === 'full' ? c.fill : c.fillTop,
              }}
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
                left: g.lineInset,
                right: g.lineInset,
                top: g.lineTop,
                borderTopWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: state === 'pastDate' ? PAST_DATE_WARM : TARGET_LINE,
              }}
            />
          ) : null}
          {plain ? null : (
            <View
              style={{
                position: 'absolute',
                left: g.shineLeft,
                top: g.shineTop,
                width: g.shineW,
                height: bodyH * g.shineH,
                borderRadius: g.shineW,
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            />
          )}
          {plain ? null : (
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
                <PauseGlyph size={g.icon} color="rgba(251,244,236,0.5)" />
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
          )}
        </View>
        {partner ? (
          <Badge
            size={g.badge}
            out={g.badgeOut}
            high={badgeHigh}
            bg={PARTNER_BADGE.bg}
            ringColor={ringColor}
          >
            <Text
              style={{ fontSize: g.badge * 0.5, fontWeight: '800', color: PARTNER_BADGE.fg }}
              allowFontScaling={false}
            >
              {partner.initial}
            </Text>
          </Badge>
        ) : state === 'full' ? (
          <CheckBadge size={g.badge} out={g.badgeOut} ringColor={ringColor} />
        ) : null}
        {state === 'empty' ? <Drip hue={hue} k={k} /> : null}
        {children}
      </View>
    </View>
  );
}

function Badge({
  size,
  out,
  high,
  bg,
  ringColor,
  children,
}: {
  readonly size: number;
  readonly out: number;
  readonly high: boolean;
  readonly bg: string;
  readonly ringColor: string;
  readonly children: ReactNode;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        right: -out,
        ...(high ? { top: -4 } : { bottom: -3 }),
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 0 2px ${ringColor}`,
      }}
    >
      {children}
    </View>
  );
}

/** A full jar's check, stamped on with the check curve the moment it fills. */
function CheckBadge({
  size,
  out,
  ringColor,
}: {
  readonly size: number;
  readonly out: number;
  readonly ringColor: string;
}) {
  const { palette } = useTheme();
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withTiming(1, {
      duration: 420,
      easing: CHECK_EASE,
      reduceMotion: ReduceMotion.System,
    });
  }, [shown]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: shown.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', right: -out, top: -4 }, style]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 0 2px ${ringColor}`,
        }}
      >
        <Symbol name="check" size={Math.round(size * 0.62)} color={palette.btnFg} />
      </View>
    </Animated.View>
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

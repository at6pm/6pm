import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { useMoneyFormat } from '../../money/use-money-format';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { useTheme } from '../../ui/theme/theme';
import { body, display, tabular } from '../../ui/type/fonts';
import { jarColours } from '../pots/jar-colours';

const enter = Easing.bezier(...curves.enter);
/** The canvas's darker glass under the sky ("rgba(20,10,30,.3)"). */
export const CLOSE_SHADE = 'rgba(20,10,30,.3)';
/** The part that still counts never draws thinner than this share of the jar's part. */
const REST_MIN = 0.22;

/**
 * "All of the jar 6tr | 1tr": a spend bigger than its jar, split. The jar's part draws first
 * (growX 800 ms), the part that counts today snaps on after it. `pour` drains the jar's part
 * (900 ms) and slides the rest down into the day's receipt.
 */
export function JarSplit({
  hue,
  icon,
  label,
  cover,
  rest,
  pour,
}: {
  readonly hue: number;
  readonly icon: string;
  readonly label: string;
  readonly cover: number;
  readonly rest: number;
  /** 0 at rest, 1 once poured. */
  readonly pour?: SharedValue<number>;
}) {
  const money = useMoneyFormat();
  const { palette } = useTheme();
  const c = jarColours(hue);
  const jar = useSharedValue(0);
  const day = useSharedValue(0);
  useEffect(() => {
    const motion = { easing: enter, reduceMotion: ReduceMotion.System };
    jar.set(withDelay(200, withTiming(1, { ...motion, duration: 800 })));
    day.set(withDelay(1000, withTiming(1, { ...motion, duration: 500 })));
  }, [jar, day]);
  const jarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: jar.get() * (1 - (pour?.get() ?? 0)) }],
    opacity: 1 - 0.6 * (pour?.get() ?? 0),
  }));
  const dayStyle = useAnimatedStyle(() => {
    const p = pour?.get() ?? 0;
    return {
      transform: [{ scaleX: day.get() }, { translateY: 40 * p }],
      opacity: 1 - p,
    };
  });
  return (
    <View style={{ flexDirection: 'row', height: 54, gap: 3 }}>
      <Animated.View
        style={[
          {
            flex: cover,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            backgroundColor: c.fill,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            transformOrigin: 'left center',
          },
          jarStyle,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 }}>
          {isSymbolName(icon) ? <Symbol name={icon} size={17} fill={1} color={c.iconHigh} /> : null}
          <Text numberOfLines={1} style={{ ...body(13, 700), color: c.iconHigh, flexShrink: 1 }}>
            {label}
          </Text>
        </View>
        <Text style={{ ...display(20, 600), ...tabular, color: c.iconHigh }}>
          {money.short(cover)}
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          {
            flex: Math.max(rest, cover * REST_MIN),
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            backgroundColor: palette.accent,
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'left center',
          },
          dayStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={{ ...display(18, 600), ...tabular, color: palette.accentFg }}
        >
          {money.short(rest)}
        </Text>
      </Animated.View>
    </View>
  );
}

/**
 * "Tomorrow 353k → 308k": what tomorrow would be with the jar taking it all, struck through, and
 * what it is with the part the jar could not hold counted today, coming in once the strike lands.
 */
export function TomorrowCost({
  label,
  from,
  to,
}: {
  readonly label: string;
  readonly from: number;
  readonly to: number;
}) {
  const money = useMoneyFormat();
  const { palette } = useTheme();
  const strike = useSharedValue(0);
  const next = useSharedValue(0);
  useEffect(() => {
    const motion = { easing: enter, reduceMotion: ReduceMotion.System };
    strike.set(withDelay(1300, withTiming(1, { ...motion, duration: 300 })));
    next.set(withDelay(1500, withTiming(1, { ...motion, duration: 450 })));
  }, [strike, next]);
  const strikeStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: strike.get() }] }));
  const fromStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.5 * strike.get() }));
  const toStyle = useAnimatedStyle(() => ({
    opacity: next.get(),
    transform: [{ translateY: -8 * (1 - next.get()) }],
  }));
  const number = { ...display(20), ...tabular, color: palette.ink };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: CLOSE_SHADE,
      }}
    >
      <Symbol name="wb_twilight" size={20} color={palette.accent} />
      <Text style={{ ...body(14.5, 600), color: palette.ink, flex: 1 }}>{label}</Text>
      <Animated.View style={fromStyle}>
        <Text style={number}>{money.short(from)}</Text>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: '52%',
              height: 1.5,
              backgroundColor: palette.ink,
              transformOrigin: 'left center',
            },
            strikeStyle,
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[{ flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: -5 }, toStyle]}
      >
        <Text style={number}>→</Text>
        <Text style={number}>{money.short(to)}</Text>
      </Animated.View>
    </View>
  );
}

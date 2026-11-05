import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, owedInk } from '@6pm/theme';

import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { display, mono, tabular } from '../../ui/type/fonts';

/** The tab spring the strips re-tear on: (.3, 1.3, .5, 1), 550 ms. */
const tear = Easing.bezier(...curves.jarIn);
const TEAR_MS = 550;

export interface Strip {
  readonly key: string;
  /** Upper case, as the strip prints it: "YOU", "LINH". */
  readonly label: string;
  /** "300k", or empty for a person left out. */
  readonly amount: string;
  /** How wide it tears: its share of the bill; 0 folds it away. */
  readonly grow: number;
  readonly mine: boolean;
  /** Typing this person's share (by amount): the strip opens the keypad. */
  readonly onPress?: (() => void) | undefined;
  readonly accessibilityLabel?: string;
}

/**
 * The dashed tear down a strip's left side. iOS dashes a border only when all four sides are
 * dashed, so a dashed box is clipped to its left edge.
 */
export function VerticalTear({ color = owedInk.perf }: { readonly color?: string }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: -2,
          bottom: -2,
          width: 5,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: color,
        }}
      />
    </View>
  );
}

function StripView({ strip, first }: { readonly strip: Strip; readonly first: boolean }) {
  const { palette } = useTheme();
  const grow = useSharedValue(strip.grow);
  const shown = useSharedValue(strip.grow > 0 ? 1 : 0);
  useEffect(() => {
    grow.set(
      withTiming(strip.grow, {
        duration: TEAR_MS,
        easing: tear,
        reduceMotion: ReduceMotion.System,
      }),
    );
    shown.set(
      withTiming(strip.grow > 0 ? 1 : 0, { duration: 300, reduceMotion: ReduceMotion.System }),
    );
  }, [strip.grow, grow, shown]);
  const style = useAnimatedStyle(() => ({
    flexGrow: Math.max(0, grow.get()),
    opacity: shown.get(),
  }));
  const ink = strip.mine ? palette.accentFg : owedInk.ink;
  const body = (
    <View
      style={{
        position: 'absolute',
        top: 12,
        bottom: 12,
        left: 10,
        right: 10,
        justifyContent: 'space-between',
      }}
    >
      <Text numberOfLines={1} style={{ ...mono(10.5, 600, 0.12), color: ink }}>
        {strip.label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={{ ...display(21, 500, -0.02), ...tabular, color: ink }}
      >
        {strip.amount}
      </Text>
    </View>
  );
  return (
    <Animated.View
      style={[
        {
          flexBasis: 0,
          minWidth: 0,
          overflow: 'hidden',
          backgroundColor: strip.mine ? palette.accent : owedInk.paper,
        },
        style,
      ]}
    >
      {strip.onPress ? (
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={strip.accessibilityLabel}
          onPress={strip.onPress}
          style={{ flex: 1 }}
        >
          {body}
        </PressScale>
      ) : (
        body
      )}
      {first || strip.mine ? null : <VerticalTear />}
    </Animated.View>
  );
}

/**
 * The bill torn into strips, one per person: the user's first, in the look's accent, then each
 * other share on the paper with a dashed tear between. Each strip's width is its share, and every
 * change re-tears them on the tab spring.
 */
export function TornBill({ strips }: { readonly strips: readonly Strip[] }) {
  return (
    <View style={{ boxShadow: `0 16px 24px ${owedInk.billShadow}` }}>
      <View style={{ transform: [{ scaleY: -1 }] }}>
        <PaperEdge color={owedInk.paper} height={9} shadow={false} />
      </View>
      <View style={{ flexDirection: 'row', height: 176, backgroundColor: owedInk.paper }}>
        {strips.map((strip, i) => (
          <StripView key={strip.key} strip={strip} first={i === 0} />
        ))}
      </View>
      <PaperEdge color={owedInk.paper} height={9} shadow={false} />
    </View>
  );
}

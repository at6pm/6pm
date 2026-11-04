import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { Symbol } from '../../ui/icons/symbol';
import { PaperEdge } from '../../ui/paper-edge';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Jar } from '../pots/jar';
import { jarColours } from '../pots/jar-colours';
import { SlipText, type SlipLine } from './close-work-question';

const enter = Easing.bezier(...curves.enter);
const beadEase = Easing.bezier(0.45, 0, 0.6, 1);
const motion = { reduceMotion: ReduceMotion.System };
/** The beads that pour out, by size; each leaves 90 ms after the one before. */
const BEADS = [7, 9, 8, 6, 7] as const;
const TIP_MS = 500;
const POUR_AT = 400;
const DRAIN_MS = 700;
/** The jar rights itself once it has drained. */
const RIGHT_AT = POUR_AT + DRAIN_MS;
/** From Yes until the jar stands again and the tag has risen. */
export const POUR_MS = RIGHT_AT + TIP_MS + 300;
/** The slip sliding down into the day's receipt. */
export const SLIDE_MS = 450;

/**
 * The close's "From your {jar} jar?" picture: the slip, and the jar above it. Told to `pour`, the
 * jar tips 38° from its heel, five beads arc onto the slip 90 ms apart while its fill drains, it
 * rights itself (`onRighted`, for the haptic) and "4,2tr → 3tr" rises beside it. Told to
 * `slide`, the slip slides down into the day's receipt.
 */
export function JarPour({
  hue,
  icon,
  futureYou,
  level,
  levelAfter,
  tag,
  slip,
  pour,
  slide,
  onRighted,
}: {
  readonly hue: number;
  readonly icon: string;
  readonly futureYou: boolean;
  readonly level: number;
  readonly levelAfter: number;
  /** "4,2tr → 3tr": what the jar held, and holds after. */
  readonly tag: { readonly from: string; readonly to: string };
  readonly slip: SlipLine;
  readonly pour: boolean;
  readonly slide: boolean;
  readonly onRighted: () => void;
}) {
  const { palette } = useTheme();
  const c = jarColours(hue);
  const tip = useSharedValue(0);
  const fill = useSharedValue(level);
  const beads = useSharedValue(0);
  const rose = useSharedValue(0);
  const gone = useSharedValue(0);

  useEffect(() => {
    if (!pour) return;
    tip.set(
      withSequence(
        withTiming(1, { duration: TIP_MS, easing: enter, ...motion }),
        withDelay(
          RIGHT_AT - TIP_MS,
          withTiming(0, { duration: TIP_MS, easing: enter, ...motion }, (done) => {
            if (done) runOnJS(onRighted)();
          }),
        ),
      ),
    );
    fill.set(
      withDelay(POUR_AT, withTiming(levelAfter, { duration: DRAIN_MS, easing: enter, ...motion })),
    );
    beads.set(withDelay(POUR_AT, withTiming(1, { duration: 960, easing: beadEase, ...motion })));
    rose.set(withDelay(RIGHT_AT + 200, withTiming(1, { duration: 400, easing: enter, ...motion })));
  }, [pour, tip, fill, beads, rose, levelAfter, onRighted]);
  useEffect(() => {
    if (!slide) return;
    gone.set(withTiming(1, { duration: SLIDE_MS, easing: enter, ...motion }));
  }, [slide, gone]);

  const tipStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-38 * tip.get()}deg` }] }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: rose.get(),
    transform: [{ translateY: 6 * (1 - rose.get()) }],
  }));
  const slipStyle = useAnimatedStyle(() => ({
    opacity: 1 - gone.get(),
    transform: [{ translateY: 90 * gone.get() }, { rotate: '-2deg' }],
  }));

  return (
    <View style={{ height: 250, marginTop: 26 }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 150 }, slipStyle]}>
        <View
          style={{
            boxShadow: '0 10px 18px rgba(20,6,30,.3)',
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 10,
            backgroundColor: '#f7f2e8',
          }}
        >
          <SlipText line={slip} />
        </View>
        <PaperEdge color="#f7f2e8" />
      </Animated.View>
      <Animated.View
        style={[{ position: 'absolute', right: 22, top: 6, transformOrigin: '30% 92%' }, tipStyle]}
      >
        <Jar
          width={96}
          height={126}
          hue={hue}
          icon={icon}
          futureYou={futureYou}
          level={fill}
          ringColor={palette.glass}
        />
      </Animated.View>
      {BEADS.map((size, i) => (
        <BeadDot key={i} size={size} index={i} poured={beads} color={c.fill} />
      ))}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 12,
            top: 146,
            height: 26,
            paddingHorizontal: 10,
            borderRadius: 99,
            backgroundColor: 'rgba(251,244,236,.14)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          },
          tagStyle,
        ]}
      >
        <Text style={{ ...body(12.5, 700), color: palette.ink }}>{tag.from}</Text>
        <Symbol name="arrow_forward" size={14} color={palette.ink} />
        <Text style={{ ...body(12.5, 700), color: palette.ink }}>{tag.to}</Text>
      </Animated.View>
    </View>
  );
}

function BeadDot({
  size,
  index,
  poured,
  color,
}: {
  readonly size: number;
  readonly index: number;
  readonly poured: SharedValue<number>;
  readonly color: string;
}) {
  // Each bead's flight is its own 60% of the pour, starting 90 ms after the one before.
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (poured.get() - index * 0.094) / 0.62));
    return {
      opacity: t > 0 && t < 0.97 ? 1 : 0,
      transform: [{ translateX: -118 * t }, { translateY: 96 * t * t }],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 96,
          top: 28,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

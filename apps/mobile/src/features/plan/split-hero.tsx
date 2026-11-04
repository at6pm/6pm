import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { PlanSplit, SplitPartKind } from '@6pm/domain';
import { curves, springs } from '@6pm/theme';

import { useTheme } from '../../ui/theme/theme';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import type { BillView, PlanJarView } from './plan-view';
import { Hatch, Rules } from './hatch';
import type { SplitColours } from './split-colours';
import { BillsArt, DaysArt, PotsArt, SPLIT_HEIGHT } from './split-part-art';

const GROW_MS = 700;
const GROW_STAGGER = 90;
const RING_MS = 200;
const PULSE_MS = 900;
const growEase = Easing.bezier(...curves.enter);
const reduceMotion = ReduceMotion.System;

export interface SplitWords {
  readonly pay: string;
  readonly paid: string;
  readonly label: Readonly<Record<SplitPartKind, string>>;
  readonly amount: Readonly<Record<SplitPartKind, string>>;
  /** "350k a day", "420k today", "Free is used up". */
  readonly day: string;
  readonly daySub: string;
  readonly payAmount: string;
}

/**
 * Plan's hero: the pay, one tall split of it into Bills, Pots, (Before,) Free (and Over), each
 * sized by its money and tappable, and the one number under it.
 */
export function SplitHero({
  split,
  bills,
  jars,
  words,
  colours,
  selected,
  onSelect,
  grow,
  pulse,
}: {
  readonly split: PlanSplit;
  readonly bills: readonly BillView[];
  readonly jars: readonly PlanJarView[];
  readonly words: SplitWords;
  readonly colours: SplitColours;
  readonly selected: SplitPartKind;
  readonly onSelect: (kind: SplitPartKind) => void;
  /** Changes each time the parts should draw in again (first view, a new cycle). 0: not yet. */
  readonly grow: number;
  /** Changes when the Pots part should pulse gold (the first open after payday). */
  readonly pulse: number;
}) {
  const { palette } = useTheme();
  const total = split.parts.reduce((sum, p) => sum + p.amount, 0) || 1;
  const last = split.parts.length - 1;
  return (
    <View
      style={{
        borderRadius: 28,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        paddingTop: 16,
        paddingHorizontal: 14,
        paddingBottom: 16,
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: palette.inkSoft }}>
            {words.pay.toUpperCase()}
          </Text>
          <Text style={{ ...display(30, 500, -0.02), color: palette.ink }}>{words.payAmount}</Text>
        </View>
        <Text style={{ ...body(13, 600), color: palette.inkSoft }}>{words.paid}</Text>
      </View>
      <View style={{ flexDirection: 'row', height: SPLIT_HEIGHT, gap: 3 }}>
        {split.parts.map((part, i) => {
          const scheduled = part.kind === 'pots' && split.lastDay;
          return (
            <SplitPart
              key={part.kind}
              index={i}
              share={part.amount / total}
              radius={radiusOf(i, last)}
              bg={bgOf(part.kind, colours)}
              hatch={hatchOf(part.kind, colours, scheduled)}
              fg={fgOf(part.kind, colours)}
              ruled={part.kind === 'bills' ? colours.bills.rule8 : undefined}
              label={words.label[part.kind]}
              amount={words.amount[part.kind]}
              selected={selected === part.kind}
              ring={colours.ring}
              lift={colours.lift}
              grow={grow}
              pulse={part.kind === 'pots' ? pulse : 0}
              pulseColour={colours.pots.pulse}
              onPress={() => onSelect(part.kind)}
            >
              {(width) =>
                part.kind === 'bills' ? (
                  <BillsArt bills={bills} colours={colours} />
                ) : part.kind === 'pots' ? (
                  <PotsArt
                    jars={jars}
                    glow={split.daysSincePayday <= 1}
                    colours={colours}
                    ring={colours.pots.bg}
                  />
                ) : part.kind === 'free' ? (
                  <DaysArt days={split.days} width={width} colours={colours} />
                ) : null
              }
            </SplitPart>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          columnGap: 8,
          rowGap: 6,
          paddingTop: 4,
          paddingHorizontal: 2,
        }}
      >
        <Text
          style={{
            ...display(40, 500, -0.03),
            ...tabular,
            color: split.overspent ? colours.warn : palette.ink,
          }}
        >
          {words.day}
        </Text>
        <Text style={{ ...body(15, 600), color: palette.inkSoft }}>{words.daySub}</Text>
      </View>
    </View>
  );
}

function radiusOf(i: number, last: number) {
  const outer = 18;
  const inner = 4;
  return {
    borderTopLeftRadius: i === 0 ? outer : inner,
    borderBottomLeftRadius: i === 0 ? outer : inner,
    borderTopRightRadius: i === last ? outer : inner,
    borderBottomRightRadius: i === last ? outer : inner,
  };
}

function bgOf(kind: SplitPartKind, c: SplitColours): string {
  return kind === 'bills'
    ? c.bills.bg
    : kind === 'pots'
      ? c.pots.bg
      : kind === 'free'
        ? c.free.bg
        : 'transparent';
}

type Stripes = { readonly a: string; readonly b: string; readonly width: number };

function hatchOf(kind: SplitPartKind, c: SplitColours, scheduled: boolean): Stripes | undefined {
  if (kind === 'pots') return scheduled ? c.pots.scheduled : undefined;
  return kind === 'before' ? c.before.hatch : kind === 'over' ? c.over.hatch : undefined;
}

function fgOf(kind: SplitPartKind, c: SplitColours): string {
  return kind === 'bills'
    ? c.bills.fg
    : kind === 'pots'
      ? c.pots.fg
      : kind === 'before'
        ? c.before.fg
        : kind === 'free'
          ? c.free.fg
          : c.over.fg;
}

/**
 * One part of the split: grows in from the left (700 ms, 90 ms after the one before), lifts 3 pt
 * on the pop spring and rings in ink when chosen, and pulses gold once when asked.
 */
function SplitPart({
  index,
  share,
  radius,
  bg,
  hatch,
  fg,
  ruled,
  label,
  amount,
  selected,
  ring,
  lift,
  grow,
  pulse,
  pulseColour,
  onPress,
  children,
}: {
  readonly index: number;
  readonly share: number;
  readonly radius: ReturnType<typeof radiusOf>;
  readonly bg: string;
  readonly hatch: Stripes | undefined;
  readonly fg: string;
  readonly ruled: string | undefined;
  readonly label: string;
  readonly amount: string;
  readonly selected: boolean;
  readonly ring: string;
  readonly lift: string;
  readonly grow: number;
  readonly pulse: number;
  readonly pulseColour: string;
  readonly onPress: () => void;
  readonly children: (width: number) => ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const drawn = useSharedValue(0);
  const on = useSharedValue(selected ? 1 : 0);
  const ringOn = useSharedValue(selected ? 1 : 0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (grow === 0) return;
    drawn.value = 0;
    drawn.value = withDelay(
      index * GROW_STAGGER,
      withTiming(1, { duration: GROW_MS, easing: growEase, reduceMotion }),
    );
  }, [grow, index, drawn]);

  useEffect(() => {
    on.value = withSpring(selected ? 1 : 0, { ...springs.pop, reduceMotion });
    ringOn.value = withTiming(selected ? 1 : 0, { duration: RING_MS, reduceMotion });
  }, [selected, on, ringOn]);

  useEffect(() => {
    if (pulse === 0) return;
    glow.value = withSequence(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease), reduceMotion }),
      withTiming(0, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease), reduceMotion }),
    );
  }, [pulse, glow]);

  const outer = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * on.value }, { scaleX: drawn.value }],
  }));
  const shadow = useAnimatedStyle(() => ({ opacity: ringOn.value }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        { flexGrow: share, flexShrink: 1, flexBasis: 0, minWidth: 68, transformOrigin: 'left' },
        outer,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, ...radius },
          { boxShadow: `0 8px 18px ${lift}` },
          shadow,
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}, ${amount}`}
        onPress={onPress}
        style={{
          flex: 1,
          ...radius,
          overflow: 'hidden',
          backgroundColor: bg,
        }}
      >
        {hatch ? <Hatch {...hatch} reach={Math.max(width, SPLIT_HEIGHT)} /> : null}
        {ruled ? <Rules color={ruled} every={8} reach={SPLIT_HEIGHT} /> : null}
        {children(width)}
        <View style={{ position: 'absolute', left: 9, right: 6, bottom: 8 }}>
          <Text numberOfLines={1} style={{ ...body(12.5, 700), color: fg }}>
            {label}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={{ ...display(21, 600), lineHeight: 23, ...tabular, color: fg }}
          >
            {amount}
          </Text>
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              ...radius,
              borderWidth: 2,
              borderColor: pulseColour,
            },
            pulseStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              ...radius,
              borderWidth: 2,
              borderColor: ring,
            },
            shadow,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

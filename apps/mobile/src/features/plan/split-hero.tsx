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

import type { PlanSplit, SplitPart as SplitPartModel, SplitPartKind } from '@6pm/domain';
import { curves, springs } from '@6pm/theme';

import { useTheme } from '../../ui/theme/theme';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import type { BillView, PlanJarView } from './plan-view';
import { Hatch, Rules } from './hatch';
import type { SplitColours } from './split-colours';
import {
  ART_TOP,
  BillsArt,
  DaysArt,
  InHandArt,
  PotsArt,
  SPLIT_HEIGHT,
  type ArtRoom,
} from './split-part-art';

const GROW_MS = 700;
const PART_GAP = 3;
/** A part's narrowest, as the canvas draws it; less only when the parts would not fit side by side. */
const PART_MIN = 68;
/** The art keeps this much clear above the label. */
const FOOT_CLEAR = 6;
/** The label and amount sit this far up from the part's foot, and are this tall as designed. */
const FOOT_BOTTOM = 8;
const FOOT_DESIGNED = 40;
/** The foot's words grow with the text size, up to this, so the art always keeps some room. */
const FOOT_MAX_SCALE = 1.35;
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

/** A part as the hero draws it: a dashed part is one money has not filled yet. */
export type HeroPart = SplitPartModel & { readonly dashed?: boolean };

/** What the hero draws: the parts, Free's days, and where the cycle or the pay stands. */
export type HeroSplit = Pick<PlanSplit, 'lastDay' | 'daysSincePayday' | 'days' | 'overspent'> & {
  readonly parts: readonly HeroPart[];
  /** Free's days as a pay draws them: a row of small dots, one a day to the next pay. */
  readonly dayRow?: boolean;
};

/**
 * Plan's hero: the pay, one tall split of it into Bills, Pots, (Before,) Free (and Over, or In
 * hand), each sized by its money and tappable, and the one number under it.
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
  note = null,
  gap = null,
  inHand = null,
}: {
  readonly split: HeroSplit;
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
  /** A line under the pay: "Bills and jars: January already whole ✓". */
  readonly note?: string | null;
  /** The share of Bills this pay covers for earlier pays, hatched, and its label ("GAP 2,25TR"). */
  readonly gap?: { readonly share: number; readonly label: string } | null;
  /** In hand's dots: a day each, the newest `fresh` of them bright. */
  readonly inHand?: { readonly days: number; readonly fresh: number } | null;
}) {
  const { palette } = useTheme();
  const total = split.parts.reduce((sum, p) => sum + p.amount, 0) || 1;
  const last = split.parts.length - 1;
  // Every part keeps its narrowest only while they all fit across: with Before and Over beside
  // Bills, Jars and Free on a narrow phone they share what there is instead of running off.
  const [rowWidth, setRowWidth] = useState(0);
  const count = split.parts.length;
  const minWidth =
    rowWidth > 0
      ? Math.min(PART_MIN, (rowWidth - PART_GAP * (count - 1)) / Math.max(1, count))
      : PART_MIN;
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
          gap: 8,
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: palette.inkSoft }}>
            {words.pay.toUpperCase()}
          </Text>
          <Text style={{ ...display(30, 500, -0.02), color: palette.ink }}>{words.payAmount}</Text>
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ ...body(13, 600), color: palette.inkSoft, flexShrink: 1, textAlign: 'right' }}
        >
          {words.paid}
        </Text>
      </View>
      {note === null ? null : (
        <Text
          style={{
            ...mono(10.5, 400, 0.12),
            color: palette.inkSoft,
            paddingHorizontal: 2,
            marginTop: -4,
          }}
        >
          {note.toUpperCase()}
        </Text>
      )}
      <View
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        style={{ flexDirection: 'row', height: SPLIT_HEIGHT, gap: PART_GAP }}
      >
        {split.parts.map((part, i) => {
          const scheduled = part.kind === 'pots' && split.lastDay;
          const dashed = part.dashed === true;
          return (
            <SplitPart
              key={part.kind}
              index={i}
              share={part.amount / total}
              minWidth={minWidth}
              radius={radiusOf(i, last)}
              bg={dashed ? 'transparent' : bgOf(part.kind, colours)}
              hatch={dashed ? undefined : hatchOf(part.kind, colours, scheduled)}
              fg={dashed ? colours.dashed.fg : fgOf(part.kind, colours)}
              ruled={part.kind === 'bills' && !dashed ? colours.bills.rule8 : undefined}
              dashed={dashed ? colours.dashed.line : undefined}
              gap={part.kind === 'bills' && !dashed ? gap : null}
              gapColours={colours.gap}
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
              {(room) =>
                part.kind === 'bills' ? (
                  <BillsArt bills={bills} room={room} colours={colours} />
                ) : part.kind === 'pots' ? (
                  <PotsArt
                    jars={jars}
                    room={room}
                    glow={split.daysSincePayday <= 1}
                    colours={colours}
                    ring={colours.pots.bg}
                  />
                ) : part.kind === 'free' && !dashed ? (
                  <DaysArt
                    days={split.days}
                    room={room}
                    colours={colours}
                    row={split.dayRow === true}
                  />
                ) : part.kind === 'inHand' && inHand !== null ? (
                  <InHandArt
                    days={inHand.days}
                    fresh={inHand.fresh}
                    room={room}
                    colours={colours}
                  />
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
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={{
            ...display(40, 500, -0.03),
            ...tabular,
            maxWidth: '100%',
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
        : kind === 'inHand'
          ? c.inHand.bg
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
          : kind === 'inHand'
            ? c.inHand.fg
            : c.over.fg;
}

/**
 * One part of the split: grows in from the left (700 ms, 90 ms after the one before), lifts 3 pt
 * on the pop spring and rings in ink when chosen, and pulses gold once when asked.
 */
function SplitPart({
  index,
  share,
  minWidth,
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
  dashed,
  gap = null,
  gapColours,
}: {
  readonly index: number;
  readonly share: number;
  readonly minWidth: number;
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
  readonly children: (room: ArtRoom) => ReactNode;
  /** The outline's colour for a part money has not filled yet. */
  readonly dashed?: string | undefined;
  readonly gap?: { readonly share: number; readonly label: string } | null;
  readonly gapColours?: SplitColours['gap'];
}) {
  const [width, setWidth] = useState(0);
  // The label and amount are measured, so the art fits above whatever the face and text size make
  // of them: a wide serif, Vietnamese marks above and below, the largest Dynamic Type.
  // Until measured, the foot is taken at its designed height, so the art draws in the first frame.
  const [foot, setFoot] = useState(FOOT_DESIGNED);
  const room: ArtRoom = { width, height: SPLIT_HEIGHT - ART_TOP - foot - FOOT_BOTTOM - FOOT_CLEAR };
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
    // The ring is a fade, so it stays one with Reduce Motion on; only the lift is dropped.
    ringOn.value = withTiming(selected ? 1 : 0, {
      duration: RING_MS,
      reduceMotion: ReduceMotion.Never,
    });
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
        { flexGrow: share, flexShrink: 1, flexBasis: 0, minWidth, transformOrigin: 'left' },
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
          ...(dashed ? { borderWidth: 1.5, borderStyle: 'dashed', borderColor: dashed } : {}),
        }}
      >
        {hatch ? <Hatch {...hatch} reach={Math.max(width, SPLIT_HEIGHT)} /> : null}
        {ruled ? <Rules color={ruled} every={8} reach={SPLIT_HEIGHT} /> : null}
        {gap && gapColours && width > 0 ? (
          // What this pay covers for the pays before it: hatched warm along the paper's right.
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: Math.round(width * Math.min(1, gap.share)),
              overflow: 'hidden',
            }}
          >
            <Hatch {...gapColours.hatch} reach={Math.max(width, SPLIT_HEIGHT)} />
            <Text
              numberOfLines={1}
              style={{
                ...mono(9.5, 600, 0.1),
                color: gapColours.fg,
                position: 'absolute',
                top: ART_TOP,
                right: 8,
              }}
            >
              {gap.label.toUpperCase()}
            </Text>
          </View>
        ) : null}
        {width > 0 ? children(room) : null}
        <View
          onLayout={(e) => setFoot(e.nativeEvent.layout.height)}
          style={{ position: 'absolute', left: 9, right: 6, bottom: FOOT_BOTTOM, gap: 3 }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            maxFontSizeMultiplier={FOOT_MAX_SCALE}
            style={{ ...body(12.5, 700), color: fg }}
          >
            {label}
          </Text>
          {/* The face's own line height: a fixed one cuts a serif's tall figures off at the top. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            maxFontSizeMultiplier={FOOT_MAX_SCALE}
            style={{ ...display(21, 600), ...tabular, color: fg }}
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

import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { encodeQR } from '@6pm/domain';
import type { CardGlow, CardRule, ShareInks } from '@6pm/theme';

import { Companion } from '../../../ui/companion/companion';
import type { CompanionMood } from '../../../ui/companion/companion-mood';
import { body, display, leading, mono } from '../../../ui/type/fonts';
import { CardArt } from './card-art';

/**
 * The card is a picture of a fixed size: its type never grows with the reader's text size, or it
 * would run off the card.
 */
export const ON_CARD = { allowFontScaling: false, maxFontSizeMultiplier: 1 } as const;

/** The ink peels off right to left as the canvas's `(.6,0,.2,1)` 450 ms; the number fades in under it. */
const PEEL = {
  duration: 450,
  easing: Easing.bezier(0.6, 0, 0.2, 1),
  reduceMotion: ReduceMotion.System,
};
const SHOW = { duration: 300, reduceMotion: ReduceMotion.System };
/** How long an amount takes to settle after the switch: a capture waits for it. */
export const AMOUNTS_SETTLE_MS = 460;

export function glowStyle(glow: CardGlow | null): TextStyle {
  return glow
    ? {
        textShadowColor: glow.color,
        textShadowOffset: { width: glow.x, height: glow.y },
        textShadowRadius: glow.blur,
      }
    : {};
}

/** A kicker or label: IBM Plex Mono, letter-spaced, or the interface face in Basic. */
export function kicker(
  inks: ShareInks,
  size: number,
  tracking = 0.16,
  weight: 400 | 500 | 600 = 400,
): TextStyle {
  return inks.kickers === 'mono'
    ? mono(size, weight, tracking)
    : body(size, weight >= 600 ? 650 : 500, tracking);
}

/** The look's display face for a title, set at `line` × its size. */
export function title(inks: ShareInks, size: number, line: number, weight = inks.titleWeight) {
  return {
    ...leading(display(size, weight, inks.tracking), size * line),
    ...glowStyle(inks.glow),
    color: inks.ink,
  };
}

/** A rule across the card as a box of the art. */
export function ruleBorder(rule: CardRule) {
  return {
    borderTopWidth: rule.width,
    borderTopColor: rule.color,
    borderStyle: rule.dashed ? ('dashed' as const) : ('solid' as const),
  };
}

/** A solid or dashed line of the look's rule, drawn on its own (a View's dashed top edge). */
export function Rule({ rule, style }: { readonly rule: CardRule; readonly style?: object }) {
  return (
    <View
      style={[
        {
          height: 0,
          borderTopWidth: rule.width,
          borderColor: rule.color,
          borderStyle: rule.dashed ? 'dashed' : 'solid',
        },
        style,
      ]}
    />
  );
}

/**
 * An amount under ink: hidden, a bar of the card's ink sits where it would be and the number is
 * not drawn at all; shown, the ink peels off right to left and the number fades in under it.
 */
export function InkedAmount({
  text,
  shown,
  style,
  ink,
  inset = { l: -6, r: -2, t: 1, b: 1 },
  radius = 3,
}: {
  readonly text: string;
  readonly shown: boolean;
  readonly style: TextStyle;
  readonly ink: string;
  readonly inset?: {
    readonly l: number;
    readonly r: number;
    readonly t: number;
    readonly b: number;
  };
  readonly radius?: number;
}) {
  const on = useSharedValue(shown ? 1 : 0);
  useEffect(() => {
    on.set(shown ? withTiming(1, PEEL) : withTiming(0, PEEL));
  }, [on, shown]);
  const textOn = useSharedValue(shown ? 1 : 0);
  useEffect(() => {
    textOn.set(shown ? withDelay(150, withTiming(1, SHOW)) : withTiming(0, { duration: 120 }));
  }, [textOn, shown]);
  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - on.get() }] }));
  const number = useAnimatedStyle(() => ({ opacity: textOn.get() }));
  return (
    <View style={{ position: 'relative' }}>
      <Animated.Text {...ON_CARD} style={[style, number]} accessibilityElementsHidden={!shown}>
        {text}
      </Animated.Text>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: inset.l,
            right: inset.r,
            top: inset.t,
            bottom: inset.b,
            borderRadius: radius,
            backgroundColor: ink,
            transformOrigin: '100% 50%',
          },
          bar,
        ]}
      />
    </View>
  );
}

/** The QR's text: the card's own path, so the website counts each card. */
export function cardLink(path: string): string {
  return `https://at6pm.app/c/${path}`;
}

/** The code's modules, one point each: 25 pt for a version 2 code, 3 px a module in the image. */
function QrCode({
  text,
  size,
  color,
}: {
  readonly text: string;
  readonly size: number;
  readonly color: string;
}) {
  const path = useMemo(() => {
    const qr = encodeQR(text, { level: 'M' });
    const m = size / qr.size;
    const p = Skia.Path.Make();
    qr.rows.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) p.addRect(Skia.XYWHRect(x * m, y * m, m, m));
      }),
    );
    return p;
  }, [text, size]);
  return (
    <Canvas style={{ width: size, height: size }}>
      <Path path={path} color={color} antiAlias={false} />
    </Canvas>
  );
}

const QR_TILE = 34;
const QR_CODE = 25;

/**
 * The mark every card carries: 6pm, at6pm.app/c (after the card's own words, as the streak's
 * dates) and a small QR to `at6pm.app/c/<card>`.
 */
export function CardMark({
  inks,
  path,
  label,
  rule,
}: {
  readonly inks: ShareInks;
  readonly path: string;
  /** Printed before the address (the streak's dates). */
  readonly label?: string;
  /** A line above the mark. */
  readonly rule?: CardRule;
}) {
  const address = 'AT6PM.APP/C';
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 10 },
        rule ? { paddingTop: 10, ...ruleBorder(rule) } : null,
      ]}
    >
      <Text {...ON_CARD} style={{ ...display(18, 700), color: inks.ink, ...glowStyle(inks.glow) }}>
        6pm
      </Text>
      <Text
        {...ON_CARD}
        numberOfLines={2}
        style={{ ...kicker(inks, 9, 0.14), flex: 1, color: inks.soft, lineHeight: 12 }}
      >
        {label ? `${label} · ${address}` : address}
      </Text>
      <View style={{ width: QR_TILE, height: QR_TILE }}>
        <CardArt
          width={QR_TILE}
          height={QR_TILE}
          style={{ position: 'absolute' }}
          boxes={[
            { l: 0, t: 0, w: QR_TILE, h: QR_TILE, bg: inks.qr.tile, r: '7px', sh: inks.qr.ring },
          ]}
        />
        <View
          style={{
            position: 'absolute',
            left: (QR_TILE - QR_CODE) / 2,
            top: (QR_TILE - QR_CODE) / 2,
          }}
        >
          <QrCode text={cardLink(path)} size={QR_CODE} color={inks.qr.ink} />
        </View>
      </View>
    </View>
  );
}

/**
 * The small mark the hero cards carry instead of the QR: 6pm and at6pm.app, at the card's foot.
 */
export function CardSign({ inks }: { readonly inks: ShareInks }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
      <Text {...ON_CARD} style={{ ...display(14, 700), color: inks.ink, ...glowStyle(inks.glow) }}>
        6pm
      </Text>
      <Text {...ON_CARD} style={{ ...kicker(inks, 9, 0.14), color: inks.soft }}>
        AT6PM.APP
      </Text>
    </View>
  );
}

/**
 * The companion and its line in a bubble of the card's ink, as the month card's foot. Never in
 * serious mode.
 */
export function CardCompanion({
  line,
  inks,
  mood = 'happy',
}: {
  readonly line: string;
  readonly inks: ShareInks;
  readonly mood?: CompanionMood;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      <Companion size={46} mood={mood} />
      <View
        style={{
          flexShrink: 1,
          marginBottom: 18,
          paddingVertical: 7,
          paddingHorizontal: 11,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          borderBottomRightRadius: 14,
          borderBottomLeftRadius: 4,
          backgroundColor: inks.ink,
        }}
      >
        <Text {...ON_CARD} style={{ ...display(14, 500), color: inks.base }}>
          {line}
        </Text>
      </View>
    </View>
  );
}

/** The card's ground: its background, texture and frame as the look draws them. */
export function CardGround({
  inks,
  width,
  height,
  children,
}: {
  readonly inks: ShareInks;
  readonly width: number;
  readonly height: number;
  readonly children?: ReactNode;
}) {
  const boxes = useMemo(
    () => [
      { l: 0, t: 0, w: width, h: height, bg: inks.bg },
      ...(inks.tex === 'none' ? [] : [{ l: 0, t: 0, w: width, h: height, bg: inks.tex }]),
      ...(inks.frame === 'none' ? [] : [{ l: 0, t: 0, w: width, h: height, sh: inks.frame }]),
    ],
    [inks, width, height],
  );
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <CardArt boxes={boxes} width={width} height={height} style={{ position: 'absolute' }} />
      {children}
    </View>
  );
}

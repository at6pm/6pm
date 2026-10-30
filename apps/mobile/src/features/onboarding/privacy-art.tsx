import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Oval,
  RadialGradient,
  Shadow,
  vec,
} from '@shopify/react-native-skia';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
} from 'react-native-reanimated';

import { Companion } from '../../ui/companion/companion';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { inOut } from './catch-demo-kit';
import { useLoop } from './onboarding-motion';
import { PRIVACY, tileOf, type OnboardingPalette } from './onboarding-palette';

const DOME = 196;
const R = DOME / 2;
/** The canvas reaches past the bubble far enough for the 7 pt halo. */
const BLEED = 8;
const C = BLEED + R;
/** The bubble's centre sits 6 pt above the hero's. */
const LIFT = 6;
/** Below this height the art is drawn smaller, so the card and the button still fit. */
const HERO_MIN = 236;
const COMPANION = 150;
const TILE = 34;
const DRIFT_MS = 5200;
/** A tile sets off every 1.3 s, so one reaches the bubble every 1.3 s. */
const STAGGER_MS = 1300;
const BOB_MS = 3200;
const SHIMMER_MS = 2400;

/** `radial-gradient(circle at 34% 26%, …)`: its radius reaches the farthest corner. */
const FOCUS = vec(BLEED + DOME * 0.34, BLEED + DOME * 0.26);
const FOCUS_R = DOME * Math.hypot(0.66, 0.74);
/** The specular ellipse: 58 × 26 at (30, 22), turned −28° about its centre, blurred 3 pt. */
const SHINE = { x: 30, y: 22, w: 58, h: 26, turn: (-28 * Math.PI) / 180 } as const;
const SHINE_ORIGIN = vec(BLEED + SHINE.x + SHINE.w / 2, BLEED + SHINE.y + SHINE.h / 2);

// Easings are declared before the worklets that call them: a worklet captures what it calls when
// it is created.
const driftEase = Easing.bezierFn(0.45, 0.05, 0.25, 1);
const rimEase = Easing.bezierFn(0.32, 0.72, 0, 1);

/** Up and back down on CSS `ease-in-out`, 0 → 1 → 0 across one loop. */
function swell(p: number): number {
  'worklet';
  return p < 0.5 ? inOut(p / 0.5) : 1 - inOut((p - 0.5) / 0.5);
}

/** A keyframed value at progress `p`, each stretch on the drift's curve. */
function keyed(p: number, at: readonly number[], values: readonly number[]): number {
  'worklet';
  const last = values[values.length - 1] ?? 0;
  if (p <= (at[0] ?? 0)) return values[0] ?? 0;
  for (let i = 0; i < at.length - 1; i++) {
    const a = at[i] ?? 0;
    const b = at[i + 1] ?? 1;
    if (p <= b) {
      const from = values[i] ?? 0;
      return from + ((values[i + 1] ?? from) - from) * driftEase((p - a) / (b - a));
    }
  }
  return last;
}

/**
 * The rim as a tile arrives, 0 → 1 → 0 in each 1.3 s: it brightens from 32% to 64% of the loop
 * (the design's 58% → 66% of 5.2 s) and settles by the end.
 */
function rimLight(q: number): number {
  'worklet';
  if (q <= 0.32) return 0;
  if (q <= 0.64) return rimEase((q - 0.32) / 0.32);
  return 1 - rimEase((q - 0.64) / 0.36);
}

/** Where a tile is at 0%, 45%, 62% and 72% of its drift. */
const POSE_AT = [0, 0.45, 0.62, 0.72];
const FADE_AT = [0, 0.1, 0.45, 0.62, 0.72];
const FADE = [0, 1, 1, 0.9, 0];
const SCALE = [1, 1, 0.7, 0.45];

interface DriftingTile {
  readonly icon: SymbolName;
  readonly hue: number;
  readonly x: readonly number[];
  readonly y: readonly number[];
  readonly turn: readonly number[];
}

/** A receipt, a bank, a voice and a QR code drifting in from the four corners. */
const TILES: readonly DriftingTile[] = [
  {
    icon: 'receipt_long',
    hue: 60,
    x: [-150, -112, -62, -40],
    y: [-70, -58, -30, -18],
    turn: [-10, -4, 0, 0],
  },
  {
    icon: 'account_balance',
    hue: 25,
    x: [150, 114, 64, 42],
    y: [-92, -74, -40, -24],
    turn: [10, 4, 0, 0],
  },
  { icon: 'mic', hue: 300, x: [-150, -116, -64, -42], y: [70, 52, 26, 16], turn: [8, 3, 0, 0] },
  { icon: 'qr_code_2', hue: 260, x: [152, 118, 66, 44], y: [52, 40, 20, 12], turn: [-8, -3, 0, 0] },
];

/** `shimmer`: .25 → .6 → .25 over 2.4 s, the lower line 0.6 s behind. */
function HorizonLine({ index }: { readonly index: number }) {
  const line = PRIVACY.lines[index] ?? PRIVACY.lines[0];
  const phase = useLoop(SHIMMER_MS, index * 600, 0.5);
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + 0.35 * swell(phase.value) }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: line.inset,
          right: line.inset,
          top: '50%',
          marginTop: line.top,
          height: 3,
          borderRadius: 3,
          backgroundColor: line.color,
        },
        style,
      ]}
    />
  );
}

/** One tile's 5.2 s drift into the bubble: in from the side, then smaller and gone at the rim. */
function DriftTile({ tile, index }: { readonly tile: DriftingTile; readonly index: number }) {
  const phase = useLoop(DRIFT_MS, index * STAGGER_MS);
  const look = tileOf(tile.hue);
  const style = useAnimatedStyle(() => {
    const p = phase.value;
    return {
      opacity: keyed(p, FADE_AT, FADE),
      transform: [
        { translateX: keyed(p, POSE_AT, tile.x) },
        { translateY: keyed(p, POSE_AT, tile.y) },
        { rotate: `${keyed(p, POSE_AT, tile.turn)}deg` },
        { scale: keyed(p, POSE_AT, SCALE) },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: TILE,
          height: TILE,
          marginLeft: -TILE / 2,
          marginTop: -TILE / 2,
          borderRadius: 11,
          experimental_backgroundImage: look.background,
          boxShadow: PRIVACY.tileShadow,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Symbol name={tile.icon} size={19} fill={1} weight={500} color={look.glyph} />
    </Animated.View>
  );
}

/**
 * The glass bubble: a radial highlight with an inner white rim and a soft glow at its foot, a
 * blurred shine at the top left, and the companion bobbing inside with the ground shadow it
 * draws itself (the design's second one would double it). The rim brightens and a warm ring
 * spreads from it each time a tile arrives.
 */
function Dome({ pal }: { readonly pal: OnboardingPalette }) {
  const rim = useLoop(STAGGER_MS, 2 * STAGGER_MS);
  const bob = useLoop(BOB_MS);
  const lit = useDerivedValue(() => rimLight(rim.value));
  const haloWidth = useDerivedValue(() => 7 * lit.value);
  const haloR = useDerivedValue(() => R + 3.5 * lit.value);
  const rise = useDerivedValue(() => swell(bob.value));
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * rise.value }] }));
  const lock = tileOf(150);

  return (
    <View
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: DOME,
        height: DOME,
        marginLeft: -R,
        marginTop: -R - LIFT,
      }}
    >
      <View
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: R,
          boxShadow: PRIVACY.domeShadow,
        }}
      />
      <Canvas
        style={{
          position: 'absolute',
          left: -BLEED,
          top: -BLEED,
          width: DOME + 2 * BLEED,
          height: DOME + 2 * BLEED,
        }}
      >
        <Circle
          cx={C}
          cy={C}
          r={haloR}
          style="stroke"
          strokeWidth={haloWidth}
          color={PRIVACY.halo}
          opacity={lit}
        />
        <Circle cx={C} cy={C} r={R}>
          <RadialGradient
            c={FOCUS}
            r={FOCUS_R}
            colors={[...PRIVACY.domeStops]}
            positions={[...PRIVACY.domeStopAt]}
          />
        </Circle>
        <Circle cx={C} cy={C} r={R} color={PRIVACY.glow}>
          <Shadow dx={0} dy={-14} blur={17} color={PRIVACY.glow} inner shadowOnly />
        </Circle>
        <Circle cx={C} cy={C} r={R - 0.75} style="stroke" strokeWidth={1.5} color={PRIVACY.rim} />
        <Group opacity={lit}>
          <Circle cx={C} cy={C} r={R} color={PRIVACY.glowLit}>
            <Shadow dx={0} dy={-14} blur={17} color={PRIVACY.glowLit} inner shadowOnly />
          </Circle>
          <Circle
            cx={C}
            cy={C}
            r={R - 0.75}
            style="stroke"
            strokeWidth={1.5}
            color={PRIVACY.rimLit}
          />
        </Group>
        <Group origin={SHINE_ORIGIN} transform={[{ rotate: SHINE.turn }]}>
          <Oval
            x={BLEED + SHINE.x}
            y={BLEED + SHINE.y}
            width={SHINE.w}
            height={SHINE.h}
            color={PRIVACY.specular}
          >
            <BlurMask blur={3} style="normal" />
          </Oval>
        </Group>
      </Canvas>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: (DOME - COMPANION) / 2,
            top: R - COMPANION / 2 - 5,
            width: COMPANION,
            height: COMPANION,
          },
          bobStyle,
        ]}
      >
        <Companion size={COMPANION} mood="happy" />
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          right: 6,
          bottom: 10,
          width: 42,
          height: 42,
          borderRadius: 21,
          experimental_backgroundImage: lock.background,
          boxShadow: `0 0 0 3px ${pal.cell}, ${PRIVACY.lockShadow}`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="lock" size={21} fill={1} weight={500} color={lock.glyph} />
      </View>
    </View>
  );
}

/**
 * The privacy promise's picture: the companion safe in a glass bubble over two shimmering
 * horizon lines, while a receipt, a bank, a voice and a QR code drift in and vanish at its rim.
 * Decorative, so hidden from VoiceOver. Reduce Motion keeps the bubble and companion still and
 * leaves the tiles out.
 */
export function PrivacyHero({ pal }: { readonly pal: OnboardingPalette }) {
  const reduceMotion = useReducedMotion();
  const [height, setHeight] = useState(HERO_MIN);
  const scale = Math.min(1, height / HERO_MIN);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={{ flex: 1, minHeight: 0 }}
    >
      <View style={{ flex: 1, transform: [{ scale }] }}>
        {PRIVACY.lines.map((_, i) => (
          <HorizonLine key={i} index={i} />
        ))}
        <Dome pal={pal} />
        {reduceMotion
          ? null
          : TILES.map((tile, i) => <DriftTile key={tile.icon} tile={tile} index={i} />)}
      </View>
    </View>
  );
}

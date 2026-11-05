import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, seasonInk } from '@6pm/theme';

import { body, mono } from '../../ui/type/fonts';
import { jarColours } from './jar-colours';

const drop = Easing.bezier(...curves.jarIn);
/** The mark printed on the seal: "lộc", good fortune. */
const SEAL_MARK = 'Lộc';
/** The tilt each envelope in the jar wears, in turn (the canvas's `rot`). */
const TILTS = [-8, 6, -3, 9, -6, 3, -10, 7, -2, 5];

/**
 * One small red envelope with its gold seal. Dropped in, it falls from above the jar turning out
 * of a 30° tilt, (.3,1.3,.5,1) over 550 ms; taken out, it fades.
 */
function DroppedEnvelope({ tilt }: { readonly tilt: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(1, { duration: 550, easing: drop, reduceMotion: ReduceMotion.System }));
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.get() / 0.7),
    transform: [
      { translateY: -140 * (1 - p.get()) },
      { rotate: `${tilt - 30 * (1 - p.get())}deg` },
    ],
  }));
  return (
    <Animated.View
      exiting={FadeOut.duration(150)}
      style={[
        {
          width: 22,
          height: 30,
          borderRadius: 3,
          experimental_backgroundImage: `linear-gradient(180deg, ${seasonInk.envelopeTop}, ${seasonInk.envelopeBottom})`,
          boxShadow: `${seasonInk.envelopeShadow}, inset 0 0 0 1px ${seasonInk.envelopeRimSoft}`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seasonInk.envelopeRim }}
      />
    </Animated.View>
  );
}

/**
 * The offer's jar (Tết Season canvas, first phone): 136 × 178, a lid over the glass, the level
 * rising with the goal (9 % a million, springing on (.3,1.3,.5,1)), and one envelope a million
 * stacked from the bottom.
 */
export function EnvelopeJar({
  hue,
  envelopes,
  level,
}: {
  readonly hue: number;
  readonly envelopes: number;
  /** 0 to 1. */
  readonly level: number;
}) {
  const c = jarColours(hue);
  const fill = useSharedValue(level);
  useEffect(() => {
    fill.set(withTiming(level, { duration: 600, easing: drop, reduceMotion: ReduceMotion.System }));
  }, [fill, level]);
  const fillStyle = useAnimatedStyle(() => ({ height: `${Math.min(1, fill.get()) * 100}%` }));
  return (
    <View style={{ width: 136, height: 178 }}>
      <View
        style={{
          position: 'absolute',
          left: 34,
          right: 34,
          top: 0,
          height: 16,
          borderRadius: 7,
          backgroundColor: c.lid,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 3,
          right: 3,
          top: 13,
          bottom: 0,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          borderBottomLeftRadius: 42,
          borderBottomRightRadius: 42,
          backgroundColor: c.glass,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.18)',
          overflow: 'hidden',
          boxShadow: 'inset 0 -14px 24px rgba(0,0,0,.16)',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: c.glow,
              borderTopWidth: 2,
              borderTopColor: c.fillTop,
            },
            fillStyle,
          ]}
        />
        <View
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 8,
            flexDirection: 'row',
            flexWrap: 'wrap-reverse',
            justifyContent: 'center',
            rowGap: 3,
            columnGap: 2,
          }}
        >
          {Array.from({ length: envelopes }, (_, i) => (
            <DroppedEnvelope key={i} tilt={TILTS[i % TILTS.length] ?? 0} />
          ))}
        </View>
        <View
          style={{
            position: 'absolute',
            left: 14,
            top: 18,
            width: 8,
            height: '40%',
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,.18)',
          }}
        />
      </View>
    </View>
  );
}

/**
 * A big envelope of Quick add's fan: 72 × 104, red with a gold line inside its edge, the Lộc seal
 * and what it holds under it.
 */
export function FanEnvelope({ each }: { readonly each: string }) {
  return (
    <View
      style={{
        width: 72,
        height: 104,
        borderRadius: 6,
        experimental_backgroundImage: `linear-gradient(180deg, ${seasonInk.envelopeTop}, ${seasonInk.envelopeBottom})`,
        boxShadow: `${seasonInk.fanShadow}, inset 0 0 0 3px ${seasonInk.envelopeBottom}, inset 0 0 0 4px ${seasonInk.envelopeRim}`,
        alignItems: 'center',
        paddingTop: 16,
        gap: 8,
      }}
    >
      <Seal size={26} />
      <Text numberOfLines={1} style={{ ...mono(9.5, 600), color: seasonInk.sealLight }}>
        {each}
      </Text>
    </View>
  );
}

/**
 * The round gold Lộc seal. Its mark is part of the envelope's art, printed on every envelope the
 * same in every language, like the 6pm on the sun; it is hidden from screen readers.
 */
export function Seal({ size }: { readonly size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        experimental_backgroundImage: `radial-gradient(circle at 40% 35%, ${seasonInk.sealLight}, ${seasonInk.sealGold} 70%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ ...body(size * 0.35, 800), color: seasonInk.sealInk }}
      >
        {SEAL_MARK}
      </Text>
    </View>
  );
}

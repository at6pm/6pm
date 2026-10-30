import { useMemo } from 'react';
import { StyleSheet, Text, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { display } from '../type/fonts';
import { shadowRoom, textShadows } from '../type/text-shadow';
import { cornerPlace, neonFlicker, type CornerUnit } from './header-art';
import type { SkyHeader } from './sky-header';

/** The sign's place and type in the prototype: 20 pt in, 110 pt down, 42 pt, tracked .03 em. */
export const SIGN = { left: 20, top: 110, size: 42, tracking: 0.03 } as const;

/**
 * Neon Alley's shop sign (`atm.signText`: mở cửa while the day is open, đóng cửa once it is closed),
 * in the look's display face with its neon glow, each glow layer drawn as its own copy of the words
 * under the lit tube. Nothing for any other look.
 *
 * On a page with a header the sign and its tube (`unit`) move into the room beside the title,
 * scaled down to fit, and the sign strikes up again each time a tab is shown.
 */
export function SkySign({
  atm,
  dispFont,
  header,
  unit,
  onWidth,
}: {
  readonly atm: Readonly<Record<string, unknown>>;
  readonly dispFont: string;
  readonly header?: SkyHeader;
  /** The sign with its tube, as the look draws them. */
  readonly unit?: CornerUnit;
  /** The words' drawn width, for the tube and sign to move as one. */
  readonly onWidth?: (width: number) => void;
}) {
  const on = atm.signOn === true && typeof atm.signText === 'string';
  const glow = typeof atm.signSh === 'string' ? atm.signSh : 'none';
  const layers = useMemo(() => textShadows(glow), [glow]);
  const moved = useAnimatedStyle(() => {
    if (!header || !unit) return {};
    const place = cornerPlace(unit, header.geom.value, header.away.value, header.scroll.value);
    // The view's origin is the sign's own corner; scale about it, then place the unit's corner.
    const s = place.scale;
    return {
      opacity: place.opacity * neonFlicker(header.enter.value),
      transform: [
        { translateX: place.x - SIGN.left + s * (SIGN.left - unit.x) },
        { translateY: place.y - SIGN.top + s * (SIGN.top - unit.y) },
        { scale: s },
      ],
    };
  });
  if (!on) return null;
  const style = {
    ...display(SIGN.size, 400, SIGN.tracking, dispFont),
    lineHeight: SIGN.size,
    color: typeof atm.signC === 'string' ? atm.signC : 'transparent',
  };
  const words = String(atm.signText);
  // Every copy, the lit words included, sits in the same padded box: iOS lays a padded line out a
  // little lower than a bare one, and copies that differ show their letters' feet under the sign.
  const room = layers.reduce((most, shadow) => Math.max(most, shadowRoom(shadow)), 0);
  const box = { position: 'absolute', left: -room, top: -room, padding: room } as const;
  const measure = onWidth
    ? (e: LayoutChangeEvent) => onWidth(e.nativeEvent.layout.width - 2 * room)
    : undefined;
  return (
    <Animated.View style={[styles.sign, moved]}>
      {layers.map((shadow, i) => (
        <Text key={i} style={[style, shadow, box]} numberOfLines={1}>
          {words}
        </Text>
      ))}
      <Text style={[style, box]} numberOfLines={1} {...(measure ? { onLayout: measure } : {})}>
        {words}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sign: {
    position: 'absolute',
    left: SIGN.left,
    top: SIGN.top,
    width: 0,
    height: 0,
    transformOrigin: '0 0',
    pointerEvents: 'none',
  },
});

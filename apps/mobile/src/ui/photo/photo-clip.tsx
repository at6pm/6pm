import { useEffect, useRef } from 'react';
import { Image, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations, photoInk } from '@6pm/theme';

import { CategoryTile } from '../category-tile';
import { Symbol } from '../icons/symbol';
import type { SymbolName } from '../icons/symbols.generated';

const clipEase = Easing.bezier(...curves.photoClip);

/** The paper clip that says a photo is kept: Material's attach_file, turned and shadowed. */
export function PhotoClip({
  size,
  color = photoInk.clip,
  rotate,
  shadow = true,
  style,
}: {
  readonly size: number;
  readonly color?: string;
  /** Degrees. */
  readonly rotate: number;
  /** Off where the clip is printed (the Diary's receipt). */
  readonly shadow?: boolean;
  readonly style?: ViewProps['style'];
}) {
  return (
    <View pointerEvents="none" style={[{ transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Symbol
        name="attach_file"
        size={size}
        weight={600}
        color={color}
        style={
          shadow
            ? {
                textShadowColor: photoInk.clipShadow,
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 2,
              }
            : undefined
        }
      />
    </View>
  );
}

/**
 * A row's category tile with its photo clipped on: the print slipped out from under the tile's
 * corner and the clip over it. A photo kept while the row is on screen slides out and the clip
 * snaps on (no haptic); the amount column never moves.
 */
export function TileWithPhoto({
  icon,
  hue,
  photo,
}: {
  readonly icon: SymbolName;
  readonly hue: number;
  /** The photo's `file://` URI, or null for a plain tile. */
  readonly photo: string | null;
}) {
  // Only a photo that arrives after the row was drawn plays its arrival.
  const hadPhoto = useRef(photo !== null);
  const arrive = useSharedValue(photo !== null ? 1 : 0);
  useEffect(() => {
    if (photo === null) {
      hadPhoto.current = false;
      arrive.set(0);
      return;
    }
    if (hadPhoto.current) {
      arrive.set(1);
      return;
    }
    hadPhoto.current = true;
    arrive.set(0);
    arrive.set(withTiming(1, { duration: durations.photoMark, easing: clipEase }));
  }, [photo, arrive]);

  const slip = useAnimatedStyle(() => ({
    transform: [
      { translateX: (arrive.get() - 1) * 6 },
      { translateY: (arrive.get() - 1) * 4 },
      { rotate: '12deg' },
    ],
  }));
  const clip = useAnimatedStyle(() => {
    const t = arrive.get();
    return {
      opacity: Math.min(1, t * 2),
      transform: [
        { translateX: (1 - t) * 10 },
        { translateY: (1 - t) * -14 },
        { rotate: `${40 + (1 - t) * 30}deg` },
        { scale: 0.6 + t * 0.4 },
      ],
    };
  });

  return (
    <View style={{ width: 38, height: 38 }}>
      {photo !== null ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 14,
              top: -6,
              width: 26,
              height: 34,
              borderWidth: 2,
              borderColor: photoInk.frame,
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,.35)',
              backgroundColor: photoInk.frame,
            },
            slip,
          ]}
        >
          <Image source={{ uri: photo }} resizeMode="cover" style={{ flex: 1 }} />
        </Animated.View>
      ) : null}
      <CategoryTile icon={icon} hue={hue} />
      {photo !== null ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', right: -9, top: -11 }, clip]}
        >
          <PhotoClip size={22} rotate={0} color={photoInk.tileClip} />
        </Animated.View>
      ) : null}
    </View>
  );
}

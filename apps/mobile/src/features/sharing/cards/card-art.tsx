import { Canvas } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { BoxLayer } from '../../../ui/sky/scenes/boxes/box-layer';
import { parseBoxes } from '../../../ui/sky/scenes/boxes/box-model';
import { useSceneMotionValues } from '../../../ui/sky/scenes/boxes/scene-motion';
import type { ArtBox } from './card-size';

const px = (n: number) => `${n}px`;

/**
 * A card's art in one Skia canvas: each box filled, bordered, shadowed and rounded exactly as its
 * CSS says, the way the sky draws a look's shapes, so every look's material (gold leaf, glaze,
 * halftone, neon) comes out as the canvas draws it. The boxes are placed in points on a canvas of
 * a known size, so the art is there on the first frame and in the captured image.
 */
export const CardArt = memo(function CardArt({
  boxes,
  width,
  height,
  style,
}: {
  readonly boxes: readonly ArtBox[];
  readonly width: number;
  readonly height: number;
  /** Where the canvas sits (an absolute ground under the card's words). */
  readonly style?: {
    readonly position?: 'absolute';
    readonly top?: number;
    readonly marginHorizontal?: number;
  };
}) {
  const time = useSharedValue(0);
  const motion = useSceneMotionValues();
  const key = useMemo(() => JSON.stringify(boxes), [boxes]);
  const parsed = useMemo(
    () =>
      parseBoxes(
        (JSON.parse(key) as ArtBox[]).map((b) => ({
          ...b,
          l: px(b.l),
          t: px(b.t),
          w: px(b.w),
          h: px(b.h),
        })),
        width,
        height,
      ),
    [key, width, height],
  );
  return (
    <Canvas pointerEvents="none" style={{ width, height, ...style }}>
      <BoxLayer boxes={parsed} time={time} motion={motion} />
    </Canvas>
  );
});

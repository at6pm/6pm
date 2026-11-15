import {
  Canvas,
  Path,
  PathOp,
  Shadow,
  Skia,
  StrokeJoin,
  type SkPath,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { addTeeth } from '../../ui/paper-edge';

/** Room around the slip for the ring and the shadow it casts. */
const ROOM = 22;

export interface SlipShape {
  readonly width: number;
  /** The slip's body, down to where its torn foot starts. */
  readonly body: number;
  /** The torn foot under the body. */
  readonly foot: number;
  readonly corner: number;
  /** The foot's teeth, as `PaperEdge` draws them. */
  readonly step: number;
  readonly tip: number;
}

/** The slip's outline (round top, torn foot) with its top-left corner at (`at`, `at`). */
function slipPath(shape: SlipShape, at: number): SkPath {
  const { width, body, foot, corner, step, tip } = shape;
  const right = at + width;
  const p = Skia.PathBuilder.Make();
  p.moveTo(right, at + body);
  p.lineTo(right, at + corner);
  p.arcToTangent(right, at, right - corner, at, corner);
  p.lineTo(at + corner, at);
  p.arcToTangent(at, at, at, at + corner, corner);
  addTeeth(p, { x: at, y: at + body, width, height: foot, step, radius: tip });
  p.close();
  return p.build();
}

/**
 * A selected calendar slip's ring: the slip's own shape grown evenly by `ring` on every side,
 * round top and torn teeth alike, in the accent and casting the lifted slip's shadow. It lies
 * under the slip, which covers all but the outline.
 */
export function SlipRing({
  shape,
  ring,
  color,
  shadow,
}: {
  readonly shape: SlipShape;
  readonly ring: number;
  readonly color: string;
  readonly shadow: string;
}) {
  const path = useMemo(() => {
    const fill = slipPath(shape, ROOM);
    const outline = Skia.Path.Stroke(fill, { width: ring * 2, join: StrokeJoin.Round });
    return (outline && Skia.Path.MakeFromOp(fill, outline, PathOp.Union)) ?? fill;
  }, [shape, ring]);
  return (
    <Canvas
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -ROOM,
        top: -ROOM,
        width: shape.width + ROOM * 2,
        height: shape.body + shape.foot + ROOM * 2,
      }}
    >
      <Path path={path} color={color}>
        <Shadow dx={0} dy={8} blur={8} color={shadow} />
      </Path>
    </Canvas>
  );
}

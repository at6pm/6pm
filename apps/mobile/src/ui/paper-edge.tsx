import { Canvas, Path, Shadow, Skia } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { paperInk } from '@6pm/theme';

/** Room the canvas keeps below the teeth for their shadow, and above them for the seam. */
const SHADOW_ROOM = 4;
const SEAM = 1;

/** A tooth's depth, as a share of the edge's height: torn paper is never quite even. */
function depthOf(index: number): number {
  // A fixed, repeating unevenness (not random), so the same receipt tears the same way every time.
  const wobble = Math.sin(index * 2.399) * 0.5 + Math.sin(index * 0.917) * 0.5;
  return 0.84 + 0.16 * (wobble * 0.5 + 0.5);
}

/** What the teeth are drawn with: a path, or a path builder. */
interface Pen {
  lineTo(x: number, y: number): unknown;
  quadTo(x1: number, y1: number, x2: number, y2: number): unknown;
}

/** How far down the edge the valleys between the teeth sit, as a share of its height. */
const VALLEY = 0.12;

/**
 * Draws a torn edge's teeth onto `path`: a line down to the valley at its left (`x`), then every
 * tooth to the valley at its right. `y` is the edge's top. Shared with anything that has to
 * follow a torn edge exactly (a calendar slip's selection ring).
 */
export function addTeeth(
  path: Pen,
  {
    x,
    y,
    width,
    height,
    step,
    radius,
  }: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly step: number;
    readonly radius: number;
  },
): void {
  const teeth = Math.max(1, Math.round(width / step));
  const span = width / teeth;
  const half = span / 2;
  // How much of each flank the rounded tip takes: never past the tooth's middle.
  const soften = Math.min(half * 0.9, Math.max(0.5, radius * 0.32));
  const valley = y + height * VALLEY;
  path.lineTo(x, valley);
  for (let i = 0; i < teeth; i++) {
    const x0 = x + i * span;
    const tip = x0 + half;
    const depth = y + height * depthOf(i);
    // Where the straight flank hands over to the rounded tip, on the line from valley to tip.
    const shoulder = valley + (depth - valley) * (1 - soften / half);
    // Down the left flank, round over the tip, up the right flank to the next valley.
    path.lineTo(tip - soften, shoulder);
    path.quadTo(tip, depth, tip + soften, shoulder);
    path.lineTo(x0 + span, valley);
  }
}

/**
 * The torn edge of a receipt: one anti-aliased path of teeth with softened tips, a little uneven
 * like paper torn against a printer's blade, casting its own soft shadow. The teeth are spaced to
 * fit the width exactly, so both corners end on a whole tooth. Before its width is known it is a
 * plain strip of the paper's colour, so the receipt never shows a frame without its edge.
 */
export function PaperEdge({
  color,
  height = 7,
  step = 8,
  radius = 3,
  shadow = true,
}: {
  readonly color: string;
  readonly height?: number;
  /** About how far apart the teeth are; they are spread to fit the width exactly. */
  readonly step?: number;
  /** How round each tip is: a larger radius softens it more. */
  readonly radius?: number;
  /**
   * Whether the teeth cast their own soft shadow. Paper lying under other paper (the close's cards
   * behind the top one) leaves it off, or the shadows gather into a grey band.
   */
  readonly shadow?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const path = useMemo(() => {
    if (width <= 0) return null;
    const p = Skia.Path.Make();
    p.moveTo(0, 0);
    addTeeth(p, { x: 0, y: SEAM, width, height, step, radius });
    p.lineTo(width, 0);
    p.close();
    return p;
  }, [width, height, step, radius]);

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {path ? (
        <Canvas
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: -SEAM,
            width,
            height: height + SEAM + SHADOW_ROOM,
          }}
        >
          <Path path={path} color={color}>
            {shadow ? <Shadow dx={0} dy={1} blur={1.2} color={paperInk.edgeShadow} /> : null}
          </Path>
        </Canvas>
      ) : (
        <View style={{ height: height * 0.5, backgroundColor: color }} />
      )}
    </View>
  );
}

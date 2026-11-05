import { BlurMask, Canvas, Group, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import type { JarGeometry } from './jar-geometry';

/** A glow around a jar, in CSS shadow terms: its colour, blur radius and spread, in points. */
export interface JarGlow {
  readonly color: string;
  readonly blur: number;
  readonly spread?: number;
}

/** The jar's lid and glass as one outline, grown by `grow` on every side. */
function jarOutline(g: JarGeometry, width: number, height: number, at: number, grow: number) {
  const p = Skia.Path.Make();
  const lidR = Math.max(2, g.lidH / 2) + grow;
  p.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(
        at + g.lidInset - grow,
        at - grow,
        width - 2 * g.lidInset + 2 * grow,
        g.lidH + 2 * grow,
      ),
      lidR,
      lidR,
    ),
  );
  const top = g.radiusTop + grow;
  const bottom = g.radiusBottom + grow;
  p.addRRect({
    rect: Skia.XYWHRect(
      at + g.bodyInset - grow,
      at + g.bodyTop - grow,
      width - 2 * g.bodyInset + 2 * grow,
      height - g.bodyTop + 2 * grow,
    ),
    topLeft: { x: top, y: top },
    topRight: { x: top, y: top },
    bottomRight: { x: bottom, y: bottom },
    bottomLeft: { x: bottom, y: bottom },
  });
  return p;
}

/**
 * Light around a jar in the jar's own shape, lid and all, drawn behind it: blurred out from the
 * outline and cut away inside it, as a CSS outer shadow is, so none of it lands on the lid or the
 * glass. (A view's `boxShadow` cannot follow the jar: iOS cuts it out by a plainer rounded box,
 * which leaves a ring of the background around the glass and over the lid.)
 */
export function JarLight({
  g,
  width,
  height,
  glows,
}: {
  readonly g: JarGeometry;
  readonly width: number;
  readonly height: number;
  readonly glows: readonly JarGlow[];
}) {
  // Room for the farthest light: a blur fades out about its radius past the grown outline.
  const reach = Math.ceil(Math.max(...glows.map((l) => l.blur + (l.spread ?? 0)))) + 2;
  const jar = jarOutline(g, width, height, reach, 0);
  const lights = glows.map((l): { glow: JarGlow; path: SkPath } => ({
    glow: l,
    path: jarOutline(g, width, height, reach, l.spread ?? 0),
  }));
  return (
    <Canvas
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -reach,
        top: -reach,
        width: width + 2 * reach,
        height: height + 2 * reach,
      }}
    >
      <Group clip={jar} invertClip>
        {lights.map(({ glow, path }, i) => (
          <Path key={i} path={path} color={glow.color}>
            <BlurMask blur={glow.blur / 2} style="normal" respectCTM />
          </Path>
        ))}
      </Group>
    </Canvas>
  );
}

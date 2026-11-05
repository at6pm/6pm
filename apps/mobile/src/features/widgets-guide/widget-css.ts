import type { SurfaceLook } from '@6pm/domain';

type Fill = SurfaceLook['dots']['full'];
type Shadow = SurfaceLook['numberShadows'][number];

/**
 * The look's widget materials back as the CSS the canvases wrote them in, so the guide's
 * miniatures draw them with React Native's own gradients and shadows.
 */
export function fillCss(fill: Fill | null | undefined): string {
  if (!fill || fill.stops.length === 0) return 'linear-gradient(transparent, transparent)';
  const stops = fill.stops.map(([color, at]) => `${color} ${Math.round(at * 100)}%`).join(', ');
  const first = fill.stops[0]?.[0] ?? 'transparent';
  switch (fill.kind) {
    case 'radial': {
      const [x, y] = fill.center ?? [0.5, 0.5];
      return `radial-gradient(circle at ${Math.round(x * 100)}% ${Math.round(y * 100)}%, ${stops})`;
    }
    case 'linear':
      return `linear-gradient(${fill.angle ?? 180}deg, ${stops})`;
    case 'solid':
    case 'dots':
    case 'stripes':
      return `linear-gradient(${first}, ${first})`;
  }
}

export function shadowCss(shadows: readonly Shadow[]): string | undefined {
  if (shadows.length === 0) return undefined;
  return shadows.map((s) => `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`).join(', ');
}

/** A CSS text shadow from the first of the look's number shadows (React Native draws one). */
export function textShadowOf(shadows: readonly Shadow[]) {
  const [first] = shadows;
  if (!first) return {};
  return {
    textShadowColor: first.color,
    textShadowOffset: { width: first.x, height: first.y },
    textShadowRadius: first.blur / 2,
  };
}

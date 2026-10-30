import { BlurMask, Group, Paint, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useMemo, useState, type ReactNode } from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import type { ArtBlend, ArtMove } from './header-art-plan';
import {
  ART_GAP,
  fitCorner,
  headerRise,
  HEADER_LINES,
  liftFor,
  NO_HEADER,
  scrolledAway,
  sinkFor,
  type HeaderGeom,
  type HeaderText,
  type SkyHeader,
} from './sky-header';

/** A header that never moves anything: the sky drawn exactly as the look draws it. */
export function useStillHeader(): SkyHeader {
  const away = useSharedValue(0);
  const geom = useSharedValue<HeaderGeom>(NO_HEADER);
  const scroll = useSharedValue(0);
  const enter = useSharedValue(1);
  const text = useSharedValue<HeaderText>({ dy: 0, shown: 0 });
  return useMemo(() => ({ away, geom, scroll, enter, text }), [away, geom, scroll, enter, text]);
}

const clamp01 = (v: number) => {
  'worklet';
  return Math.max(0, Math.min(1, v));
};

/** Text keeps this much clear sky around it, feathered over about as much again. */
const TEXT_PAD = 8;
const TEXT_FEATHER = 7;

/**
 * Where a piece of art that moves as `move` sits for the header: its shift down (negative is up),
 * and how much of it shows. Today (`away` 0) keeps it exactly where the look draws it.
 */
export function artShift(
  move: ArtMove,
  geom: HeaderGeom,
  away: number,
  scroll: number,
  top: number,
  bottom: number,
): { readonly dy: number; readonly opacity: number } {
  'worklet';
  const gone = scrolledAway(scroll);
  switch (move) {
    case 'lift':
      return {
        dy: away * (liftFor(geom, bottom) + headerRise(scroll)),
        opacity: 1 - away * clamp01(scroll / 120),
      };
    case 'stow':
      return { dy: -away * Math.max(0, bottom + ART_GAP), opacity: 1 };
    case 'sink':
      // It keeps its place under the header as both rise; the cards scroll up over it.
      return { dy: away * (sinkFor(geom, top) + headerRise(scroll)), opacity: 1 - away * gone };
    case 'fade':
      return { dy: 0, opacity: 1 - clamp01(away * 1.6) };
    case 'keep':
    case 'corner':
      return { dy: 0, opacity: 1 };
  }
}

/** A run of art moved out of the header's way (`lift`, `sink` or `fade`). */
export function HeaderMove({
  header,
  move,
  top,
  bottom,
  children,
}: {
  readonly header: SkyHeader;
  readonly move: ArtMove;
  readonly top: number;
  readonly bottom: number;
  readonly children: ReactNode;
}) {
  const { away, geom, scroll } = header;
  const shift = useDerivedValue(() =>
    artShift(move, geom.value, away.value, scroll.value, top, bottom),
  );
  const transform = useDerivedValue(() => [{ translateY: shift.value.dy }]);
  const opacity = useDerivedValue(() => shift.value.opacity);
  if (move === 'keep' || move === 'corner') return <>{children}</>;
  return (
    <Group transform={transform} opacity={opacity}>
      {children}
    </Group>
  );
}

/** The header's lines of text (and its button) as one path, where it sits on screen now. */
function textPath(geom: HeaderGeom, dy: number): SkPath {
  'worklet';
  const path = Skia.PathBuilder.Make();
  for (let i = 0; i < HEADER_LINES; i++) {
    const x = geom.lines[i * 4] ?? 0;
    const y = geom.lines[i * 4 + 1] ?? 0;
    const w = geom.lines[i * 4 + 2] ?? 0;
    const h = geom.lines[i * 4 + 3] ?? 0;
    if (w <= 0 || h <= 0) continue;
    path.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(x - TEXT_PAD, y + dy - TEXT_PAD / 2, w + 2 * TEXT_PAD, h + TEXT_PAD),
        TEXT_PAD,
        TEXT_PAD,
      ),
    );
  }
  return path.detach();
}

/**
 * Textures (halftone, star trails, rain, bokeh) stay in the sky but clear out from under the
 * header's text, feathered, so the words keep the contrast they have on bare sky (Today's date
 * included). The clearing follows the header as it scrolls and fades with it. Every child shares
 * `blend`.
 */
export function HeaderMask({
  header,
  blend = 'srcOver',
  children,
}: {
  readonly header: SkyHeader;
  readonly blend?: ArtBlend;
  readonly children: ReactNode;
}) {
  const { away, geom, enter, text } = header;
  const path = useDerivedValue(() => textPath(geom.value, text.value.dy));
  const strength = useDerivedValue(() => text.value.shown);
  // On a header page the texture fades up as the tab is shown.
  const shown = useDerivedValue(() => {
    const e = clamp01(enter.value / 0.8);
    return 1 - away.value * (1 - e * e * (3 - 2 * e));
  });
  // The clearing needs a layer of its own, skipped while there is no header text to clear.
  const [clearing, setClearing] = useState(false);
  useAnimatedReaction(
    () => text.value.shown > 0 && geom.value.floor > geom.value.ceiling,
    (on, previous) => {
      if (on !== previous) runOnJS(setClearing)(on);
    },
  );
  return (
    <Group {...(clearing ? { layer: <Paint blendMode={blend} /> } : {})} opacity={shown}>
      {children}
      {clearing ? (
        <Path path={path} blendMode="dstOut" opacity={strength}>
          <BlurMask blur={TEXT_FEATHER} style="normal" />
        </Path>
      ) : null}
    </Group>
  );
}

/** Art that moves into the room beside the title: its box in the look's own drawing. */
export interface CornerUnit {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/**
 * Where a corner piece sits at `away`: its top-left corner and scale, blended from where the look
 * draws it to the room beside the title (following the header as it scrolls), and how much shows.
 * With no room beside the title it stays put and fades.
 */
export function cornerPlace(
  unit: CornerUnit,
  geom: HeaderGeom,
  away: number,
  scroll: number,
): { readonly x: number; readonly y: number; readonly scale: number; readonly opacity: number } {
  'worklet';
  const fit = fitCorner(geom, unit.w, unit.h);
  if (fit.scale === 0) {
    return { x: unit.x, y: unit.y, scale: 1, opacity: 1 - clamp01(away * 1.6) };
  }
  const rise = headerRise(scroll);
  return {
    x: unit.x + (fit.x - unit.x) * away,
    y: unit.y + (fit.y + rise - unit.y) * away,
    scale: 1 + (fit.scale - 1) * away,
    opacity: 1 - away * scrolledAway(scroll),
  };
}

/** Moves Skia art drawn in `unit` into the room beside the title on a header page. */
export function HeaderCorner({
  header,
  unit,
  flicker,
  children,
}: {
  readonly header: SkyHeader;
  readonly unit: CornerUnit;
  /** Lights up with a neon tube's stutter each time a tab is shown. */
  readonly flicker?: boolean;
  readonly children: ReactNode;
}) {
  const { away, geom, scroll, enter } = header;
  const place = useDerivedValue(() => cornerPlace(unit, geom.value, away.value, scroll.value));
  const transform = useDerivedValue(() => [
    { translateX: place.value.x },
    { translateY: place.value.y },
    { scale: place.value.scale },
    { translateX: -unit.x },
    { translateY: -unit.y },
  ]);
  const opacity = useDerivedValue(
    () => place.value.opacity * (flicker ? neonFlicker(enter.value) : 1),
  );
  return (
    <Group transform={transform} opacity={opacity}>
      {children}
    </Group>
  );
}

/**
 * A neon tube striking: dark, a stutter of half-lit blinks, then steady, over the first half of
 * the entrance (`enter` 0 → 1). Steady at 1, which is where Reduce Motion leaves it.
 */
export function neonFlicker(enter: number): number {
  'worklet';
  if (enter >= 0.46) return 1;
  if (enter < 0.06) return 0;
  if (enter < 0.1) return 0.8;
  if (enter < 0.16) return 0.08;
  if (enter < 0.2) return 0.55;
  if (enter < 0.27) return 0.12;
  if (enter < 0.34) return 1;
  if (enter < 0.38) return 0.4;
  return 1;
}

/**
 * The swing hung things get each time a tab is shown, in the pendulum's units (about a degree
 * each): a push that dies away over the entrance. 0 at rest.
 */
export function entranceSwing(enter: number): number {
  'worklet';
  if (enter >= 1) return 0;
  const left = 1 - enter;
  return 6 * left * left * Math.sin(enter * Math.PI * 5);
}

/** `motion.pend` with the entrance's swing added, for scenes hung on threads and strings. */
export function useSwungPend(pend: SharedValue<number>, enter: SharedValue<number>) {
  return useDerivedValue(() => pend.value + entranceSwing(enter.value));
}

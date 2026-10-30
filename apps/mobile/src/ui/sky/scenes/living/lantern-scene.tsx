import { Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { HeaderMove } from '../../header-art';
import { ART_GAP, fitCorner, HEADER_LINES, liftFor, type HeaderGeom } from '../../sky-header';
import { MOON } from '../../sun-geometry';
import { useSceneTween } from '../use-scene-tween';
import type { SceneProps } from '../scene-props';
import { Lanterns } from './lantern-lanterns';
import { bulbValues, lanternModel, lanternValues, wireColor, type Lantern } from './lantern-model';
import { Floaters, River } from './lantern-river';
import { Bulbs, Wires } from './lantern-wires';
import { floaters, floatValues, riverModel, riverValues } from './river-model';

/** The lanterns' layer rises with the scroll at 0.2×. */
const PARALLAX = 0.2;

function RiverLayers({
  atm,
  time,
  width,
  motion,
}: Pick<SceneProps, 'atm' | 'time' | 'width' | 'motion'>) {
  const model = useMemo(() => riverModel(atm), [atm]);
  const colors = useSceneTween(riverValues(atm));
  const drifters = useMemo(() => floaters(atm), [atm]);
  const lit = useSceneTween(floatValues(atm));
  // The reflections slide 10 pt per unit of tilt (`translate: calc(var(--tx) * 10px) 0`).
  const slide = useDerivedValue(() => [{ translateX: 10 * motion.tx.value }]);
  return (
    <>
      {model && (
        <Group transform={slide}>
          <River layers={model.layers} colors={colors} time={time} width={width} />
        </Group>
      )}
      <Floaters floaters={drifters} values={lit} time={time} />
    </>
  );
}

/**
 * Lantern River: the river and its floating lanterns, then two strings of bulbs with five silk
 * lanterns hung from each. The glow ramps up with the hour (16:18 to 18:18). The whole layer
 * rises with the scroll at 0.2×. On a page with a header the strings are drawn up until the
 * lanterns hang clear above it.
 */
export function LanternScene({ atm, time, scrollY, width, motion, header }: SceneProps) {
  const model = useMemo(() => lanternModel(atm), [atm]);
  const wire = useSceneTween(wireColor(atm));
  const bulbs = useSceneTween(bulbValues(atm));
  const silk = useSceneTween(lanternValues(atm));
  const lift = useDerivedValue(() => [{ translateY: -PARALLAX * scrollY.value }]);
  const reach = useMemo(() => (model ? stringReach(model.lanterns) : null), [model]);
  const hangs = useMemo(() => (model ? model.lanterns.map(hangOf) : []), [model]);
  const { geom, away } = header;
  const bottom = reach?.bottom ?? 0;
  const drops = useDerivedValue(() =>
    lanternDrops(hangs, geom.value, liftFor(geom.value, bottom), away.value),
  );
  if (!model || !reach) return null;
  return (
    <Group transform={lift}>
      {atm.riverOn === true && <RiverLayers atm={atm} time={time} width={width} motion={motion} />}
      <HeaderMove header={header} move="lift" top={reach.top} bottom={reach.bottom}>
        <Wires wires={model.wires} color={wire} />
        <Bulbs bulbs={model.bulbs} values={bulbs} time={time} />
        <Lanterns
          lanterns={model.lanterns}
          values={silk}
          time={time}
          pend={motion.pend}
          drops={drops}
        />
      </HeaderMove>
    </Group>
  );
}

/** Height of a lantern's caps, as `lantern-lanterns` draws them. */
const CAP = 4;

/** A lantern's sides and lowest point, with room for its swing. */
interface Hang {
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  /** From the cap under the cord to the end of the tassel. */
  readonly body: number;
}

const SWING_ROOM = 3;

function hangOf(l: Lantern): Hang {
  return {
    left: l.x - SWING_ROOM,
    right: l.x + l.w + SWING_ROOM,
    bottom: l.y + l.cord + 2 * CAP + l.h + l.tassel,
    body: 2 * CAP + l.h + l.tassel,
  };
}

/** The status bar's words end about this far above a header's first line. */
const STATUS_CLEAR = 10;

/**
 * With the strings drawn up above a header, each lantern drops back down on a longer cord as far
 * as the text under it allows (into the room beside the title, over the button, or all the way
 * back where the look hangs it, in the margin), keeping clear of the moon beside the title. A
 * lantern with no room below the status bar is drawn up out of sight, so none hangs behind the
 * clock.
 */
function lanternDrops(hangs: readonly Hang[], geom: HeaderGeom, lift: number, away: number) {
  'worklet';
  const moon = fitCorner(geom, MOON.size, MOON.size);
  const rects: number[][] = [];
  for (let i = 0; i < HEADER_LINES; i++) {
    const w = geom.lines[i * 4 + 2] ?? 0;
    if (w > 0) {
      rects.push([
        geom.lines[i * 4] ?? 0,
        geom.lines[i * 4 + 1] ?? 0,
        w,
        geom.lines[i * 4 + 3] ?? 0,
      ]);
    }
  }
  if (moon.scale > 0) rects.push([moon.x, moon.y, MOON.size, MOON.size]);
  return hangs.map((hang) => {
    let floor = Infinity;
    for (const [x = 0, y = 0, w = 0] of rects) {
      if (x < hang.right && x + w > hang.left) floor = Math.min(floor, y - ART_GAP);
    }
    const drop = Math.max(0, Math.min(-lift, floor - (hang.bottom + lift)));
    const end = hang.bottom + lift + drop;
    if (end - hang.body >= geom.ceiling - STATUS_CLEAR) return drop * away;
    return -Math.max(0, end + ART_GAP) * away;
  });
}

/** From the highest string to the lowest tassel. */
function stringReach(lanterns: readonly Lantern[]): { top: number; bottom: number } | null {
  if (lanterns.length === 0) return null;
  const top = Math.min(...lanterns.map((l) => l.y));
  const bottom = Math.max(...lanterns.map((l) => l.y + l.cord + 2 * CAP + l.h + l.tassel));
  return { top, bottom };
}

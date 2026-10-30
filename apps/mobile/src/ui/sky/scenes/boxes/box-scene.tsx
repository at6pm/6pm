import { Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { SharedValue } from 'react-native-reanimated';

import type { LookId } from '@6pm/theme';

import { artRuns } from '../../header-art-plan';
import { HeaderCorner, HeaderMask, HeaderMove } from '../../header-art';
import type { SkyHeader } from '../../sky-header';
import type { LookSun } from '../../sun-geometry';
import { MOON } from '../../sun-geometry';
import { BoxLayer } from './box-layer';
import { parseBoxes } from './box-model';
import { drawsOwnSun, sunBoxes } from './box-sun';
import type { SceneMotion } from './scene-motion';

interface Common {
  readonly width: number;
  readonly height: number;
  readonly time: SharedValue<number>;
  readonly motion: SceneMotion;
}

/** `atm.back` or `atm.front`: the look's own shapes behind the blooms or in front of the scene. */
export function AtmBoxes({ raw, width, height, time, motion }: Common & { readonly raw: unknown }) {
  const boxes = useBoxes(raw, width, height);
  if (boxes.length === 0) return null;
  return <BoxLayer boxes={boxes} time={time} motion={motion} />;
}

function useBoxes(raw: unknown, width: number, height: number) {
  const key = useMemo(() => JSON.stringify(raw ?? []), [raw]);
  return useMemo(() => parseBoxes(JSON.parse(key) as unknown, width, height), [key, width, height]);
}

/**
 * A look's `atm.back` or `atm.front` kept clear of a page's header: each run of boxes lifted,
 * sunk, faded, moved beside the title or cleared from under the text as the look's plan says
 * (`header-art-plan`), and drawn exactly as the look draws it on Today.
 */
export function HeaderBoxes({
  raw,
  look,
  layer,
  header,
  corner,
  ...common
}: Common & {
  readonly raw: unknown;
  readonly look: LookId;
  readonly layer: 'back' | 'front';
  readonly header: SkyHeader;
  /** The box the corner runs move with (Neon Alley's sign and its tube). */
  readonly corner?: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  };
}) {
  const boxes = useBoxes(raw, common.width, common.height);
  const runs = useMemo(
    () => artRuns(look, layer, boxes, common.width),
    [look, layer, boxes, common.width],
  );
  if (boxes.length === 0) return null;
  return (
    <>
      {runs.map((run, i) => {
        const drawn = <BoxLayer boxes={run.boxes} time={common.time} motion={common.motion} />;
        if (run.move === 'corner' && corner) {
          return (
            <HeaderCorner key={i} header={header} unit={corner} flicker>
              {drawn}
            </HeaderCorner>
          );
        }
        const moved = (
          <HeaderMove header={header} move={run.move} top={run.top} bottom={run.bottom}>
            {drawn}
          </HeaderMove>
        );
        return run.masked ? (
          <HeaderMask key={i} header={header} blend={run.blend}>
            {moved}
          </HeaderMask>
        ) : (
          <Group key={i}>{moved}</Group>
        );
      })}
    </>
  );
}

/** The sun of a look the shared disc cannot draw, rising with the list's scroll like the disc. */
export function BoxSun({
  look,
  sun,
  lift,
  ...common
}: Common & {
  readonly look: LookId;
  readonly sun: LookSun;
  readonly lift: SharedValue<{ translateY: number }[]>;
}) {
  const raw = useMemo(
    () => (drawsOwnSun(look) ? sunBoxes(sun, common.width) : []),
    [look, sun, common.width],
  );
  if (raw.length === 0) return null;
  return (
    <Group transform={lift}>
      <AtmBoxes raw={raw} {...common} />
    </Group>
  );
}

/**
 * The moon as the look styles it (`moonBg`, `moonSh`): a 26 pt disc at 78% across, 124 pt down.
 * On a page with a header it rises into the room beside the title.
 */
export function BoxMoon({
  atm,
  opacity,
  header,
  ...common
}: Common & {
  readonly atm: Readonly<Record<string, unknown>>;
  /** The moon's tweened opacity for the hour. */
  readonly opacity: SharedValue<number>;
  readonly header: SkyHeader;
}) {
  const raw = useMemo(
    () => [
      {
        l: `${MOON.left * 100}%`,
        t: `${MOON.top}px`,
        w: `${MOON.size}px`,
        h: `${MOON.size}px`,
        r: '50%',
        bg: atm.moonBg,
        sh: atm.moonSh,
        op: 1,
      },
    ],
    [atm.moonBg, atm.moonSh],
  );
  const unit = useMemo(
    () => ({ x: MOON.left * common.width, y: MOON.top, w: MOON.size, h: MOON.size }),
    [common.width],
  );
  return (
    <Group opacity={opacity}>
      <HeaderCorner header={header} unit={unit}>
        <AtmBoxes raw={raw} {...common} />
      </HeaderCorner>
    </Group>
  );
}

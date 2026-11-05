import { View } from 'react-native';

import { isFutureYouPot, type CycleDay } from '@6pm/domain';

import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { Jar, jarLevel } from '../pots/jar';
import { Hatch } from './hatch';
import type { BillView, PlanJarView } from './plan-view';
import { billTile, type SplitColours } from './split-colours';
import {
  ART_SIDE as SIDE,
  DOT_GAP,
  dotGrid,
  MINI_COL_GAP,
  MINI_H,
  MINI_ROW_GAP,
  MINI_W,
  miniGrid,
  type ArtRoom,
} from './split-grid';

export type { ArtRoom } from './split-grid';

/** The part's height, and the art's inset from its top. */
export const SPLIT_HEIGHT = 196;
export const ART_TOP = 12;

const BILL_ROW = 18;
const BILL_GAP = 5;

/** Bills on paper: one row per bill, its icon (a tick once paid) and a ruled line. */
export function BillsArt({
  bills,
  room,
  colours,
}: {
  readonly bills: readonly BillView[];
  readonly room: ArtRoom;
  readonly colours: SplitColours;
}) {
  const fits = Math.max(0, Math.floor((room.height + BILL_GAP) / (BILL_ROW + BILL_GAP)));
  return (
    <View style={{ position: 'absolute', left: SIDE, right: 8, top: ART_TOP, gap: BILL_GAP }}>
      {bills.slice(0, fits).map((b) => (
        <View
          key={b.bill.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            opacity: b.paid ? 0.7 : 1,
          }}
        >
          <View
            style={{
              width: BILL_ROW,
              height: BILL_ROW,
              borderRadius: 6,
              backgroundColor: b.paid ? colours.bills.paidTile : billTile(b.bill.hue),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol
              name={b.paid ? 'check' : isSymbolName(b.bill.icon) ? b.bill.icon : 'payments'}
              size={12}
              fill={1}
              color={b.paid ? colours.bills.paidGlyph : '#ffffff'}
            />
          </View>
          <View
            style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: colours.bills.rule }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Pots: the jars in shelf order, two to a row (one when the part is too narrow for two), Future
 * you first; it glows the day after payday. A part too short for one row draws its jars smaller.
 */
export function PotsArt({
  jars,
  room,
  glow,
  colours,
  ring,
}: {
  readonly jars: readonly PlanJarView[];
  readonly room: ArtRoom;
  readonly glow: boolean;
  readonly colours: SplitColours;
  readonly ring: string;
}) {
  const { cols, rows, scale } = miniGrid(room);
  const w = Math.round(MINI_W * scale);
  const h = Math.round(MINI_H * scale);
  if (rows === 0) return null;
  return (
    <View
      style={{
        position: 'absolute',
        left: SIDE,
        top: ART_TOP,
        width: w * cols + MINI_COL_GAP * (cols - 1),
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: MINI_COL_GAP,
        rowGap: MINI_ROW_GAP,
      }}
    >
      {jars.slice(0, rows * cols).map((j) => {
        const fy = isFutureYouPot(j.pot);
        return (
          <Jar
            key={j.pot.id}
            width={w}
            height={h}
            hue={j.pot.hue}
            icon={j.pot.icon}
            futureYou={fy}
            level={jarLevel(j.saved, j.pot.goal)}
            state={j.state}
            ringColor={ring}
            {...(glow && fy ? { halo: { color: colours.pots.glow, blur: 8, spread: 2 } } : {})}
          />
        );
      })}
    </View>
  );
}

/**
 * Free as the cycle's days: past days by what they spent, today ringed, the days to come dim, the
 * days once the cycle went past its plan hatched warm, and none before the person joined.
 */
export function DaysArt({
  days,
  room,
  colours,
}: {
  readonly days: readonly CycleDay[];
  readonly room: ArtRoom;
  readonly colours: SplitColours;
}) {
  const { cols, size } = dotGrid(room, days.length);
  const c = colours.free;
  return (
    <View
      style={{
        position: 'absolute',
        left: SIDE,
        top: ART_TOP,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: DOT_GAP,
        width: size > 0 ? cols * size + (cols - 1) * DOT_GAP : undefined,
      }}
    >
      {size > 0
        ? days.map((d) => (
            <View
              key={d.day}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor:
                  d.kind === 'today'
                    ? c.dotToday
                    : d.kind === 'future'
                      ? c.dotFuture
                      : d.kind === 'past'
                        ? c.dotPast
                        : 'transparent',
                overflow: 'hidden',
                boxShadow: d.kind === 'today' ? `0 0 0 2px ${c.dotTodayRing}` : undefined,
                opacity: d.kind === 'past' ? 0.7 + 0.3 * d.level : 1,
              }}
            >
              {d.kind === 'over' ? <Hatch {...c.dotOver} reach={size} /> : null}
            </View>
          ))
        : null}
    </View>
  );
}

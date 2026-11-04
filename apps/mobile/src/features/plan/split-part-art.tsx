import { View } from 'react-native';

import { isFutureYouPot, type CycleDay } from '@6pm/domain';

import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { Jar, jarLevel } from '../pots/jar';
import { Hatch } from './hatch';
import type { BillView, PlanJarView } from './plan-view';
import { billTile, type SplitColours } from './split-colours';

/** The part's height, and the room its label and amount keep at the foot. */
export const SPLIT_HEIGHT = 196;
const TOP = 12;
const FOOT = 54;
const ROOM = SPLIT_HEIGHT - TOP - FOOT;

const BILL_ROW = 18;
const BILL_GAP = 5;
const MINI_W = 19;
const MINI_H = 26;
const MINI_ROW_GAP = 6;
const DOT_GAP = 5;

/** Bills on paper: one row per bill, its icon (a tick once paid) and a ruled line. */
export function BillsArt({
  bills,
  colours,
}: {
  readonly bills: readonly BillView[];
  readonly colours: SplitColours;
}) {
  const fits = Math.floor((ROOM + BILL_GAP) / (BILL_ROW + BILL_GAP));
  return (
    <View style={{ position: 'absolute', left: 10, right: 8, top: TOP, gap: BILL_GAP }}>
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

/** Pots: the jars in shelf order, two to a row, Future you first; it glows the day after payday. */
export function PotsArt({
  jars,
  glow,
  colours,
  ring,
}: {
  readonly jars: readonly PlanJarView[];
  readonly glow: boolean;
  readonly colours: SplitColours;
  readonly ring: string;
}) {
  const rows = Math.floor((ROOM + MINI_ROW_GAP) / (MINI_H + MINI_ROW_GAP));
  return (
    <View
      style={{
        position: 'absolute',
        left: 10,
        top: TOP,
        width: MINI_W * 2 + 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 5,
        rowGap: MINI_ROW_GAP,
      }}
    >
      {jars.slice(0, rows * 2).map((j) => {
        const fy = isFutureYouPot(j.pot);
        return (
          <View
            key={j.pot.id}
            style={{
              width: MINI_W,
              height: MINI_H,
              borderRadius: 5,
              boxShadow: glow && fy ? `0 0 8px 2px ${colours.pots.glow}` : undefined,
            }}
          >
            <Jar
              width={MINI_W}
              height={MINI_H}
              hue={j.pot.hue}
              icon={j.pot.icon}
              futureYou={fy}
              level={jarLevel(j.saved, j.pot.goal)}
              state={j.state}
              ringColor={ring}
            />
          </View>
        );
      })}
    </View>
  );
}

/** The dot grid's columns and size that fit `count` dots into the part: the biggest dots win. */
function dotGrid(width: number, count: number): { cols: number; size: number } {
  let best = { cols: 6, size: 0 };
  for (let cols = 5; cols <= 9; cols++) {
    const rows = Math.ceil(count / cols);
    const byWidth = (width - 20 - DOT_GAP * (cols - 1)) / cols;
    const byHeight = (ROOM - DOT_GAP * (rows - 1)) / rows;
    const size = Math.floor(Math.min(byWidth, byHeight) * 2) / 2;
    if (size > best.size) best = { cols, size };
  }
  return best;
}

/**
 * Free as the cycle's days: past days by what they spent, today ringed, the days to come dim, the
 * days once the cycle went past its plan hatched warm, and none before the person joined.
 */
export function DaysArt({
  days,
  width,
  colours,
}: {
  readonly days: readonly CycleDay[];
  /** The part's width. */
  readonly width: number;
  readonly colours: SplitColours;
}) {
  const { cols, size } = dotGrid(width, days.length);
  const c = colours.free;
  return (
    <View
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        top: TOP,
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

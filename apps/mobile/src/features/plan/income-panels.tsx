import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type {
  BillRow,
  LandedRow,
  SetAsideItem,
  SliceState,
  StretchBill,
  StretchRow,
} from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono, tabular } from '../../ui/type/fonts';
import { Hatch } from './hatch';
import { billTile, type SplitColours } from './split-colours';

/** One line of a receipt: words on the left, the amount on the right. */
export interface SlipLine {
  readonly key: string;
  readonly k: string;
  readonly v: string;
  readonly total: boolean;
  readonly result: boolean;
}

/** Today's maths as a receipt: the words and amounts given, totals under a dashed rule. */
export function MathsSlip({
  lines,
  colours,
}: {
  readonly lines: readonly SlipLine[];
  readonly colours: SplitColours;
}) {
  const c = colours.receipt;
  return (
    <View
      style={{
        marginTop: 8,
        marginHorizontal: 14,
        marginBottom: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: c.bg,
        gap: 7,
      }}
    >
      {lines.map((line) => {
        const style = {
          ...mono(12, line.total ? 600 : 400),
          color: line.result ? c.result : c.ink,
        };
        return (
          <View key={line.key} style={{ gap: 7 }}>
            {line.total ? <DashedRule color={c.rule} /> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ ...style, flexShrink: 1 }}>{line.k}</Text>
              <Text style={{ ...style, ...tabular }}>{line.v}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

type T = ReturnType<typeof useI18n>['t'];

/** "first", "fourth": the slice or the pay's place, as a word. */
export function nthOf(t: T, n: number): string {
  const k = Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
  return t(`income.nth${k}`);
}

/** A pay's maths in words: each row of `stretchMaths`. */
export function stretchLines(
  rows: readonly StretchRow[],
  words: {
    readonly t: T;
    readonly full: (amount: number) => string;
    readonly billName: (index: number) => string;
    readonly weekly: boolean;
    readonly payWeekday: string;
    readonly next: string;
  },
): SlipLine[] {
  const { t, full } = words;
  return rows.map((r, i): SlipLine => {
    const v = full(r.amount);
    const line = (k: string) => ({ key: `${r.kind}${i}`, k, v, total: r.total, result: r.result });
    switch (r.kind) {
      case 'pay':
        return line(t('income.maths.pay'));
      case 'bill': {
        const name = words.billName(r.index ?? 0);
        const nth = nthOf(t, r.count ?? 1);
        return line(
          r.whole
            ? t('income.maths.billWhole', { name, nth })
            : t('income.maths.billSlice', { name, nth }),
        );
      }
      case 'jars':
        return line(
          r.count === 1 && r.base === 4
            ? t('income.maths.jarsQuarter')
            : r.count === 1 && r.base === 2
              ? t('income.maths.jarsHalf')
              : t('income.maths.jarsOf', { count: r.count ?? 0, base: r.base ?? 0 }),
        );
      case 'kept':
        return line(t('income.maths.kept'));
      case 'freePay':
        return line(t('income.maths.freePay'));
      case 'leftBefore':
        return {
          ...line(words.weekly ? t('income.maths.leftWeek') : t('income.maths.leftPay')),
          v: `${r.amount > 0 ? '+' : ''}${v}`,
        };
      case 'inHand':
        return { ...line(t('income.maths.inHand')), v: `+${v}` };
      case 'paidSince':
        return line(t('income.maths.paidSince'));
      case 'spentSince':
        return line(t('income.maths.spentSince', { weekday: words.payWeekday }));
      case 'divide':
        return line(t('income.maths.divide', { count: r.count ?? 1, date: words.next }));
      case 'each':
        return line(t('income.maths.each'));
      case 'wait':
        return line(t('income.maths.wait'));
      case 'held':
        return line(t('income.maths.held'));
    }
  });
}

/** Money that only lands, its maths in words: each row of `landedMaths`. */
export function landedLines(
  rows: readonly LandedRow[],
  words: {
    readonly t: T;
    readonly full: (amount: number) => string;
    readonly landingName: (index: number) => string;
    readonly futureYouOnly: boolean;
    readonly on: string;
    /** The day's line, written in full. */
    readonly line: string;
    /** A day, written as the slip writes `on`. */
    readonly date: (day: string) => string;
  },
): SlipLine[] {
  const { t, full } = words;
  return rows.map((r, i): SlipLine => {
    const v = full(r.amount);
    const line = (k: string) => ({ key: `${r.kind}${i}`, k, v, total: r.total, result: r.result });
    switch (r.kind) {
      case 'landed': {
        if (r.count !== undefined) return line(t('income.lmaths.landedMany', { count: r.count }));
        const name = words.landingName(r.index ?? 0);
        return line(name ? t('income.lmaths.landedFrom', { name }) : t('income.lmaths.landed'));
      }
      case 'inHand':
        return { ...line(t('income.lmaths.inHand')), v: `+${v}` };
      case 'bills':
        return line(t('income.lmaths.bills'));
      case 'jars':
        return line(words.futureYouOnly ? t('income.lmaths.futureYou') : t('income.lmaths.jars'));
      case 'toShare':
        return line(t('income.lmaths.toShare'));
      case 'spentBefore':
        return line(t('potsPlan.maths.spentBefore'));
      case 'ahead':
        return line(t('income.lmaths.ahead', { date: words.date(r.on ?? '') }));
      case 'aheadJars':
        return line(
          words.futureYouOnly ? t('income.lmaths.aheadFutureYou') : t('income.lmaths.aheadJars'),
        );
      case 'evenly':
        return line(t('income.lmaths.evenly', { count: r.count ?? 1, date: words.on }));
      case 'cap':
        return line(t('income.lmaths.cap'));
      case 'spread':
        return line(t('income.lmaths.spread', { count: r.count ?? 1 }));
      case 'atLine':
        return line(t('income.lmaths.atLine', { count: r.count ?? 1, amount: words.line }));
      case 'beyond':
        return line(t('income.lmaths.beyond', { count: r.count ?? 0 }));
      case 'leftOver':
        return line(t('income.lmaths.leftOver'));
    }
  });
}

/** A bill's slices as the Bills panel draws them: faded, solid, hatched warm, dashed. */
function Slices({
  slices,
  tile,
  colours,
}: {
  readonly slices: readonly SliceState[];
  readonly tile: string;
  readonly colours: SplitColours;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {slices.map((state, k) => (
        <View
          key={k}
          style={{
            width: 16,
            height: 9,
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor:
              state === 'this' ? colours.bills.bg : state === 'earlier' ? tile : 'transparent',
            opacity: state === 'earlier' ? 0.45 : 1,
            ...(state === 'coming'
              ? { borderWidth: 1, borderStyle: 'dashed', borderColor: palette.inkSoft }
              : {}),
          }}
        >
          {state === 'gap' ? <Hatch {...colours.gap.hatch} reach={16} /> : null}
        </View>
      ))}
    </View>
  );
}

/** Bills for a pay: each bill's slices, what this pay set aside for it, and why, when it covers a gap. */
export function StretchBillsPanel({
  bills,
  rows,
  colours,
  dueOf,
  gapNote,
}: {
  readonly bills: readonly StretchBill[];
  readonly rows: readonly BillRow[];
  readonly colours: SplitColours;
  readonly dueOf: (bill: StretchBill) => string;
  readonly gapNote: string | null;
}) {
  const { palette } = useTheme();
  const money = useMoneyFormat();
  return (
    <View style={{ paddingBottom: 8 }}>
      {bills.map((b, n) => {
        const row = rows[b.index];
        if (!row) return null;
        const tile = billTile(row.hue);
        return (
          <View
            key={row.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 14,
              paddingVertical: 9,
              borderTopWidth: n === 0 ? 0 : 0.5,
              borderColor: palette.hair,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                backgroundColor: tile,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol
                name={isSymbolName(row.icon) ? row.icon : 'payments'}
                size={19}
                fill={1}
                color="#ffffff"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink }}>
                {row.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Slices slices={b.slices} tile={tile} colours={colours} />
                <Text
                  numberOfLines={1}
                  style={{ ...body(12, 500), color: colours.due, flexShrink: 1 }}
                >
                  {dueOf(b)}
                </Text>
              </View>
            </View>
            <Text style={{ ...body(15, 650), ...tabular, color: palette.ink }}>
              {money.short(b.slice)}
            </Text>
          </View>
        );
      })}
      {gapNote === null ? null : (
        <View
          style={{
            marginHorizontal: 14,
            paddingTop: 10,
            borderTopWidth: 0.5,
            borderColor: palette.hair,
          }}
        >
          <Text style={{ ...body(13, 500), lineHeight: 18, color: palette.inkSoft }}>
            {gapNote}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * In hand: a dot a day at today's number, what it is for, a card to share when there is one, and
 * a way to put it in a jar.
 */
export function InHandPanel({
  days,
  fresh,
  text,
  onMove,
  footer = null,
}: {
  readonly days: number;
  readonly fresh: number;
  readonly text: string;
  readonly onMove: (() => void) | null;
  /** Under the words: the fifth Friday's chip, the day it lands. */
  readonly footer?: ReactNode;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const shown = Math.min(days, 30);
  const old = Math.max(0, shown - fresh);
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: shown }, (_, k) => (
          <View
            key={k}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: palette.ink,
              opacity: k < old ? 0.4 : 1,
            }}
          />
        ))}
      </View>
      <Text style={{ ...body(13, 500), lineHeight: 18, color: palette.inkSoft }}>{text}</Text>
      {footer === null ? null : <View style={{ alignItems: 'flex-start' }}>{footer}</View>}
      {onMove === null ? null : (
        <PanelLink icon="arrow_forward" label={t('income.inHand.move')} onPress={onMove} />
      )}
    </View>
  );
}

/** A row at a panel's foot that opens something: an icon, its words, and where it goes. */
export function PanelLink({
  icon,
  label,
  value,
  onPress,
}: {
  readonly icon: 'arrow_forward' | 'date_range';
  readonly label: string;
  readonly value?: string;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <PressScale
      accessibilityRole="button"
      scaleTo={0.98}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderColor: palette.hair,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          backgroundColor: palette.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name={icon} size={17} color={palette.ink} />
      </View>
      <Text style={{ ...body(15, 600), color: palette.ink, flex: 1 }}>{label}</Text>
      {value ? <Text style={{ ...body(13.5, 500), color: palette.inkSoft }}>{value}</Text> : null}
      {icon === 'date_range' ? (
        <Symbol name="chevron_right" size={18} color={palette.inkSoft} />
      ) : null}
    </PressScale>
  );
}

/** "Still to set aside": the month's bills and jars, earliest due first, each ticked when covered. */
export function StillToSetAside({
  items,
  name,
  sub,
  icon,
}: {
  readonly items: readonly SetAsideItem[];
  readonly name: (item: SetAsideItem) => string;
  readonly sub: (item: SetAsideItem) => string;
  /** The row's tile: a bill's own icon and hue, a jar's for Future you and the jars. */
  readonly icon: (item: SetAsideItem) => { readonly name: string; readonly hue: number };
}) {
  const { palette } = useTheme();
  const money = useMoneyFormat();
  return (
    <View style={{ paddingBottom: 8 }}>
      {items.map((item, n) => {
        const done = item.covered >= item.amount;
        const tile = icon(item);
        return (
          <View
            key={`${item.kind}${item.index ?? ''}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 14,
              paddingVertical: 9,
              borderTopWidth: n === 0 ? 0 : 0.5,
              borderColor: palette.hair,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                backgroundColor: billTile(tile.hue),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol
                name={isSymbolName(tile.name) ? tile.name : 'payments'}
                size={19}
                fill={1}
                color="#ffffff"
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink }}>
                {name(item)}
              </Text>
              <Text numberOfLines={1} style={{ ...body(12, 500), color: palette.inkSoft }}>
                {sub(item)}
              </Text>
            </View>
            <Text style={{ ...body(15, 650), ...tabular, color: palette.ink }}>
              {money.short(item.amount)}
            </Text>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: done ? palette.ink : palette.inkSoft,
                backgroundColor: done ? palette.ink : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {done ? <Symbol name="check" size={15} color={palette.sheetSolid} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

import { useMemo, useRef, useState } from 'react';
import { Text, View, type TextStyle } from 'react-native';

import { localeOf } from '@6pm/i18n';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, faceLineHeight, tabular } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { RollingText } from './rolling-text';
import type { FillMode } from './use-new-jar';

/** The strip's type: smaller than the payday strip's 28, as its cells are words. */
const STRIP_SIZE = 22;
/** Room around a cell's words, and the narrowest cell. */
const CELL_PAD = 30;
const CELL_MIN = 64;
/** Where the amount goes in the line's words. */
const SLOT = '\u0001';

/**
 * How New jar fills, under "By a date" | "Each payday": one strip that runs the sheet's width and
 * snaps a cell under its band with a tick, then one line that says what it means. By a date the
 * strip is the months ahead, two years of them, the year over the month it begins ("2027" over
 * January); each payday it is the steady amounts, with "Other amount" for the keypad. The line is
 * "2,1tr each payday · 4 paydays" (or "· full in 4 paydays"), its amount rolling on the odometer.
 * The strip's first and last cells can stand in the middle, so none is ever cut at an edge.
 */
export function FillPicker({
  mode,
  months,
  month,
  onMonth,
  amounts,
  steady,
  onSteady,
  onOtherAmount,
  each,
  paydays,
  bleed,
}: {
  readonly mode: FillMode;
  /** 'YYYY-MM', in order. */
  readonly months: readonly string[];
  readonly month: string;
  readonly onMonth: (month: string) => void;
  /** The steady amounts, in order. */
  readonly amounts: readonly number[];
  readonly steady: number;
  readonly onSteady: (amount: number) => void;
  readonly onOtherAmount: () => void;
  /** What goes in each payday. */
  readonly each: number;
  /** Paydays until it is full, null when it never fills that way. */
  readonly paydays: number | null;
  /** The sheet's side padding: the strip reaches past it to the sheet's edges. */
  readonly bleed: number;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const locale = localeOf(language);

  const monthList = useMemo(
    () => (months.includes(month) || month === '' ? months : [...months, month].sort()),
    [months, month],
  );
  const words = useMemo(() => {
    const f = (o: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o });
    const short = f({ month: 'short' });
    const year = f({ year: 'numeric' });
    const spoken = f({ month: 'long', year: 'numeric' });
    const date = (m: string) => {
      const [y = 2000, n = 1] = m.split('-').map(Number);
      return new Date(Date.UTC(y, n - 1, 1));
    };
    return {
      items: monthList.map((m) => short.format(date(m))),
      // The year over the first month and over each January after it.
      marks: monthList.map((m, i) => (i === 0 || m.endsWith('-01') ? year.format(date(m)) : null)),
      spoken: monthList.map((m) => spoken.format(date(m))),
    };
  }, [monthList, locale]);

  const amountList = useMemo(
    () => (amounts.includes(steady) ? amounts : [...amounts, steady].sort((a, b) => a - b)),
    [amounts, steady],
  );
  const amountItems = amountList.map((a) => money.short(a));
  const amountSpoken = amountList.map((a) => money.spoken(a));

  const line =
    paydays === null
      ? t('pots.new.eachLine', { amount: SLOT })
      : mode === 'date'
        ? t('pots.new.byDateLine', { amount: SLOT, count: paydays })
        : t('pots.new.steadyLine', { amount: SLOT, count: paydays });
  const [before = '', after = ''] = line.split(SLOT);
  const amountStyle: TextStyle = { ...display(24, 500), color: palette.ink };
  const wordsStyle: TextStyle = { ...body(15, 500), color: palette.inkSoft };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ marginHorizontal: -bleed }}>
        {mode === 'date' ? (
          <MeasuredStrip
            key="months"
            items={words.items}
            marks={words.marks}
            index={Math.max(0, monthList.indexOf(month))}
            onChange={(i) => {
              const next = monthList[i];
              if (next !== undefined) onMonth(next);
            }}
            label={t('pots.new.byDate')}
            spoken={words.spoken}
          />
        ) : (
          <MeasuredStrip
            key="steady"
            items={amountItems}
            index={Math.max(0, amountList.indexOf(steady))}
            onChange={(i) => {
              const next = amountList[i];
              if (next !== undefined) onSteady(next);
            }}
            label={t('pots.new.amountTitle')}
            spoken={amountSpoken}
          />
        )}
      </View>
      <View
        accessible
        accessibilityLabel={line.replace(SLOT, money.spoken(each))}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingHorizontal: 8,
        }}
      >
        {before ? <Text style={[wordsStyle, { paddingBottom: 3 }]}>{before}</Text> : null}
        <RollingText
          text={money.short(each)}
          style={amountStyle}
          lineHeight={faceLineHeight(amountStyle)}
        />
        {after ? <Text style={[wordsStyle, { paddingBottom: 3 }]}>{after}</Text> : null}
      </View>
      {mode === 'steady' ? (
        <PressScale
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => {
            haptics.tap();
            onOtherAmount();
          }}
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: 34,
            paddingHorizontal: 14,
            borderRadius: 99,
            backgroundColor: palette.chipBg,
          }}
        >
          <Symbol name="edit" size={15} color={palette.ink} />
          <Text style={{ ...body(13.5, 650), color: palette.ink }}>
            {t('pots.new.otherAmount')}
          </Text>
        </PressScale>
      ) : null}
    </View>
  );
}

/**
 * The strip once its cells' words are measured in the face (each cell as wide as its words and
 * the room around them); until then, empty room of its height, so nothing moves when it draws.
 */
function MeasuredStrip({
  items,
  marks,
  index,
  onChange,
  label,
  spoken,
}: {
  readonly items: readonly string[];
  readonly marks?: readonly (string | null)[];
  readonly index: number;
  readonly onChange: (index: number) => void;
  readonly label: string;
  readonly spoken: readonly string[];
}) {
  const { palette } = useTheme();
  const textStyle: TextStyle = { ...display(STRIP_SIZE, 600, -0.03), ...tabular };
  const key = items.join('|');
  const [widths, setWidths] = useState<{ readonly key: string; readonly w: number[] } | null>(null);
  const measured = useRef<{ key: string; w: number[] }>({ key, w: [] });
  if (measured.current.key !== key) measured.current = { key, w: [] };
  const ready = widths !== null && widths.key === key ? widths.w : null;
  return (
    <View style={{ minHeight: 52 + (marks ? 18 : 0) }}>
      {ready === null ? (
        <View pointerEvents="none" style={{ opacity: 0 }}>
          {items.map((item, i) => (
            <View key={`${i}:${item}`} style={{ position: 'absolute', left: 0, top: 0 }}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                onLayout={(e) => {
                  const at = measured.current;
                  at.w[i] = Math.max(CELL_MIN, Math.ceil(e.nativeEvent.layout.width) + CELL_PAD);
                  if (items.every((_, n) => (at.w[n] ?? 0) > 0)) setWidths({ key, w: [...at.w] });
                }}
                style={textStyle}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Strip
          items={items}
          widths={ready}
          index={index}
          onChange={onChange}
          ink={palette.ink}
          band={palette.tabActive}
          label={label}
          spoken={spoken}
          size={STRIP_SIZE}
          {...(marks ? { marks, markInk: palette.inkSoft } : {})}
        />
      )}
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { receiptBankOf, type CaptureFix, type SpendRow } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { catchInk, paperInk } from '@6pm/theme';

import { readMonthReading, type MonthReading } from '../../data/first-catch';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { TapeEdge } from '../capture-guide/capture-log-tape';

/** Slips at full size, in one row, with the shop and the amount printed. */
const FULL_SLIPS = 5;
/** Past that, slips shrink to this many a row and keep the day alone. */
const COLUMNS = 10;
/** Slips print in one after another, 12 ms apart. */
const PRINT_STAGGER_MS = 12;
/** The selected slip lifts with the house pop. */
const pop = { damping: 12, stiffness: 260, mass: 0.7 } as const;

function slipFill(index: number, reduceMotion: boolean) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ scaleY: 0.2 }] },
    100: { opacity: 1, transform: [{ scaleY: 1 }], easing: Easing.bezier(0.2, 0.9, 0.2, 1) },
  })
    .duration(reduceMotion ? 200 : 350)
    .delay(reduceMotion ? 0 : index * PRINT_STAGGER_MS)
    .reduceMotion(ReduceMotion.Never);
}

/** This month's count, read once when the page opens and again as spends change. */
export function useMonthReading(): MonthReading | null {
  const store = useMoneyStore();
  const { today, cycleSpends } = useMoney();
  const [reading, setReading] = useState<MonthReading | null>(null);
  useEffect(() => {
    let live = true;
    void readMonthReading(store, today)
      .then((next) => {
        if (live) setReading(next);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, today, cycleSpends]);
  return reading;
}

/**
 * Settings › Your data › "Read on this phone": this month's receipts as paper slips (shared or
 * scanned, by the day they arrived), how many were read right the first time, a dot on each one
 * fixed by hand (its amount or its shop; a category alone is not a miss), and for the picked one
 * what was read and what it was fixed to. Up to five slips print the day, the shop and the amount;
 * from six they shrink to ten a row with the day alone. With none yet, one ghost slip says how the
 * count starts. The foot says honestly where reading happened: on the phone, but for any photo
 * sent once for the closer look. Counted on the phone; resets each month.
 */
export function ReadOnPhone() {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const { today } = useMoney();
  const reading = useMonthReading();
  const [picked, setPicked] = useState<string | null>(null);
  if (reading === null) return null;
  const { accuracy, receipts } = reading;
  const fixed = new Map(accuracy.fixes.map((fix) => [fix.id, fix] as const));
  const chosen = picked ?? accuracy.fixes[0]?.id ?? null;
  const fix = chosen ? fixed.get(chosen) : undefined;
  const receipt = chosen ? receipts.find((r) => r.id === chosen) : undefined;
  const named = new Intl.DateTimeFormat(localeOf(language), { month: 'long' }).format(
    new Date(`${today}T12:00:00`),
  );
  // Vietnamese capitalises "Tháng 11" on its own, not inside a sentence ("biên lai tháng 11").
  const month = language === 'vi' ? named.toLocaleLowerCase('vi') : named;
  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, paddingHorizontal: 4 }}>
        <Text style={{ ...leading(display(64, 500, -0.03), 64, true), color: palette.ink }}>
          {accuracy.right}
          <Text style={{ fontSize: 29, opacity: 0.6 }}>{`/${accuracy.total}`}</Text>
        </Text>
        <Text style={{ ...body(14), lineHeight: 18.2, color: palette.inkSoft, flex: 1 }}>
          {t('catch.reading.lede', { month })}
        </Text>
      </View>
      {receipts.length === 0 ? (
        <GhostSlip />
      ) : (
        <Slips
          receipts={receipts}
          fixed={fixed}
          chosen={chosen}
          onPick={(id) => {
            haptics.tick();
            setPicked(id);
          }}
        />
      )}
      {fix && receipt ? <FixCard key={fix.id} fix={fix} receipt={receipt} /> : null}
      {receipts.length === 0 ? null : (
        <Text
          style={{ ...body(13.5), lineHeight: 20.3, color: palette.inkSoft, paddingHorizontal: 4 }}
        >
          {t('catch.reading.explain')}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 6 }}>
        <Symbol name="lock" size={15} color={palette.inkSoft} />
        <Text style={{ ...body(12.5), color: palette.inkSoft, flex: 1 }}>
          {accuracy.looked > 0
            ? t('catch.reading.privateLooked', { count: accuracy.looked })
            : t('catch.reading.private')}
        </Text>
      </View>
    </View>
  );
}

/** No receipt yet this month: one dashed slip where the first will print, and how it starts. */
function GhostSlip() {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 2 }}>
      <View
        style={{
          width: '18%',
          height: 66,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderWidth: 1.2,
          borderStyle: 'dashed',
          borderColor: palette.inkSoft,
        }}
      />
      <Text style={{ ...body(13.5), lineHeight: 18.9, color: palette.inkSoft, flex: 1 }}>
        {t('catch.reading.ghost')}
      </Text>
    </View>
  );
}

function Slips({
  receipts,
  fixed,
  chosen,
  onPick,
}: {
  readonly receipts: readonly SpendRow[];
  readonly fixed: ReadonlyMap<string, CaptureFix>;
  readonly chosen: string | null;
  readonly onPick: (id: string) => void;
}) {
  // Five slips at full size have room for the shop and the amount; past that, ten small ones.
  const full = receipts.length <= FULL_SLIPS;
  const columns = full ? FULL_SLIPS : COLUMNS;
  const rows: SpendRow[][] = [];
  receipts.forEach((r, k) => {
    if (k % columns === 0) rows.push([]);
    rows[rows.length - 1]?.push(r);
  });
  return (
    <View style={{ gap: full ? 0 : 8, paddingTop: 6, paddingHorizontal: 2 }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: full ? 7 : 5 }}>
          {Array.from({ length: columns }, (_, c) => {
            const receipt = row[c];
            return (
              <View key={c} style={{ flex: 1, minWidth: 0 }}>
                {receipt ? (
                  <Slip
                    index={r * columns + c}
                    receipt={receipt}
                    full={full}
                    fixed={fixed.has(receipt.id)}
                    on={receipt.id === chosen}
                    onPick={() => onPick(receipt.id)}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Slip({
  index,
  receipt,
  full,
  fixed,
  on,
  onPick,
}: {
  readonly index: number;
  readonly receipt: SpendRow;
  readonly full: boolean;
  readonly fixed: boolean;
  readonly on: boolean;
  readonly onPick: () => void;
}) {
  const { palette } = useTheme();
  const { language } = useI18n();
  const money = useMoneyFormat();
  const reduceMotion = useReducedMotion();
  const raised = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    raised.set(
      reduceMotion ? withTiming(on ? 1 : 0, { duration: 200 }) : withSpring(on ? 1 : 0, pop),
    );
  }, [on, raised, reduceMotion]);
  const lift = useAnimatedStyle(() => ({
    transform: [{ translateY: -5 * raised.get() }, { rotate: `${-3 * raised.get()}deg` }],
  }));
  const locale = localeOf(language);
  const date = new Date(`${receipt.day}T12:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  const day = `${weekday} ${date.getDate()}`.toLocaleUpperCase(locale);
  return (
    <Animated.View entering={slipFill(index, reduceMotion)} style={{ transformOrigin: '50% 100%' }}>
      <PressScale
        disabled={!fixed}
        accessibilityRole={fixed ? 'button' : 'image'}
        accessibilityLabel={full ? `${day} ${receipt.merchant}` : day}
        onPress={onPick}
        scaleTo={0.94}
      >
        <Animated.View style={lift}>
          <View
            style={{
              paddingTop: 7,
              paddingHorizontal: full ? 6 : 3,
              paddingBottom: 5,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              backgroundColor: paperInk.sheet,
              boxShadow: on ? `0 0 0 2px ${palette.accent}` : 'none',
              gap: 3,
            }}
          >
            <Text numberOfLines={1} style={{ ...mono(8, 500, 0.1), color: catchInk.tapeSoft }}>
              {day}
            </Text>
            {full ? (
              <>
                <Text
                  numberOfLines={2}
                  style={{ ...body(10.5, 700), lineHeight: 12.1, height: 24, color: paperInk.ink }}
                >
                  {receipt.merchant}
                </Text>
                <DashedRule color={catchInk.tapeRule} />
                <Text
                  numberOfLines={1}
                  style={{
                    ...mono(9.5, 600),
                    color: paperInk.ink,
                    textAlign: 'right',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {money.number(receipt.amount)}
                </Text>
              </>
            ) : null}
          </View>
          <TapeEdge foot depth={6} />
          {fixed ? (
            <View
              style={{
                position: 'absolute',
                right: -4,
                top: -4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: palette.accent,
                boxShadow: `0 0 0 2px ${palette.sheetSolid}`,
              }}
            />
          ) : null}
        </Animated.View>
      </PressScale>
    </Animated.View>
  );
}

/** What the picked receipt was read as and what it was fixed to: its amount, else its shop. */
function FixCard({ fix, receipt }: { readonly fix: CaptureFix; readonly receipt: SpendRow }) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const reduceMotion = useReducedMotion();
  const bank = receiptBankOf(receipt.detail) ?? receipt.detail;
  const src = [bank, t('source.shared')].filter((part) => !!part).join(' · ');
  const when = new Intl.DateTimeFormat(localeOf(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${fix.day}T12:00:00`));
  const [readAs, fixedTo] = fix.amount
    ? [fix.amount.from === null ? '—' : money.number(fix.amount.from), money.number(fix.amount.to)]
    : [fix.merchant?.from ?? '', fix.merchant?.to ?? ''];
  const kicker = {
    ...mono(10.5, 500, 0.12),
    color: palette.inkSoft,
    textTransform: 'uppercase',
  } as const;
  return (
    <Animated.View
      entering={new Keyframe({
        0: { opacity: 0, transform: [{ translateY: 14 }] },
        100: { opacity: 1, transform: [{ translateY: 0 }] },
      })
        .duration(reduceMotion ? 200 : 300)
        .reduceMotion(ReduceMotion.Never)}
      style={{
        borderRadius: 22,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text numberOfLines={1} style={{ ...kicker, flexShrink: 1 }}>
          {src}
        </Text>
        <Text style={kicker}>{when}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text style={{ ...body(11.5), color: palette.inkSoft }}>{t('catch.reading.readAs')}</Text>
          <Text
            numberOfLines={1}
            style={{
              ...display(24, 400),
              color: palette.ink,
              opacity: 0.6,
              textDecorationLine: 'line-through',
              textDecorationColor: palette.accent,
            }}
          >
            {readAs}
          </Text>
        </View>
        <Symbol name="arrow_forward" size={22} color={palette.accent} />
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text style={{ ...body(11.5), color: palette.inkSoft }}>
            {t('catch.reading.fixedTo')}
          </Text>
          <Text numberOfLines={1} style={{ ...display(24, 400), color: palette.ink }}>
            {fixedTo}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe } from 'react-native-reanimated';

import {
  addDays,
  isWorkCost,
  startOfWeek,
  workDayOf,
  workTotals,
  type ClosedDayRow,
  type LocalDate,
  type SpendRow,
} from '@6pm/domain';
import { paperInk, workInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { Symbol } from '../../ui/icons/symbol';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, families, mono, tabular } from '../../ui/type/fonts';
import { WorkStamp } from './work-stamp';

/** Switching to Work reprints the receipts out of the slot: 320 ms. */
const reprint = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -24 }] },
  35: { opacity: 1 },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(0.45, 0.05, 0.4, 1) },
}).duration(320);
/** Each receipt lies a little crooked on the page, as the canvas drops them. */
const TILTS = ['-1deg', '2.2deg', '-1.6deg', '1.2deg'] as const;

/** "Everything | Work" under the Diary's title: only for someone with work on. */
export function WorkFilter({
  work,
  onChange,
}: {
  readonly work: boolean;
  readonly onChange: (work: boolean) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const chip = (on: boolean, label: string, icon: boolean, press: () => void) => (
    <PressScale
      onPress={press}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        ...(on
          ? { backgroundColor: palette.dark ? workInk.onDark : workInk.paper }
          : { borderWidth: 1, borderColor: palette.hair }),
      }}
    >
      {icon ? (
        <Symbol
          name="storefront"
          size={16}
          color={on ? (palette.dark ? workInk.chipInk : '#ffffff') : palette.inkSoft}
        />
      ) : null}
      <Text
        style={{
          ...body(14, 650),
          color: on ? (palette.dark ? workInk.chipInk : '#ffffff') : palette.inkSoft,
        }}
      >
        {label}
      </Text>
    </PressScale>
  );
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 6 }}>
      {chip(!work, t('work.diary.everything'), false, () => onChange(false))}
      {chip(work, t('work.diary.work'), true, () => onChange(true))}
    </View>
  );
}

/** This week's work rows, read for the days the snapshot may not hold. */
function useWeekRows(from: LocalDate, to: LocalDate): readonly SpendRow[] {
  const store = useMoneyStore();
  const snap = useMoney();
  const [rows, setRows] = useState<readonly SpendRow[]>([]);
  useEffect(() => {
    let live = true;
    store.tables.spends
      .select("WHERE day >= ? AND day <= ? AND for_work = 1 AND status != 'deleted' ORDER BY at", [
        from,
        to,
      ])
      .then((found) => live && setRows(found))
      .catch(() => undefined);
    return () => {
      live = false;
    };
    // Read again whenever the money changes.
  }, [store, from, to, snap]);
  return rows;
}

/**
 * The Diary filtered to work: the week's days with what each kept, the closed days' work
 * receipts (takings at the top, costs below, what the work kept where the total was, the day's
 * note), and the week's in, out and kept.
 */
export function WorkDiary() {
  const snap = useMoney();
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const from = startOfWeek(snap.today);
  const to = addDays(from, 6);
  const rows = useWeekRows(from, to);
  const closed = useMemo(
    () => new Map(snap.closedDays.map((d) => [d.day, d] as const)),
    [snap.closedDays],
  );
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const receipts = days.filter((d) => closed.has(d) && rows.some((r) => r.day === d)).reverse();
  const week = workTotals(rows, from, to);
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {days.map((d) => {
          const isToday = d === snap.today;
          const kept = closed.has(d) ? workDayOf(rows, d).kept : null;
          return (
            <View
              key={d}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                backgroundColor: isToday ? palette.btnBg : palette.chipBg,
                opacity: d > snap.today ? 0.4 : 1,
                ...(isToday ? { boxShadow: '0 8px 20px rgba(8,3,16,.35)' } : {}),
              }}
            >
              <Text style={{ ...body(14, 650), color: isToday ? palette.btnFg : palette.ink }}>
                {Number(d.slice(8))}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 12 }}>
                {kept !== null && kept !== 0 ? (
                  <>
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: isToday || !palette.dark ? workInk.paper : workInk.onDark,
                      }}
                    />
                    <Animated.Text
                      entering={FadeIn.duration(200)}
                      style={{
                        ...mono(9.5),
                        color: isToday ? palette.btnFg : palette.inkSoft,
                        opacity: 0.72,
                      }}
                    >
                      {money.short(kept)}
                    </Animated.Text>
                  </>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      {receipts.length === 0 ? (
        <Text style={{ ...body(15), lineHeight: 21, color: palette.inkSoft, paddingHorizontal: 6 }}>
          {t('work.diary.empty')}
        </Text>
      ) : (
        receipts.map((d, i) => (
          <WorkReceipt
            key={d}
            day={d}
            rows={rows}
            closed={closed.get(d) ?? null}
            tilt={TILTS[i % TILTS.length] ?? '0deg'}
            date={i18n.weekdayDayShort(new Date(`${d}T12:00:00`)).toUpperCase()}
          />
        ))
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ ...mono(11, 400, 0.1), color: palette.inkSoft }}>
          {t('work.diary.week')}
        </Text>
        <Text style={{ ...mono(11, 400, 0.1), color: palette.inkSoft }}>
          {t('work.diary.weekLine', {
            in: money.short(week.in).toUpperCase(),
            out: money.short(week.out).toUpperCase(),
            kept: money.short(week.kept).toUpperCase(),
          })}
        </Text>
      </View>
    </View>
  );
}

/** One closed day's work receipt. */
function WorkReceipt({
  day,
  rows,
  closed,
  tilt,
  date,
}: {
  readonly day: LocalDate;
  readonly rows: readonly SpendRow[];
  readonly closed: ClosedDayRow | null;
  readonly tilt: string;
  readonly date: string;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const work = workDayOf(rows, day);
  const costs = rows.filter((r) => r.day === day && isWorkCost(r));
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const line = { ...mono(12), color: paperInk.ink } as const;
  const inLine = { ...mono(12), color: workInk.paper } as const;
  const lead = { ...mono(12), color: paperInk.soft, width: 38 } as const;
  return (
    <Animated.View
      entering={reprint}
      style={{ marginHorizontal: 18, transform: [{ rotate: tilt }] }}
    >
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <PaperEdge color={paperInk.sheet} height={9} step={12} shadow={false} />
      </View>
      <View
        style={{
          backgroundColor: paperInk.sheet,
          boxShadow: '0 16px 22px rgba(15,5,25,.3)',
          paddingTop: 8,
          paddingHorizontal: 20,
          paddingBottom: 14,
          gap: 6,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: paperInk.soft }}>{date}</Text>
          <Text style={{ ...mono(10.5, 400, 0.14), color: paperInk.soft }}>
            {closed
              ? `${t('close.receipt.closed')} ${time(closed.closedAt)}`
              : t('work.diary.open')}
          </Text>
        </View>
        <DashedRule color={paperInk.rule} />
        {work.transfers > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={lead}>{t('work.diary.in')}</Text>
            <Text numberOfLines={1} style={[inLine, { flex: 1 }]}>
              {t('work.diary.caught', { count: work.transfers })}
            </Text>
            <Text style={[inLine, tabular]}>{money.number(work.caught)}</Text>
          </View>
        ) : null}
        {work.cash > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={lead}>{work.transfers > 0 ? '' : t('work.diary.in')}</Text>
            <Text numberOfLines={1} style={[inLine, { flex: 1 }]}>
              {t('work.takings.cash')}
            </Text>
            <Text style={[inLine, tabular]}>{money.number(work.cash)}</Text>
          </View>
        ) : null}
        {costs.length > 0 ? <DashedRule color={paperInk.rule} /> : null}
        {costs.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={lead}>{time(c.at)}</Text>
            <Text numberOfLines={1} style={[line, { flex: 1 }]}>
              {c.merchant.toUpperCase()}
            </Text>
            <Text style={[line, tabular]}>−{money.number(c.amount)}</Text>
          </View>
        ))}
        <DashedRule color={paperInk.rule} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...mono(14, 600), color: paperInk.ink }}>{t('work.takings.kept')}</Text>
          <View style={{ flex: 1, paddingLeft: 18 }}>
            <View style={{ alignSelf: 'flex-start' }}>
              <WorkStamp
                face="always"
                labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
              />
            </View>
          </View>
          <Text style={{ ...mono(14, 600), ...tabular, color: paperInk.ink }}>
            {work.kept < 0 ? `−${money.number(-work.kept)}` : money.number(work.kept)}
          </Text>
        </View>
        {closed?.note ? (
          <Text
            style={{
              fontFamily: families.hand,
              fontSize: 20,
              lineHeight: 22,
              color: paperInk.hand,
              marginTop: 6,
              transform: [{ rotate: '-2deg' }],
            }}
          >
            {closed.note}
          </Text>
        ) : null}
      </View>
      <PaperEdge color={paperInk.sheet} height={9} step={12} shadow={false} />
    </Animated.View>
  );
}

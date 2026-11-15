import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cycleMonth, diffDays, owedByPerson, workOwed, type OwedPerson } from '@6pm/domain';
import { workInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { owedLineOf } from '../../data/owed-actions';
import { wageLedgerOf, workMonthOf } from '../../data/work-money';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, tabular } from '../../ui/type/fonts';
import { requestHomeTab } from '../home/home-tab-request';
import { Avatar } from '../owed/owed-parts';
import { useOwed } from '../owed/use-owed';
import { ordinalDay } from '../onboarding/step-parts';
import { Hatch } from '../plan/hatch';
import { usePlanFormat } from '../plan/plan-format';
import { requestWorkDiary } from './work-diary-request';

/** The bar grows on each close: 500 ms. */
const GROW_MS = 500;
const grow = Easing.bezier(0.2, 0.9, 0.2, 1);

/**
 * Plan's Work card, only for someone with work on: what came in, what went out and what the work
 * kept this month, a bar of in (hatched out, solid kept), who has not paid with the same Ask as a
 * friend's strip, and the way into the Work diary. Its title opens how work pays the person.
 */
export function WorkCard() {
  const snap = useMoney();
  const router = useRouter();
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const format = usePlanFormat(snap.today);
  const month = workMonthOf(snap);
  // A wage bigger than what the shop held is paid as far as it reaches; the rest is owed.
  const owedToYou = wageLedgerOf(snap)?.owed ?? 0;
  const { rows } = useOwed();
  const people = useMemo(() => {
    const spends = new Map<string, { readonly forWork?: boolean }>(
      snap.cycleSpends.map((s) => [s.id, s] as const),
    );
    // A client's request is a share of no spend: its own work stamp says whether it is work.
    for (const row of rows)
      if (row.code != null) spends.set(row.spendId, { forWork: row.work === true });
    return owedByPerson(workOwed(rows.map(owedLineOf), spends));
  }, [rows, snap.cycleSpends]);
  const merchants = useMemo(
    () => new Map(snap.cycleSpends.map((s) => [s.id, s.merchant] as const)),
    [snap.cycleSpends],
  );
  const shown = useSharedValue(0);
  const total = month ? Math.max(1, month.in) : 1;
  useEffect(() => {
    shown.set(0);
    shown.set(
      withTiming(1, { duration: GROW_MS, easing: grow, reduceMotion: ReduceMotion.System }),
    );
  }, [shown, month?.in, month?.out]);
  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: shown.get() }] }));
  if (month === null) return null;

  const ink = palette.dark ? workInk.onDark : workInk.paper;
  const out = Math.min(month.out, month.in);
  const kept = Math.max(0, month.in - out);
  const label = { ...body(12.5, 600), color: palette.inkSoft } as const;
  const figure = { ...display(28, 500, -0.02), ...tabular, lineHeight: 30 } as const;
  const ask = (person: OwedPerson) => {
    haptics.tap();
    router.push({ pathname: '/owed', params: { ask: person.key } } as unknown as Href);
  };
  const openDiary = () => {
    haptics.tick();
    requestWorkDiary();
    requestHomeTab('diary');
  };
  return (
    <View
      style={{
        borderRadius: 26,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        overflow: 'hidden',
      }}
    >
      <PressScale
        scaleTo={0.98}
        onPress={() => {
          haptics.tick();
          router.push('/work-money');
        }}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 4,
        }}
      >
        <Text style={{ ...body(17, 700), color: palette.ink }}>{t('work.card.title')}</Text>
        <Text style={{ ...body(13, 600), color: palette.inkSoft }}>
          {t('work.card.month', {
            month: format.monthLong(cycleMonth(snap.cycle)),
            day: ordinalDay(i18n, Number(snap.today.slice(8))),
          })}
        </Text>
      </PressScale>
      <View style={{ marginTop: 6, marginHorizontal: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(
            [
              ['work.card.in', month.in, palette.ink],
              ['work.card.out', month.out, palette.ink],
              ['work.card.kept', month.kept, ink],
            ] as const
          ).map(([key, amount, color]) => (
            <View key={key} style={{ flex: 1, gap: 2 }}>
              <Text style={label}>{t(key)}</Text>
              <Text style={{ ...figure, color }}>{money.short(amount)}</Text>
            </View>
          ))}
        </View>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              height: 12,
              borderRadius: 6,
              overflow: 'hidden',
              gap: 2,
              transformOrigin: 'left',
            },
            bar,
          ]}
        >
          {out > 0 ? (
            <View style={{ flex: out / total }}>
              <Hatch
                a={palette.dark ? workInk.hatchA : workInk.hatchALight}
                b={palette.dark ? workInk.hatchB : workInk.hatchBLight}
                width={5}
                reach={360}
              />
            </View>
          ) : null}
          {kept > 0 ? <View style={{ flex: kept / total, backgroundColor: ink }} /> : null}
          {month.in === 0 ? <View style={{ flex: 1, backgroundColor: palette.chipBg }} /> : null}
        </Animated.View>
        {month.waiting > 0 ? (
          <Text style={{ ...body(13, 600), color: palette.inkSoft }}>
            {t('work.card.waiting', { amount: money.short(month.waiting) })}
          </Text>
        ) : null}
        {owedToYou > 0 ? (
          <Text style={{ ...body(13, 600), color: palette.inkSoft }}>
            {t('work.card.owed', { amount: money.short(owedToYou) })}
          </Text>
        ) : null}
      </View>
      {people.length > 0 ? (
        <Text
          style={{
            ...body(13, 600, 0.04),
            color: palette.inkSoft,
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 4,
          }}
        >
          {t('work.card.notPaid')}
        </Text>
      ) : null}
      {people.map((person, i) => {
        const oldest = person.lines.reduce(
          (a, l) => (l.day < a ? l.day : a),
          person.lines[0]?.day ?? snap.today,
        );
        const what = merchants.get(person.lines[0]?.spendId ?? '') ?? '';
        const days = t('work.card.days', { count: Math.max(0, diffDays(snap.today, oldest)) });
        return (
          <View
            key={person.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 14,
              paddingVertical: 10,
              ...(i > 0 ? { borderTopWidth: 0.5, borderTopColor: palette.hair } : {}),
            }}
          >
            <Avatar name={person.name} size={36} />
            <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
              <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink }}>
                {`${person.name ?? '?'} · ${money.short(person.total)}`}
              </Text>
              <Text numberOfLines={1} style={{ ...body(12), color: palette.inkSoft }}>
                {what ? `${what} · ${days}` : days}
              </Text>
            </View>
            <PressScale
              onPress={() => ask(person)}
              accessibilityRole="button"
              style={{
                height: 32,
                paddingLeft: 9,
                paddingRight: 12,
                borderRadius: 99,
                backgroundColor: palette.btnBg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Symbol name="qr_code_scanner" size={17} color={palette.btnFg} />
              <Text style={{ ...body(13, 650), color: palette.btnFg }}>{t('owed.list.ask')}</Text>
            </PressScale>
          </View>
        );
      })}
      <PressScale
        highlight
        onPress={openDiary}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 12,
          marginTop: people.length > 0 ? 0 : 10,
          borderTopWidth: 0.5,
          borderTopColor: palette.hair,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="auto_stories" size={19} color={palette.ink} />
        </View>
        <Text style={{ ...body(15, 600), color: palette.ink, flex: 1 }}>
          {t('work.card.diary')}
        </Text>
        <Symbol name="chevron_right" size={20} color={palette.ink} style={{ opacity: 0.6 }} />
      </PressScale>
      {/* The year (board 8): work money in against the line, held back, the list to hand over. */}
      <PressScale
        highlight
        onPress={() => {
          haptics.tick();
          router.push('/work-year');
        }}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 0.5,
          borderTopColor: palette.hair,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="calendar_month" size={19} color={palette.ink} />
        </View>
        <Text style={{ ...body(15, 600), color: palette.ink, flex: 1 }}>{t('workYear.row')}</Text>
        <Symbol name="chevron_right" size={20} color={palette.ink} style={{ opacity: 0.6 }} />
      </PressScale>
    </View>
  );
}

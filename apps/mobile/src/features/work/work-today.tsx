import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { isTakings, isWorkCost, workDayOf } from '@6pm/domain';
import { workInk } from '@6pm/theme';

import type { MoneySnapshot } from '../../data/money-store';
import { workOf } from '../../data/work-money';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono, tabular } from '../../ui/type/fonts';

/** The room the takings line takes under Today's meter: the sheet starts this much lower. */
export const TAKINGS_ROOM = 34;

/** What Today shows of a seller's work: the takings so far, and today's work spends, folded. */
export interface WorkToday {
  /** Today's rows that are work, kept out of the list: the folded row and the line stand for them. */
  readonly hidden: ReadonlySet<string>;
  readonly takings: number;
  readonly costs: { readonly count: number; readonly amount: number } | null;
}

/** Today's work for someone with work on; null for everyone else. */
export function workTodayOf(snap: MoneySnapshot): WorkToday | null {
  if (workOf(snap) === null) return null;
  const today = snap.cycleSpends.filter((s) => s.day === snap.today);
  const day = workDayOf(today, snap.today);
  return {
    hidden: new Set(today.filter((s) => isTakings(s) || isWorkCost(s)).map((s) => s.id)),
    takings: day.takings,
    costs: day.costCount > 0 ? { count: day.costCount, amount: day.costs } : null,
  };
}

/** "Takings 1,49tr · so far ›" under the meter; it opens today's takings. */
export function TakingsLine({ takings }: { readonly takings: number }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  return (
    <PressScale
      hitSlop={8}
      onPress={() => {
        haptics.tick();
        router.push('/takings');
      }}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 12 }}
    >
      <Symbol name="storefront" size={17} color={palette.ink} />
      <Text style={{ ...body(13.5, 600), color: palette.ink }}>
        {t('work.today.takings', { amount: money.short(takings) })}
        <Text style={{ ...body(13.5, 500), color: palette.inkSoft }}>{t('work.today.soFar')}</Text>
      </Text>
      <Symbol name="chevron_right" size={17} color={palette.ink} style={{ opacity: 0.6 }} />
    </PressScale>
  );
}

/**
 * Today's work spends as one row at 62%: the shop's tile, "For work · 3 spends", "not counted",
 * the WORK stamp and what they came to. They never move the meter; a tap opens the Work view.
 */
export function WorkFoldedRow({
  count,
  amount,
  onOpen,
}: {
  readonly count: number;
  readonly amount: number;
  readonly onOpen: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const ink = palette.dark ? workInk.onDark : workInk.paper;
  return (
    <PressScale
      highlight
      onPress={onOpen}
      accessibilityRole="button"
      style={{
        opacity: 0.62,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 9,
        paddingLeft: 16,
        paddingRight: 16,
        borderTopWidth: 0.5,
        borderTopColor: palette.hair,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          backgroundColor: workInk.tile,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="storefront" size={19} color="#ffffff" />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink }}>
          {t('work.today.row', { count })}
        </Text>
        <Text style={{ ...body(12), color: palette.inkSoft }}>{t('work.today.notCounted')}</Text>
      </View>
      <View
        style={{
          height: 20,
          paddingHorizontal: 7,
          borderRadius: 5,
          borderWidth: 1.5,
          borderColor: ink,
          justifyContent: 'center',
          transform: [{ rotate: '-4deg' }],
        }}
      >
        <Text style={{ ...mono(9.5, 600, 0.14), color: ink }}>{t('work.stamp')}</Text>
      </View>
      <Text style={{ ...body(14.5, 650), ...tabular, color: palette.ink }}>
        {money.short(amount)}
      </Text>
    </PressScale>
  );
}

import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { MathsRow, PlanSplit } from '@6pm/domain';

import { usePlanActions } from '../../data/plan-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { DashedRule } from '../../ui/dashed-rule';
import { useTheme } from '../../ui/theme/theme';
import { body, mono, tabular } from '../../ui/type/fonts';
import { useRunAction } from '../companion/use-run-action';
import { BillRowView } from './bill-row';
import type { PlanFormat } from './plan-format';
import { planRoutes } from './plan-routes';
import type { BillView } from './plan-view';
import type { SplitColours } from './split-colours';

/** A part's panel inside the card under the hero: its title, a note, and the part's detail. */
export function SplitPanel({
  title,
  note,
  children,
}: {
  readonly title: string;
  readonly note: string;
  readonly children: ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 4,
        }}
      >
        <Text accessibilityRole="header" style={{ ...body(17, 700), color: palette.ink }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ ...body(13, 600), color: palette.inkSoft, flexShrink: 1 }}>
          {note}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** Bills: each bill with a one-tap tick, and a way to add one. */
export function BillsPanel({
  bills,
  colours,
  format,
}: {
  readonly bills: readonly BillView[];
  readonly colours: SplitColours;
  readonly format: PlanFormat;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const actions = usePlanActions();
  const run = useRunAction();
  const router = useRouter();
  const subOf = (b: BillView) => {
    if (b.paid) return t('potsPlan.bills.paid', { date: format.dayMonth(b.due) });
    if (b.inDays > 0) return t('potsPlan.bills.due', { date: format.weekdayDay(b.due) });
    return b.inDays === 0
      ? t('potsPlan.bills.dueToday')
      : t('potsPlan.bills.overdue', { date: format.dayMonth(b.due) });
  };
  return (
    <View style={{ paddingBottom: 6 }}>
      {bills.map((b, n) => (
        <BillRowView
          key={b.bill.id}
          view={b}
          first={n === 0}
          sub={subOf(b)}
          colours={colours}
          label={t(b.paid ? 'potsPlan.bills.markUnpaid' : 'potsPlan.bills.markPaid', {
            name: b.bill.name,
          })}
          editLabel={t('potsPlan.bills.edit', { name: b.bill.name })}
          onToggle={() => {
            haptics.tap();
            void run(() => actions.setBillPaid(b.bill.id, !b.paid));
          }}
          onEdit={() => {
            haptics.tap();
            router.push(planRoutes.bill(b.bill.id));
          }}
        />
      ))}
      <PressScale
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          router.push(planRoutes.newBill);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginHorizontal: 14,
          paddingVertical: 9,
          borderTopWidth: bills.length > 0 ? 0.5 : 0,
          borderColor: palette.hair,
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
          <Symbol name="add" size={19} color={palette.ink} />
        </View>
        <Text style={{ ...body(15, 600), color: palette.ink }}>{t('potsPlan.bills.add')}</Text>
      </PressScale>
    </View>
  );
}

/** Today's maths: the receipt from the cycle's free money to the day's line (or to the over). */
export function MathsPanel({
  split,
  colours,
  onChangeBefore,
}: {
  readonly split: PlanSplit;
  readonly colours: SplitColours;
  /** Opens "Before 6pm" while the joined cycle lasts; the Before row is plain otherwise. */
  readonly onChangeBefore: (() => void) | undefined;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const c = colours.receipt;
  const text = (r: MathsRow): { readonly k: string; readonly v: string } => {
    const v = r.amount === null ? '' : money.short(r.amount);
    switch (r.kind) {
      case 'free':
        return { k: t('potsPlan.maths.free'), v };
      case 'before':
        return { k: t('potsPlan.maths.before'), v };
      case 'spentBefore':
        return { k: t('potsPlan.maths.spentBefore'), v };
      case 'sinceJoined':
        return { k: t('potsPlan.maths.sinceJoined'), v };
      case 'spentSoFar':
        return { k: t('potsPlan.maths.spentSoFar'), v };
      case 'left':
        return { k: t('potsPlan.maths.left'), v };
      case 'divide':
        return { k: t('potsPlan.maths.divide', { count: r.count ?? 1 }), v };
      case 'over':
        return { k: t('potsPlan.maths.over'), v };
      case 'untouched':
        return { k: t('potsPlan.maths.untouched'), v: t('potsPlan.maths.untouchedValue') };
      case 'tomorrow':
        return {
          k: t('potsPlan.maths.tomorrow'),
          v: t('potsPlan.maths.newPay', { amount: money.short(r.amount ?? 0) }),
        };
    }
  };
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
      {split.maths.map((r) => {
        const { k, v } = text(r);
        const colour = r.result ? c.result : c.ink;
        const style = { ...mono(12, r.total ? 600 : 400), color: colour };
        const line = (
          <View style={{ gap: 7 }}>
            {r.total ? <DashedRule color={c.rule} /> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ ...style, flexShrink: 1 }}>{k}</Text>
              <Text style={{ ...style, ...tabular }}>{v}</Text>
            </View>
          </View>
        );
        return r.kind === 'before' && onChangeBefore ? (
          <PressScale
            key={r.kind}
            accessibilityRole="button"
            accessibilityHint={t('potsPlan.maths.changeBefore')}
            scaleTo={0.98}
            onPress={() => {
              haptics.tap();
              onChangeBefore();
            }}
          >
            {line}
          </PressScale>
        ) : (
          <View key={r.kind}>{line}</View>
        );
      })}
    </View>
  );
}

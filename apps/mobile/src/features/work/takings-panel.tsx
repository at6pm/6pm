import { useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import {
  cashTakingsId,
  homeKeypad,
  keypadHolding,
  keypadHomeMinor,
  pressKey,
  workDayOf,
  workIncomeOf,
  type LocalDate,
} from '@6pm/domain';
import { workInk } from '@6pm/theme';

import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { takingsPerDay } from '../../data/takings-preview';
import { keepTakings } from '../../data/work-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { Keypad } from '../../ui/keypad';
import { Odometer } from '../../ui/odometer';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono, tabular } from '../../ui/type/fonts';
import { useRunAction } from '../companion/use-run-action';
import { homeDecimalMark } from '../quick-add/typed-amount';

const SLIP_TEXT = { ...mono(12), color: workInk.slipInk } as const;
const SOFT = { ...mono(12), color: workInk.slipSoft } as const;

/** A dashed rule across the slip. */
function Rule() {
  return (
    <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: workInk.slipRule }} />
  );
}

function Line({ left, right, style }: { left: string; right: ReactNode; style: object }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
      <Text numberOfLines={1} style={[style, { flexShrink: 1 }]}>
        {left}
      </Text>
      {typeof right === 'string' ? <Text style={[style, tabular]}>{right}</Text> : right}
    </View>
  );
}

/**
 * Today's takings: one entry. The caught transfers already on the slip, one line for the cash
 * the keypad writes on, the takings and what the work kept recounting on each key, and what that
 * adds to the days from tomorrow. Keep it keeps the transfers and the cash; Cancel keeps the
 * transfers alone, as a day with no entry counts them.
 */
export function TakingsPanel({
  day,
  onDone,
  header,
  fit = false,
}: {
  readonly day: LocalDate;
  readonly onDone: () => void;
  /** The sheet's handle and its Cancel, drawn by whoever holds the panel. */
  readonly header: (cancel: () => void) => ReactNode;
  /**
   * As tall as what it holds, Keep it straight under the keypad (the close's sheet, which rises
   * only as far as it needs); else it fills the sheet it is given.
   */
  readonly fit?: boolean;
}) {
  const snap = useMoney();
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const run = useRunAction();
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const money = useMoneyFormat();
  const typedBefore =
    snap.cycleSpends.find((s) => s.id === cashTakingsId(day) && s.status !== 'deleted')?.amount ??
    0;
  const [keys, setKeys] = useState(() =>
    typedBefore > 0 ? keypadHolding(money.currency, typedBefore) : homeKeypad(money.currency),
  );
  const cash = keypadHomeMinor({ ...keys, home: money.currency.code });
  const busy = useRef(false);
  const work = workDayOf(
    snap.cycleSpends.filter((s) => s.id !== cashTakingsId(day)),
    day,
  );
  const takings = work.caught + cash;
  const kept = takings - work.costs;
  const perDay = takingsPerDay(snap, day, cash);
  const asItComes = snap.plan?.work?.mode !== 'payMyself';
  const shop = workIncomeOf(snap.plan?.incomes)?.name ?? null;
  const date = new Date(`${day}T12:00:00`);

  const finish = async (withCash: boolean) => {
    if (busy.current) return;
    busy.current = true;
    const ok = await run(() => keepTakings(store, actions, day, withCash ? cash : typedBefore));
    busy.current = false;
    if (!ok) return;
    if (withCash) haptics.success();
    onDone();
  };

  return (
    <View style={fit ? null : { flex: 1, minHeight: 0 }}>
      {header(() => void finish(false))}
      <View
        style={[{ paddingTop: 4, paddingHorizontal: 16 }, fit ? null : { flex: 1, minHeight: 0 }]}
      >
        <View style={{ marginHorizontal: 6 }}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <PaperEdge color={workInk.slip} height={9} step={12} shadow={false} />
          </View>
          <View
            style={{
              backgroundColor: workInk.slip,
              boxShadow: workInk.takingsShadow,
              paddingTop: 8,
              paddingHorizontal: 20,
              paddingBottom: 12,
              gap: 8,
            }}
          >
            <Line
              left={i18n.weekdayDayShort(date).toUpperCase()}
              right={shop ? shop.toUpperCase() : ''}
              style={{ ...mono(10.5, 400, 0.14), color: workInk.slipSoft }}
            />
            <Rule />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
                <Text numberOfLines={1} style={[SOFT, { flexShrink: 1 }]}>
                  {t('work.takings.caught', { count: work.transfers })}
                </Text>
                {/* The icon font's check: the slip's mono face draws ✓ as a root sign. */}
                <Symbol name="check" size={13} weight={600} color={workInk.slipSoft} />
              </View>
              <Text style={[SOFT, tabular]}>{money.number(work.caught)}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: -8,
                paddingVertical: 6,
                paddingHorizontal: 8,
                borderRadius: 8,
                backgroundColor: workInk.slipField,
              }}
            >
              <Text style={{ ...mono(12, 600), color: workInk.slipInk }}>
                {t('work.takings.cash')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={{ ...mono(12, 600), ...tabular, color: workInk.slipInk }}>
                  {money.number(cash)}
                </Text>
                <View style={{ width: 1.5, height: 17, backgroundColor: workInk.caret }} />
              </View>
            </View>
            <Rule />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...mono(12, 600, 0.06), color: workInk.slipInk }}>
                {t('work.takings.total')}
              </Text>
              <Odometer value={takings} size={46} weight={500} color={workInk.slipInk} />
            </View>
            <Rule />
            <Line
              left={t('work.takings.costs')}
              right={`−${money.number(work.costs)}`}
              style={SOFT}
            />
            <Line
              left={t('work.takings.kept')}
              right={kept < 0 ? `−${money.number(-kept)}` : money.number(kept)}
              style={{ ...SLIP_TEXT, ...mono(12, 600) }}
            />
            <Line
              left={t(asItComes ? 'work.takings.into' : 'work.takings.waits')}
              right={asItComes ? t('work.perDay', { amount: money.number(perDay) }) : ''}
              style={{ ...mono(10.5, 400, 0.08), color: workInk.slipSoft }}
            />
          </View>
          <PaperEdge color={workInk.slip} height={9} step={12} shadow={false} />
        </View>
        <View style={{ height: 16 }} />
        <Keypad
          onPress={(key) => setKeys((k) => pressKey(k, key))}
          keyBg={palette.chipBg}
          decimal={homeDecimalMark(money)}
        />
      </View>
      <View style={{ paddingTop: 12, paddingHorizontal: 16 }}>
        <PressScale
          scaleTo={0.97}
          accessibilityRole="button"
          onPress={() => void finish(true)}
          style={{
            height: 56,
            borderRadius: 18,
            backgroundColor: palette.btnBg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Symbol name="receipt_long" size={20} color={palette.btnFg} />
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('quick.keep')}</Text>
        </PressScale>
      </View>
    </View>
  );
}

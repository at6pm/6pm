import { useState, type ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { billChoicesFor, spendDayRange, movedTo, REPAYMENT, type SpendRow } from '@6pm/domain';

import { useBillPayments } from '../../data/bill-payments';
import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { ChoiceMenu, type MenuChoice } from '../../ui/primitives/choice-menu';
import { PressScale } from '../../ui/primitives/press-scale';
import { useClock } from '../../ui/theme/clock';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { useRunAction } from '../companion/use-run-action';
import { useWalletOptions } from '../quick-add/use-wallet-options';
import { useAutosavedNote, useAutosavedText } from './use-autosaved-note';
import { WhenPicker } from './when-picker';

/** The menu key for "not a bill": bill ids are never empty. */
const NO_BILL = '';

/** One line of the card: a label on the left and what it holds on the right. */
function Line({ first, children }: { readonly first?: boolean; readonly children: ReactNode }) {
  const { palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        paddingVertical: 13,
        borderTopWidth: 0.5,
        borderTopColor: first ? 'transparent' : palette.hair,
      }}
    >
      {children}
    </View>
  );
}

/**
 * The detail's card: the shop and when (both fixable), the pot, the wallet, the status, and the
 * note. Text saves as it is typed; the when wheels open under their row and save as they turn.
 */
export function DetailsCard({
  spend,
  when,
  onUpdate,
}: {
  readonly spend: SpendRow;
  /** "Wed 14 Oct · 08:15" */
  readonly when: string;
  readonly onUpdate: (patch: Partial<SpendRow>) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const snap = useMoney();
  const { now } = useClock();
  const wallets = useWalletOptions(spend.wallet);
  const [merchant, setMerchant] = useState(spend.merchant);
  const [note, setNote] = useState(spend.note ?? '');
  const shop = useAutosavedText(spend.id, spend.merchant, 'merchant');
  const autosave = useAutosavedNote(spend.id, spend.note ?? null);
  const [picking, setPicking] = useState(false);
  const payments = useBillPayments();
  const run = useRunAction();
  // "This was a bill", for a payment the close did not catch: no, one of this cycle's bills still
  // to pay, or a card or loan with no bill.
  const paysBill = spend.paysBill ?? null;
  const billChoices = billChoicesFor(spend, snap.bills, snap.cycle);
  const billLabel = (choice: string | null) =>
    choice === null
      ? t('details.bill.no')
      : choice === REPAYMENT
        ? t('details.bill.repayment')
        : (snap.bills.find((b) => b.id === choice)?.name ?? t('today.row.bill'));
  const range = spendDayRange(spend.day, {
    today: snap.today,
    cycleStart: snap.cycle.start,
    payday: snap.plan?.payday ?? { kind: 'lastDay' },
  });
  const statusLabel = (s: SpendRow['status']) =>
    s === 'kept'
      ? t('details.status.kept')
      : s === 'pending'
        ? t('details.status.pending')
        : s === 'caught'
          ? t('details.status.caught')
          : t('details.status.skipped');

  const wallet = spend.wallet ?? 'Cash';
  const fields: {
    key: string;
    label: string;
    value: string;
    onPress?: () => void;
    menu?: {
      choices: readonly MenuChoice[];
      selected: string;
      onSelect: (key: string) => void;
    };
  }[] = [
    {
      key: 'when',
      label: t('details.when'),
      value: when,
      onPress: () => setPicking((open) => !open),
    },
    {
      key: 'pot',
      label: t('details.pot'),
      value: spend.forWork ? t('details.claimBack') : t('details.freeMoney'),
      menu: {
        choices: [
          { key: 'free', label: t('details.freeMoney') },
          { key: 'work', label: t('details.claimBack') },
        ],
        selected: spend.forWork ? 'work' : 'free',
        onSelect: (key) => onUpdate({ forWork: key === 'work' }),
      },
    },
    {
      key: 'wallet',
      label: t('details.paidWith'),
      value: wallets.find((w) => w.value === wallet)?.label ?? wallet,
      menu: {
        choices: wallets.map((w) => ({ key: w.value, label: w.label })),
        selected: wallet,
        onSelect: (key) => onUpdate({ wallet: key }),
      },
    },
    {
      key: 'bill',
      label: t('details.bill'),
      value: billLabel(paysBill),
      menu: {
        choices: billChoices.map((c) => ({ key: c ?? NO_BILL, label: billLabel(c) })),
        selected: paysBill ?? NO_BILL,
        onSelect: (key) =>
          void run(() => payments.setPaysBill(spend.id, key === NO_BILL ? null : key)),
      },
    },
    { key: 'status', label: t('details.status'), value: statusLabel(spend.status) },
  ];
  const rowStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 0.5,
    borderTopColor: palette.hair,
  } as const;
  const input = {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: palette.ink,
    padding: 0,
  } as const;

  return (
    <View
      style={{
        borderRadius: 26,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        overflow: 'hidden',
      }}
    >
      <Line first>
        <Text style={{ ...body(16), color: palette.inkSoft }}>{t('details.shop')}</Text>
        <TextInput
          value={merchant}
          onChangeText={(text) => {
            setMerchant(text);
            shop.change(text);
          }}
          onEndEditing={() => {
            void shop.flush();
            // A blank shop keeps its name.
            if (merchant.trim() === '') setMerchant(spend.merchant);
          }}
          placeholder={t('details.shopPlaceholder')}
          placeholderTextColor={palette.inkSoft}
          returnKeyType="done"
          style={input}
        />
      </Line>
      {fields.map((f) => {
        const row = (
          <>
            <Text style={{ ...body(16), color: palette.inkSoft, flex: 1 }}>{f.label}</Text>
            <Text style={{ ...body(16, 550), color: palette.ink }}>{f.value}</Text>
            {f.onPress || f.menu ? (
              <Symbol name="unfold_more" size={18} color={palette.inkSoft} />
            ) : null}
          </>
        );
        return (
          <View key={f.key}>
            {f.menu ? (
              <ChoiceMenu
                label={f.label}
                choices={f.menu.choices}
                selected={f.menu.selected}
                onSelect={f.menu.onSelect}
                highlightBleed={16}
              >
                <View style={rowStyle}>{row}</View>
              </ChoiceMenu>
            ) : (
              <PressScale
                highlight
                highlightBleed={16}
                disabled={!f.onPress}
                onPress={() => {
                  haptics.tick();
                  f.onPress?.();
                }}
                style={rowStyle}
              >
                {row}
              </PressScale>
            )}
            {f.key === 'when' && picking ? (
              <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)}>
                <WhenPicker
                  at={new Date(spend.at)}
                  range={range}
                  today={snap.today}
                  now={now}
                  onChange={(instant) => onUpdate(movedTo(instant))}
                />
              </Animated.View>
            ) : null}
          </View>
        );
      })}
      <Line>
        <Text style={{ ...body(16), color: palette.inkSoft }}>{t('details.note')}</Text>
        <TextInput
          value={note}
          onChangeText={(text) => {
            setNote(text);
            autosave.change(text);
          }}
          onEndEditing={autosave.flush}
          placeholder={t('details.notePlaceholder')}
          placeholderTextColor={palette.inkSoft}
          style={input}
        />
      </Line>
    </View>
  );
}

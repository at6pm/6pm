import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  BANKS,
  cleanAccount,
  encodeVietQR,
  findBank,
  holderName,
  type BankInfo,
  type ReceivingAccount,
} from '@6pm/domain';
import { owedInk } from '@6pm/theme';

import { useMoneyStore } from '../../data/money-provider';
import { readWallets } from '../../data/onboarding';
import { useI18n } from '../../i18n/i18n';
import { BankLogo } from '../../ui/bank-logo/bank-logo';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { EdgeSheetScroll, FittedSheet } from '../../ui/navigation/edge-sheet';
import { ChoiceMenu } from '../../ui/primitives/choice-menu';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { PaperEdge } from '../../ui/paper-edge';
import { QrCode } from './owed-parts';
import { useReceivingAccount } from './use-owed';

/** A static VietQR of the account as typed so far, or null while it cannot make one. */
function previewOf(account: ReceivingAccount): string | null {
  try {
    return encodeVietQR({ bin: account.bin, account: cleanAccount(account.account) });
  } catch {
    return null;
  }
}

function WhereItLives({
  icon,
  label,
  struck,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly struck: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 6, opacity: struck ? 0.5 : 1, width: 92 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: palette.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name={icon} size={26} color={palette.ink} />
        {struck ? (
          <View
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              top: 25,
              height: 2,
              backgroundColor: palette.ink,
              transform: [{ rotate: '-35deg' }],
            }}
          />
        ) : null}
      </View>
      <Text
        numberOfLines={2}
        style={{ ...body(11.5, 600), color: palette.inkSoft, textAlign: 'center' }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Settings › Your day › Receiving account: the bank (from the banks the user picked), the account
 * number and the name, kept only on this phone. Above them, the strip friends will scan, redrawn on
 * every keystroke; under them, where it lives: kept here, never sent, moves nothing.
 */
export function ReceivingAccountSheet({ then }: { readonly then?: string | undefined }) {
  const router = useRouter();
  const store = useMoneyStore();
  const { palette } = useTheme();
  const { t } = useI18n();
  const { account, save } = useReceivingAccount();
  const [banks, setBanks] = useState<readonly BankInfo[] | null>(null);
  const [draft, setDraft] = useState<ReceivingAccount | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      readWallets(store)
        .then((ids) => {
          if (!live) return;
          const picked = ids.flatMap((id) => {
            const bank = findBank(id);
            return bank && bank.bin !== null && bank.country === 'VN' ? [bank] : [];
          });
          // The banks the user picked first; with none picked, every bank in Vietnam.
          setBanks(
            picked.length > 0
              ? picked
              : BANKS.filter((b) => b.country === 'VN' && b.bin !== null && b.kind === 'bank'),
          );
        })
        .catch(() => live && setBanks([]));
      return () => {
        live = false;
      };
    }, [store]),
  );
  useEffect(() => {
    if (account === undefined || banks === null || draft !== null) return;
    const first = banks[0];
    setDraft(account ?? { bankId: first?.id ?? '', bin: first?.bin ?? '', account: '', name: '' });
  }, [account, banks, draft]);

  const change = (patch: Partial<ReceivingAccount>) => {
    if (!draft) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    void save(next);
  };

  const bank = draft ? findBank(draft.bankId) : null;
  const preview = draft ? previewOf(draft) : null;
  const choices = (banks ?? []).map((b) => ({ key: b.id, label: b.shortName }));
  // Opened by a first Ask: once the account can make a QR, Done goes on to that Ask.
  const done = () => {
    haptics.tick();
    if (then && draft && preview && draft.name.trim() !== '') {
      router.replace({ pathname: '/owed-ask', params: { key: then } });
      return;
    }
    router.back();
  };

  const header = (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('common.done')}
          onPress={done}
          hitSlop={8}
          style={{ position: 'absolute', left: -4, paddingVertical: 8 }}
        >
          <Symbol name="chevron_left" size={24} color={palette.ink} />
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>{t('owed.account.title')}</Text>
      </View>
    </View>
  );
  const row = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    paddingVertical: 13,
  } as const;
  const input = {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    color: palette.ink,
    padding: 0,
  } as const;

  return (
    <FittedSheet>
      {header}
      <EdgeSheetScroll
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 44, gap: 18 }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 300,
            transform: [{ rotate: '-1.5deg' }],
            boxShadow: `0 18px 28px ${owedInk.qrShadow}`,
          }}
        >
          <View style={{ transform: [{ scaleY: -1 }] }}>
            <PaperEdge color={owedInk.qrPaper} height={8} shadow={false} />
          </View>
          <View
            style={{
              backgroundColor: owedInk.qrPaper,
              paddingTop: 12,
              paddingHorizontal: 16,
              paddingBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View style={{ width: 84, height: 84, opacity: preview ? 1 : 0.15 }}>
              <QrCode payload={preview ?? '6pm'} size={84} />
            </View>
            <View style={{ gap: 4, flex: 1, minWidth: 0 }}>
              <Text style={{ ...mono(9.5, 400, 0.12), color: owedInk.qrSoft }}>
                {t('owed.account.every')}
              </Text>
              <Text numberOfLines={1} style={{ ...mono(12, 600, 0.06), color: owedInk.qrInk }}>
                {t('owed.ask.bank', {
                  bank: (bank?.shortName ?? t('owed.account.pickBank')).toUpperCase(),
                })}
              </Text>
              <Text numberOfLines={1} style={{ ...mono(12, 400, 0.06), color: owedInk.qrInk }}>
                {holderName(draft?.name ?? '')}
              </Text>
              <Text numberOfLines={1} style={{ ...mono(12, 400, 0.06), color: owedInk.qrMuted }}>
                {draft?.account ?? ''}
              </Text>
            </View>
          </View>
          <PaperEdge color={owedInk.qrPaper} height={8} shadow={false} />
        </View>

        <View
          style={{
            borderRadius: 26,
            backgroundColor: palette.cell,
            boxShadow: palette.cardShadow,
            overflow: 'hidden',
          }}
        >
          <ChoiceMenu
            label={t('owed.account.bank')}
            choices={choices}
            selected={draft?.bankId ?? ''}
            onSelect={(id) => {
              const picked = findBank(id) ?? BANKS.find((b) => b.id === id);
              if (picked?.bin) change({ bankId: picked.id, bin: picked.bin });
            }}
          >
            <View style={row}>
              <Text style={{ ...body(16), color: palette.inkSoft, flex: 1 }}>
                {t('owed.account.bank')}
              </Text>
              {bank ? (
                <BankLogo
                  id={bank.id}
                  size={24}
                  radius={7}
                  neutral={palette.chipBg}
                  neutralInk={palette.ink}
                />
              ) : null}
              <Text style={{ ...body(16, 550), color: palette.ink }}>
                {bank?.shortName ?? t('owed.account.pickBank')}
              </Text>
            </View>
          </ChoiceMenu>
          <View style={{ ...row, borderTopWidth: 0.5, borderTopColor: palette.hair }}>
            <Text style={{ ...body(16), color: palette.inkSoft }}>{t('owed.account.number')}</Text>
            <TextInput
              value={draft?.account ?? ''}
              onChangeText={(text) => change({ account: text.replace(/[^0-9A-Za-z ]/g, '') })}
              placeholder={t('owed.account.numberPlaceholder')}
              placeholderTextColor={palette.inkSoft}
              keyboardType="number-pad"
              maxLength={24}
              style={{ ...input, fontVariant: ['tabular-nums'] }}
            />
          </View>
          <View style={{ ...row, borderTopWidth: 0.5, borderTopColor: palette.hair }}>
            <Text style={{ ...body(16), color: palette.inkSoft }}>{t('owed.account.name')}</Text>
            <TextInput
              value={draft?.name ?? ''}
              onChangeText={(text) => change({ name: text })}
              onEndEditing={() => draft && change({ name: holderName(draft.name) })}
              placeholder={t('owed.account.namePlaceholder')}
              placeholderTextColor={palette.inkSoft}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={50}
              returnKeyType="done"
              style={input}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 4 }}>
          <WhereItLives icon="smartphone" label={t('owed.account.kept')} struck={false} />
          <WhereItLives icon="cloud" label={t('owed.account.neverSent')} struck />
          <WhereItLives icon="swap_horiz" label={t('owed.account.movesNothing')} struck />
        </View>
      </EdgeSheetScroll>
    </FittedSheet>
  );
}

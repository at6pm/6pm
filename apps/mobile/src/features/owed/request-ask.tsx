import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  findBank,
  holderName,
  remindOffered,
  requestCodeNote,
  requestPayload,
  type OwedRow,
  type ReceivingAccount,
} from '@6pm/domain';
import { curves, owedInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { requestActions } from '../../data/request-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body, mono } from '../../ui/type/fonts';
import { WorkStamp } from '../work/work-stamp';
import { shareStrip } from './ask-share';
import { noteSettled } from './owed-words';
import { QrStrip } from './qr-strip';
import { CodeChip } from './request-parts';
import { askedOn } from './request-words';

/** The strip lifting into place, 420 ms on the house curve, as a friend's Ask does. */
const lift = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 140 }, { scale: 0.62 }] },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.bezier(...curves.house),
  },
}).duration(420);

const IMAGE_WIDTH = 402;

/** The request's strip as the payer scans it: what the QR pays, its note, code first. */
export function RequestStrip({
  row,
  account,
  qrSize = 250,
}: {
  readonly row: OwedRow;
  readonly account: ReceivingAccount;
  readonly qrSize?: number;
}) {
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const note = requestCodeNote(row.code ?? '', row.job ?? null);
  const payload = requestPayload(account, row.amount, note);
  if (!payload) return null;
  const upper = (text: string) => text.toLocaleUpperCase(language);
  const bank = findBank(account.bankId)?.shortName ?? account.bankId;
  const rest = note.slice((row.code ?? '').length).trim();
  return (
    <QrStrip
      kicker={[row.name, row.job]
        .filter(Boolean)
        .map((w) => upper(w ?? ''))
        .join(' · ')}
      what=""
      name={row.name}
      square={row.company === true}
      amount={money.full(row.amount)}
      payload={payload}
      qrSize={qrSize}
      bank={t('owed.ask.bank', { bank: upper(bank) })}
      holder={holderName(account.name)}
      stamp={
        row.work === true ? (
          <WorkStamp
            face="always"
            small
            labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
          />
        ) : undefined
      }
      note={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: owedInk.qrSoft }}>
            {t('request.strip.note')}
          </Text>
          <View style={{ flex: 1 }} />
          <CodeChip code={row.code ?? ''} />
          <Text numberOfLines={1} style={{ ...mono(11, 400, 0.08), color: owedInk.qrInk }}>
            {rest}
          </Text>
        </View>
      }
    />
  );
}

function SmallAction({
  icon,
  label,
  onPress,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <PressScale
      scaleTo={0.97}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 44,
        borderRadius: 16,
        backgroundColor: owedInk.askClose,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 8,
      }}
    >
      <Symbol name={icon} size={17} color={owedInk.askInk} />
      <Text numberOfLines={1} style={{ ...body(13.5, 600), color: owedInk.askInk }}>
        {label}
      </Text>
    </PressScale>
  );
}

/**
 * A client's request, full screen (7b): the same strip a friend gets, with the job on top, the
 * WORK stamp on work strips and four letters in the note; those four letters are how the money
 * finds its way back. Sent as an image with a short line. Under it: Remind once the strip is older
 * than 14 days, Paid in cash, and taking the strip back.
 */
export function RequestAskScreen({
  row,
  account,
}: {
  readonly row: OwedRow;
  readonly account: ReceivingAccount;
}) {
  const router = useRouter();
  const store = useMoneyStore();
  const snap = useMoney();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const image = useRef<ComponentRef<typeof View>>(null);
  const [sending, setSending] = useState(false);
  const actions = requestActions(store);
  const strip = <RequestStrip row={row} account={account} />;
  const remind = remindOffered(askedOn(row), snap.today);

  const send = () => {
    if (sending) return;
    haptics.tap();
    setSending(true);
    const amount = money.full(row.amount);
    const message = row.job
      ? t('request.strip.message', { job: row.job, amount })
      : t('request.strip.messageNoJob', { amount });
    shareStrip(image, row.id, message)
      .catch(() => toast(t('sharing.failed')))
      .finally(() => setSending(false));
  };

  return (
    <View style={{ flex: 1, experimental_backgroundImage: palette.skyDeep }}>
      <View pointerEvents="none" style={{ position: 'absolute', left: -IMAGE_WIDTH * 3, top: 0 }}>
        <View
          ref={image}
          collapsable={false}
          style={{
            width: IMAGE_WIDTH,
            paddingTop: 44,
            paddingHorizontal: 22,
            paddingBottom: 26,
            gap: 30,
            experimental_backgroundImage: palette.skyDeep,
          }}
        >
          <View
            style={{
              transform: [{ rotate: '-1.5deg' }],
              boxShadow: `0 30px 50px ${owedInk.qrShadow}`,
            }}
          >
            {strip}
          </View>
          <Text style={{ ...mono(11, 500, 0.14), color: owedInk.askSoft, textAlign: 'center' }}>
            {t('owed.ask.madeWith')}
          </Text>
        </View>
      </View>

      <PressScale
        accessibilityRole="button"
        accessibilityLabel={t('owed.ask.close')}
        onPress={() => router.back()}
        hitSlop={8}
        style={{
          position: 'absolute',
          left: 18,
          top: insets.top + 2,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: owedInk.askClose,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Symbol name="close" size={22} color={owedInk.askInk} />
      </PressScale>

      <Animated.View
        entering={lift}
        style={{ position: 'absolute', left: 22, right: 22, top: insets.top + 66 }}
      >
        <View
          style={{
            transform: [{ rotate: '-1.5deg' }],
            boxShadow: `0 30px 50px ${owedInk.qrShadow}`,
          }}
        >
          {strip}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(250)}
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Math.max(insets.bottom, 20) + 6,
          gap: 12,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
        >
          <Symbol name="qr_code_scanner" size={18} color={owedInk.askSoft} />
          <Text style={{ ...body(13.5), color: owedInk.askSoft }}>{t('request.strip.scan')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {remind ? (
            <SmallAction
              icon="send"
              label={t('request.remind')}
              onPress={() => {
                haptics.tap();
                router.replace({ pathname: '/owed-remind', params: { line: row.id } });
              }}
            />
          ) : null}
          <SmallAction
            icon="payments"
            label={t('owed.cover.cash')}
            onPress={() => {
              haptics.success();
              noteSettled([row.id], true);
              void actions.paidInCash(row.id);
              router.back();
            }}
          />
          <SmallAction
            icon="undo"
            label={t('request.strip.remove')}
            onPress={() => {
              haptics.tap();
              noteSettled([row.id], false);
              void actions.remove(row.id).then(() => toast(t('request.strip.removed')));
              router.back();
            }}
          />
        </View>
        <PressScale
          scaleTo={0.97}
          accessibilityRole="button"
          accessibilityState={{ busy: sending }}
          onPress={send}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Symbol name="ios_share" size={20} color={palette.btnFg} />
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('owed.ask.send')}</Text>
        </PressScale>
      </Animated.View>
    </View>
  );
}

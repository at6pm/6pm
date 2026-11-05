import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  findBank,
  holderName,
  requestNote,
  requestPayload,
  type OwedPerson,
  type ReceivingAccount,
} from '@6pm/domain';
import { curves, owedInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { useToast } from '../../ui/toast/toast-host';
import { shareStrip } from './ask-share';
import { QrStrip } from './qr-strip';

/** The strip lifting from its card and growing into the Ask, 420 ms on the house curve. */
const lift = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 140 }, { scale: 0.62 }] },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.bezier(...curves.house),
  },
}).duration(420);

/** The design phone's width, which the shared image keeps. */
const IMAGE_WIDTH = 402;

/** The spends a person's strips came from, as the strip names them: "LẨU + GRAB". */
function whatOf(person: OwedPerson, merchants: ReadonlyMap<string, string>): string {
  const words = [
    ...new Set(
      person.lines.map((l) => (merchants.get(l.spendId) ?? '').trim().split(/\s+/)[0] ?? ''),
    ),
  ].filter(Boolean);
  return words.slice(0, 2).join(' + ');
}

/**
 * Ask hands over the person's strip, now with a VietQR on it: the amount they owe, to the user's
 * own account, with the note "6pm {spend} {name}". Shown full screen to be scanned across a
 * table, or sent as an image on the sky with a short message and a small "made with 6pm" mark.
 * 6pm moves no money: the friend pays from their own bank.
 */
export function AskScreen({
  person,
  account,
}: {
  readonly person: OwedPerson;
  readonly account: ReceivingAccount;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const image = useRef<ComponentRef<typeof View>>(null);
  const [sending, setSending] = useState(false);
  const merchants = new Map(snap.cycleSpends.map((s) => [s.id, s.merchant] as const));
  const what = whatOf(person, merchants);
  const spendName = what === '' ? t('owed.list.title') : what.replace(' + ', ', ');
  // The note names the spends in full ("6pm Lau Manwah Linh"), cut to what a transfer note holds.
  const spends = [...new Set(person.lines.map((l) => merchants.get(l.spendId) ?? ''))].join(' ');
  const payload = requestPayload(account, person.total, requestNote(spends, person.name));
  const bank = findBank(account.bankId)?.shortName ?? account.bankId;
  const upper = (text: string) => text.toLocaleUpperCase(language);
  const strip = payload ? (
    <QrStrip
      kicker={
        person.name
          ? t('owed.ask.strips', { count: person.lines.length, name: upper(person.name) })
          : t('owed.ask.stripsNoName', { count: person.lines.length })
      }
      what={upper(what)}
      name={person.name}
      amount={money.full(person.total)}
      payload={payload}
      bank={t('owed.ask.bank', { bank: upper(bank) })}
      holder={holderName(account.name)}
    />
  ) : null;

  const send = () => {
    if (sending || !payload) return;
    haptics.tap();
    setSending(true);
    const message = t('owed.ask.message', {
      spend: spendName,
      amount: money.full(person.total),
    });
    shareStrip(image, person.key, message)
      .catch(() => toast(t('sharing.failed')))
      .finally(() => setSending(false));
  };

  return (
    <View style={{ flex: 1, experimental_backgroundImage: palette.skyDeep }}>
      {/* What Send shares: the strip on the sky, with the mark. Drawn off screen, untransformed. */}
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
          <View
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ ...mono(11, 500, 0.14), color: owedInk.askSoft }}>
              {t('owed.ask.madeWith')}
            </Text>
          </View>
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

      {strip ? (
        <Animated.View
          entering={lift}
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            top: insets.top + 66,
          }}
        >
          {/* The entrance owns the outer transform; the tilt sits inside it. */}
          <View
            style={{
              transform: [{ rotate: '-1.5deg' }],
              boxShadow: `0 30px 50px ${owedInk.qrShadow}`,
            }}
          >
            {strip}
          </View>
        </Animated.View>
      ) : (
        <Animated.Text
          entering={FadeIn.duration(250)}
          style={{
            ...body(16),
            color: owedInk.askInk,
            textAlign: 'center',
            marginTop: insets.top + 160,
            paddingHorizontal: 32,
          }}
        >
          {t('owed.ask.badAccount')}
        </Animated.Text>
      )}

      <View
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
          <Text style={{ ...body(13.5), color: owedInk.askSoft }}>
            {person.name ? t('owed.ask.scan', { name: person.name }) : t('owed.ask.scanNoName')}
          </Text>
        </View>
        <PressScale
          scaleTo={0.97}
          accessibilityRole="button"
          accessibilityState={{ busy: sending, disabled: !payload }}
          onPress={send}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            opacity: payload ? 1 : 0.45,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Symbol name="ios_share" size={20} color={palette.btnFg} />
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('owed.ask.send')}</Text>
        </PressScale>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';

import {
  localDateOf,
  reminderTone,
  requestCodeNote,
  requestPayload,
  type OwedRow,
  type ReceivingAccount,
} from '@6pm/domain';
import { owedInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { requestActions } from '../../data/request-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { edgeSheetRoot } from '../../ui/navigation/edge-sheet';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body, display, mono } from '../../ui/type/fonts';
import { shareStrip } from './ask-share';
import { QrCode } from './owed-parts';
import { RequestStrip } from './request-ask';
import { askedOn, dayMonthOf } from './request-words';

const IMAGE_WIDTH = 402;

/**
 * Whether Zalo is on the phone, to name it on the button. The phone answers only for schemes the
 * app declares it asks about; without that it says no, and the button is "Send".
 */
function useZalo(): boolean {
  const [zalo, setZalo] = useState(false);
  useEffect(() => {
    let live = true;
    Linking.canOpenURL('zalo://')
      .then((yes) => live && setZalo(yes))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return zalo;
}

/**
 * 7c, a reminder: the strip again, with one polite line drafted in the app's language by the
 * strip's age (a first reminder, a month on, two months on), always naming the job and the amount.
 * The person edits the words; the share sheet sends the strip's image and the words from their own
 * phone. Afterwards the strip's line reads "Reminded {date}". 6pm never sends anything itself.
 */
export function RemindSheet({
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
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const toast = useToast();
  const zalo = useZalo();
  const image = useRef<ComponentRef<typeof View>>(null);
  const asked = askedOn(row);
  const name = row.name ?? t('owed.someone');
  const [text, setText] = useState(() => {
    const params = {
      name,
      job: row.job ?? t('request.remind.theJob'),
      amount: money.full(row.amount),
      date: dayMonthOf(asked, language),
    };
    const tone = reminderTone(asked, snap.today);
    return tone === 'twoMonths'
      ? t('request.remind.twoMonths', params)
      : tone === 'month'
        ? t('request.remind.month', params)
        : t('request.remind.first', params);
  });
  const [sending, setSending] = useState(false);
  const payload = requestPayload(
    account,
    row.amount,
    requestCodeNote(row.code ?? '', row.job ?? null),
  );
  const upper = (s: string) => s.toLocaleUpperCase(language);
  const kicker = row.remindedAt
    ? t('request.remind.askedReminded', {
        date: upper(dayMonthOf(asked, language)),
        reminded: upper(dayMonthOf(localDateOf(new Date(row.remindedAt)), language)),
      })
    : t('request.remind.asked', { date: upper(dayMonthOf(asked, language)) });

  const send = () => {
    if (sending) return;
    haptics.tap();
    setSending(true);
    shareStrip(image, row.id, text.trim())
      .then(async (sent) => {
        if (!sent) return;
        haptics.success();
        await requestActions(store).reminded(row.id);
        router.back();
      })
      .catch(() => toast(t('sharing.failed')))
      .finally(() => setSending(false));
  };

  return (
    <View collapsable={false} style={edgeSheetRoot}>
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
          <View style={{ transform: [{ rotate: '-1.5deg' }] }}>
            <RequestStrip row={row} account={account} />
          </View>
          <Text style={{ ...mono(11, 500, 0.14), color: owedInk.askSoft, textAlign: 'center' }}>
            {t('owed.ask.madeWith')}
          </Text>
        </View>
      </View>
      <SheetScreen
        title={t('request.remind.title', { name })}
        gap={14}
        fit
        footer={
          <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10 }}>
            <PressScale
              scaleTo={0.97}
              accessibilityRole="button"
              accessibilityState={{ busy: sending, disabled: text.trim() === '' }}
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
              <Symbol name="send" size={20} color={palette.btnFg} />
              <Text style={{ ...body(17, 650), color: palette.btnFg }}>
                {zalo ? t('request.remind.sendZalo') : t('request.remind.send')}
              </Text>
            </PressScale>
            <Text style={{ ...body(12.5), color: palette.inkSoft, textAlign: 'center' }}>
              {zalo ? t('request.remind.footZalo') : t('request.remind.foot')}
            </Text>
          </View>
        }
      >
        <Text style={{ ...mono(10.5, 400, 0.14), color: palette.inkSoft }}>{kicker}</Text>
        {payload ? (
          <View style={{ alignSelf: 'flex-end', transform: [{ rotate: '2deg' }] }}>
            <View
              style={{
                width: 132,
                backgroundColor: owedInk.qrPaper,
                paddingTop: 10,
                paddingHorizontal: 12,
                paddingBottom: 8,
                alignItems: 'center',
                gap: 6,
                boxShadow: `0 14px 24px ${owedInk.qrShadow}`,
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ ...display(17, 500), color: owedInk.qrInk, alignSelf: 'stretch' }}
              >
                {money.full(row.amount)}
              </Text>
              <QrCode payload={payload} size={104} />
              <Text numberOfLines={1} style={{ ...mono(7.5, 400, 0.08), color: owedInk.qrSoft }}>
                {requestCodeNote(row.code ?? '', row.job ?? null)}
              </Text>
            </View>
            <PaperEdge color={owedInk.qrPaper} height={8} shadow={false} />
          </View>
        ) : null}
        <View
          style={{
            alignSelf: 'flex-end',
            maxWidth: '86%',
            borderRadius: 18,
            borderBottomRightRadius: 6,
            backgroundColor: palette.bubbleBg,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            accessibilityLabel={t('request.remind.edit')}
            maxLength={400}
            style={{ fontSize: 15, lineHeight: 21, color: palette.bubbleFg, padding: 0 }}
          />
        </View>
      </SheetScreen>
    </View>
  );
}

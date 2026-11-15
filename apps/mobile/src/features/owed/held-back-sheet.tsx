import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  heldBackChoiceOf,
  heldBackFor,
  heldBackLines,
  parseAmount,
  type HeldBackChoice,
  type SpendRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { requestInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { requestActions } from '../../data/request-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, mono } from '../../ui/type/fonts';
import { WorkStamp } from '../work/work-stamp';
import { CertificateStamp } from './certificate-stamp';
import { TornSlip } from './torn-slip';
import { Avatar } from './owed-parts';
import { dayMonthOf } from './request-words';

type Kind = HeldBackChoice['kind'];

function Line({
  label,
  value,
  strong = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly strong?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ ...mono(11.5, strong ? 600 : 400, 0.1), color: requestInk.paperInk }}>
        {label}
      </Text>
      <Text style={{ ...mono(12.5, 600), color: requestInk.paperInk }}>{value}</Text>
    </View>
  );
}

/**
 * 4c, held back and the certificate: what was billed, what a client kept for tax, what landed.
 * "10%" works backwards from what landed; "Type it" takes the amount. Landed is what the plan
 * counts; billed is what the year counts. The certificate is a dashed stamp one tap inks with
 * today's date; the sender is remembered holding back a tenth.
 */
export function HeldBackSheet({ spend }: { readonly spend: SpendRow }) {
  const store = useMoneyStore();
  const snap = useMoney();
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const actions = requestActions(store);
  const start = heldBackChoiceOf(spend.amount, spend.heldBack);
  const [kind, setKind] = useState<Kind>(start.kind);
  const [typed, setTyped] = useState(start.kind === 'typed' ? String(start.amount) : '');
  const typedAmount = parseAmount(typed, money.currency) ?? 0;
  const choice: HeldBackChoice =
    kind === 'typed' ? { kind, amount: typedAmount } : kind === 'tenth' ? { kind } : { kind };
  const held = heldBackFor(spend.amount, choice);
  const lines = heldBackLines(spend.amount, held);
  const certified = spend.certificate === true;

  const pick = (next: Kind) => {
    if (next === kind) return;
    haptics.tick();
    setKind(next);
    if (next !== 'typed')
      void actions.setHeldBack(spend.id, heldBackFor(spend.amount, { kind: next }));
  };
  const locale = localeOf(language);
  const at = new Date(spend.at);
  const kicker = `${new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(at)} · ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(at)}`;
  const options: readonly [Kind, string][] = [
    ['nothing', t('heldBack.nothing')],
    ['tenth', t('heldBack.tenth')],
    ['typed', t('heldBack.type')],
  ];

  return (
    <SheetScreen title={t('heldBack.title')} gap={16} fit>
      <TornSlip
        color={requestInk.paper}
        tilt={-0.8}
        style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ ...mono(10, 400, 0.14), color: requestInk.paperSoft }}>
            {kicker.toLocaleUpperCase(locale)}
          </Text>
          <Text numberOfLines={1} style={{ ...mono(10, 400, 0.14), color: requestInk.paperSoft }}>
            {(spend.wallet ?? '').toLocaleUpperCase(locale)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar name={spend.merchant || null} size={34} square />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ ...body(17, 650), color: requestInk.paperInk }}>
              {spend.merchant.trim() || t('moneyIn.name')}
            </Text>
            {spend.note ? (
              <Text numberOfLines={1} style={{ ...body(12.5), color: requestInk.paperSoft }}>
                {spend.note}
              </Text>
            ) : null}
          </View>
          {spend.forWork ? (
            <WorkStamp
              face="always"
              small
              labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
            />
          ) : null}
        </View>
        <DashedRule color={requestInk.paperRule} />
        <Line label={t('heldBack.billed')} value={money.number(lines.billed)} />
        <Line
          strong
          label={kind === 'tenth' ? t('heldBack.heldTenth') : t('heldBack.held')}
          value={lines.heldBack > 0 ? `−${money.number(lines.heldBack)}` : money.number(0)}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Text style={{ ...mono(11.5, 600, 0.1), color: requestInk.paperInk }}>
            {t('heldBack.landed')}
          </Text>
          <Text style={{ ...display(30, 500, -0.02), color: requestInk.landed }}>
            +{money.number(lines.landed)}
          </Text>
        </View>
        {lines.heldBack > 0 ? (
          <>
            <DashedRule color={requestInk.paperRule} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 34,
              }}
            >
              <Text style={{ ...mono(10, 400, 0.14), color: requestInk.paperSoft }}>
                {t('heldBack.certificate')}
              </Text>
              <CertificateStamp
                inked={certified}
                label={
                  certified
                    ? `${t('heldBack.certificateInked')} ${spend.certificateOn ? dayMonthOf(spend.certificateOn, language).toLocaleUpperCase(locale) : ''}`.trim()
                    : t('heldBack.arrived')
                }
                onPress={() => {
                  if (!certified) haptics.success();
                  else haptics.tap();
                  void actions.toggleCertificate(spend.id, snap.today);
                }}
              />
            </View>
          </>
        ) : null}
      </TornSlip>

      <Text style={{ ...mono(11, 500, 0.14), color: palette.inkSoft, paddingHorizontal: 4 }}>
        {t('heldBack.switch').toLocaleUpperCase(locale)}
      </Text>
      <View
        accessibilityRole="radiogroup"
        style={{
          flexDirection: 'row',
          borderRadius: 14,
          backgroundColor: palette.cell,
          padding: 3,
          gap: 3,
        }}
      >
        {options.map(([key, label]) => (
          <PressScale
            key={key}
            accessibilityRole="radio"
            accessibilityState={{ checked: kind === key }}
            onPress={() => pick(key)}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 11,
              backgroundColor: kind === key ? palette.tabActive : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...body(14.5, kind === key ? 650 : 500), color: palette.ink }}>
              {label}
            </Text>
          </PressScale>
        ))}
      </View>
      {kind === 'typed' ? (
        <View
          style={{
            borderRadius: 18,
            backgroundColor: palette.cell,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TextInput
            autoFocus
            value={typed}
            onChangeText={setTyped}
            onEndEditing={() => void actions.setHeldBack(spend.id, typedAmount)}
            placeholder={t('heldBack.typePlaceholder')}
            placeholderTextColor={palette.inkSoft}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            style={{ fontSize: 16, color: palette.ink, padding: 0, fontVariant: ['tabular-nums'] }}
          />
        </View>
      ) : null}
      <Text
        style={{ ...body(13.5), lineHeight: 19.5, color: palette.inkSoft, paddingHorizontal: 4 }}
      >
        {t('heldBack.foot')}
      </Text>
    </SheetScreen>
  );
}

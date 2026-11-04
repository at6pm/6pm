import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { BANKS, receiptBankOf, type SpendRow } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { catchInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n, type I18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { BankLogo } from '../../ui/bank-logo/bank-logo';
import { CategoryTile } from '../../ui/category-tile';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PaperEdge } from '../../ui/paper-edge';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { fadeEntering } from './onboarding-motion';

/** `catchDrop`: from 140 pt above, tilted, past its place by 8 pt and back, 650 ms. */
const slipDrop = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -140 }, { rotate: '-5deg' }] },
  60: {
    opacity: 1,
    transform: [{ translateY: 8 }, { rotate: '1deg' }],
    easing: Easing.bezier(0.2, 0.9, 0.25, 1.1),
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { rotate: '0deg' }],
    easing: Easing.bezier(0.2, 0.9, 0.25, 1.1),
  },
})
  .duration(650)
  .reduceMotion(ReduceMotion.Never);

/** The CAUGHT stamp lands big and tilted, then down: `stampIn` 500 ms, 350 ms after the drop. */
const stampIn = new Keyframe({
  0: { opacity: 0, transform: [{ rotate: '-14deg' }, { scale: 2.4 }] },
  60: {
    opacity: 1,
    transform: [{ rotate: '-7deg' }, { scale: 0.94 }],
    easing: Easing.bezier(0.3, 1.5, 0.5, 1),
  },
  100: {
    opacity: 0.92,
    transform: [{ rotate: '-7deg' }, { scale: 1 }],
    easing: Easing.bezier(0.3, 1.5, 0.5, 1),
  },
})
  .duration(500)
  .delay(350)
  .reduceMotion(ReduceMotion.Never);

const STAMP_DELAY = 350;

/** The bank a caught spend was read from, by the catalogue's id when 6pm knows it. */
function bankOf(spend: SpendRow): { readonly name: string; readonly id: string | null } | null {
  const name = receiptBankOf(spend.detail) ?? spend.detail?.split(' · ')[0] ?? null;
  if (!name) return null;
  return { name, id: BANKS.find((b) => b.shortName === name)?.id ?? null };
}

/** The slip's foot: where it was read, and "not counted" for money moved to oneself. */
function noteOf(spend: SpendRow, bank: string | null, t: I18n['t']): string {
  const note =
    spend.source === 'alert'
      ? bank
        ? t('firstCatch.slip.note.alert', { bank })
        : t('firstCatch.slip.note.alertPlain')
      : spend.source === 'shared'
        ? t('firstCatch.slip.note.shared')
        : spend.source === 'applePay'
          ? t('firstCatch.slip.note.applePay')
          : spend.source === 'email'
            ? t('firstCatch.slip.note.email')
            : t('firstCatch.slip.note.qr');
  return spend.status === 'skipped' ? t('firstCatch.slip.notCounted', { note }) : note;
}

/**
 * The first real catch printed as receipt Nº 001: where it came from and when, who was paid, the
 * amount, and where it was read, dropping in from above with the CAUGHT stamp landing after it
 * (a success haptic as it lands, a light one for the stamp). Money moved to oneself (the 1.000₫
 * self-transfer, set aside as the person's own transfer) is printed "not counted".
 */
export function FirstCatchSlip({ spend }: { readonly spend: SpendRow }) {
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { categories } = useMoney();
  const reduceMotion = useReducedMotion();
  const bank = bankOf(spend);
  const category = categories.find((c) => c.id === spend.categoryId) ?? null;
  const own = spend.status === 'skipped' && spend.source === 'alert';
  const name =
    spend.merchant.trim() !== ''
      ? spend.merchant
      : own
        ? t('firstCatch.slip.toYourself')
        : (bank?.name ?? t(`source.${spend.source}`));
  const kind = spend.direction === 'in' ? t('firstCatch.slip.moneyIn') : (category?.name ?? null);
  const sub = [kind, bank?.name ?? (spend.source === 'applePay' ? t('source.applePay') : null)]
    .filter((part): part is string => part !== null && part !== name)
    .join(' · ');
  const parts = money.parts(Math.abs(spend.amount));
  const time = new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(spend.at));

  useEffect(() => {
    const stamp = setTimeout(() => haptics.tap(), reduceMotion ? 0 : STAMP_DELAY);
    return () => clearTimeout(stamp);
  }, [reduceMotion]);

  return (
    <Animated.View
      entering={reduceMotion ? fadeEntering(200, 0, true) : slipDrop}
      style={{ boxShadow: catchInk.slipShadow, borderRadius: 6 }}
    >
      <View
        style={{
          experimental_backgroundImage: `linear-gradient(180deg, ${catchInk.paperTop} 0%, ${catchInk.paperBottom} 100%)`,
          paddingTop: 18,
          paddingHorizontal: 22,
          paddingBottom: 16,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{ ...mono(11.5, 500, 0.1), color: catchInk.soft, textTransform: 'uppercase' }}
          >
            {`${t('firstCatch.slip.no', { no: '001' })} · ${t(`source.${spend.source}`)}`}
          </Text>
          <Text style={{ ...mono(11.5, 500, 0.1), color: catchInk.soft }}>{time}</Text>
        </View>
        <DashedRule color={catchInk.rule} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SlipMark
            spend={spend}
            bankId={bank?.id ?? null}
            icon={category?.icon}
            hue={category?.hue}
          />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={{ ...body(20, 650, -0.02), color: catchInk.ink }}>
              {name}
            </Text>
            {sub !== '' ? (
              <Text numberOfLines={1} style={{ ...body(13), color: catchInk.soft }}>
                {sub}
              </Text>
            ) : null}
          </View>
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            ...leading(display(72, 500, -0.02), 72, true),
            color: catchInk.ink,
            paddingTop: 6,
          }}
        >
          {parts.prefix ? (
            <Text style={{ fontSize: 30, opacity: 0.55 }}>{parts.prefix}</Text>
          ) : null}
          {parts.number}
          {parts.suffix ? (
            <Text style={{ fontSize: 30, opacity: 0.55 }}>{` ${parts.suffix.trim()}`}</Text>
          ) : null}
        </Text>
        <View style={{ gap: 10 }}>
          <DashedRule color={catchInk.rule} />
          <Text style={{ ...mono(11.5, 400), color: catchInk.note }}>
            {noteOf(spend, bank?.name ?? null, t)}
          </Text>
        </View>
        <Animated.View
          entering={reduceMotion ? fadeEntering(200, 0, true) : stampIn}
          style={{
            position: 'absolute',
            top: 70,
            right: 18,
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderWidth: 3,
            borderColor: catchInk.stamp,
            borderRadius: 6,
            opacity: 0.92,
            transform: [{ rotate: '-7deg' }],
          }}
        >
          <Text style={{ ...mono(22, 600, 0.16), color: catchInk.stamp }}>
            {t('firstCatch.slip.stamp')}
          </Text>
        </Animated.View>
      </View>
      <PaperEdge color={catchInk.paperBottom} height={9} step={12} />
    </Animated.View>
  );
}

/** The 44 pt mark beside the name: the bank's logo, Wallet's tile, or the spend's category. */
function SlipMark({
  spend,
  bankId,
  icon,
  hue,
}: {
  readonly spend: SpendRow;
  readonly bankId: string | null;
  readonly icon: string | undefined;
  readonly hue: number | undefined;
}) {
  if (bankId !== null) {
    return (
      <BankLogo
        id={bankId}
        size={44}
        radius={15}
        neutral={catchInk.walletTile}
        neutralInk={catchInk.onTile}
      />
    );
  }
  if (spend.source === 'applePay') {
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 15,
          backgroundColor: catchInk.walletTile,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="contactless" size={24} color={catchInk.onTile} />
      </View>
    );
  }
  return (
    <CategoryTile
      icon={(icon ?? 'receipt_long') as SymbolName}
      hue={hue ?? 40}
      size={44}
      radius={15}
    />
  );
}

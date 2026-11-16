import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { thankYouCard, type ThankYouCard } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../../data/money-provider';
import { readReceivingAccount } from '../../../data/receiving-account';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { PaperEdge } from '../../../ui/paper-edge';
import { display, mono } from '../../../ui/type/fonts';
import { useDiaryDates } from '../../diary/diary-dates';
import { stampIn } from '../../owed/owed-motion';
import { askedOn } from '../../owed/request-words';
import { defineCard, type CardLayoutProps } from './card-definition';
import {
  CardCompanion,
  CardGround,
  CardMark,
  InkedAmount,
  kicker,
  ON_CARD,
  title,
} from './card-parts';
import { CARD_WIDTH, cardHeight } from './card-size';
import { companionLine, TappableAmount } from './income-parts';

export interface ThanksCardData {
  readonly card: ThankYouCard;
  /** The person's own name as their receiving account has it; null with no account. */
  readonly from: string | null;
  readonly line: string | null;
}

/** The request `of` names, once the money that paid it is kept, with the person's own name. */
function useThanksCard(of: string | undefined): ThanksCardData | null {
  const snap = useMoney();
  const store = useMoneyStore();
  const { t } = useI18n();
  const [read, setRead] = useState<{ card: ThankYouCard; from: string | null } | null>(null);
  useEffect(() => {
    if (!of) return undefined;
    let live = true;
    void (async () => {
      const line = await store.tables.owed.get(of);
      if (!line?.settledSpendId) return;
      const [moneyIn, account] = await Promise.all([
        store.tables.spends.get(line.settledSpendId),
        readReceivingAccount(store),
      ]);
      const card = thankYouCard({ line, askedOn: askedOn(line), moneyIn });
      const from = account?.name.trim() || null;
      if (live && card) setRead({ card, from });
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, of, snap]);
  return useMemo(() => {
    if (read === null) return null;
    const say = t as unknown as (key: string, params: Record<string, string | number>) => string;
    return { ...read, line: companionLine(say, snap.plan, 'thanksCard', {}) };
  }, [read, t, snap.plan]);
}

/** The receipt sent back: what was asked and when, the amount stamped PAID, when it landed. */
function Receipt({
  data,
  inks,
  amounts,
  still,
  onAmounts,
}: Pick<CardLayoutProps<ThanksCardData>, 'data' | 'inks' | 'amounts' | 'still' | 'onAmounts'>) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const ink = inks.work.receipt;
  const { card } = data;
  const parts = money.parts(card.amount);
  const small = { ...mono(10, 400, 0.14), color: ink.soft };
  const rule = { borderTopWidth: 1, borderStyle: 'dashed' as const, borderColor: ink.rule };
  return (
    <View
      style={{
        paddingTop: 44,
        paddingHorizontal: 4,
        paddingBottom: 40,
        transform: [{ rotate: '-2deg' }],
      }}
    >
      <View style={{ boxShadow: ink.shadow }}>
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <PaperEdge color={ink.paper} shadow={false} />
        </View>
        <View
          style={{
            backgroundColor: ink.paper,
            paddingTop: 10,
            paddingHorizontal: 18,
            paddingBottom: 14,
            gap: 9,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text {...ON_CARD} numberOfLines={1} style={{ ...small, flexShrink: 1 }}>
              {(card.job ?? '').toLocaleUpperCase()}
            </Text>
            <Text {...ON_CARD} style={small}>
              {card.code}
            </Text>
          </View>
          <View style={rule} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 4,
            }}
          >
            <TappableAmount
              shown={amounts}
              onAmounts={onAmounts}
              label={t('shareCards.showAmounts')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <InkedAmount
                  text={`${parts.sign}${parts.prefix}${parts.number}`}
                  shown={amounts}
                  ink={ink.ink}
                  style={{ ...display(34, 500, -0.03), lineHeight: 36, color: ink.ink }}
                />
                {parts.suffix ? (
                  <Text
                    {...ON_CARD}
                    style={{ ...display(14, 500), marginLeft: 3, opacity: 0.55, color: ink.ink }}
                  >
                    {parts.suffix.trim()}
                  </Text>
                ) : null}
              </View>
            </TappableAmount>
            <Animated.View
              {...(still ? {} : { entering: stampIn })}
              style={{
                paddingVertical: 3,
                paddingHorizontal: 8,
                borderWidth: 2.5,
                borderColor: ink.stamp,
                borderRadius: 5,
                opacity: 0.9,
                transform: [{ rotate: '-7deg' }],
              }}
            >
              <Text {...ON_CARD} style={{ ...mono(12, 600, 0.14), color: ink.stamp }}>
                {t('shareCards.thanks.paid').toLocaleUpperCase()}
              </Text>
            </Animated.View>
          </View>
          <View style={rule} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text {...ON_CARD} numberOfLines={1} style={{ ...mono(11), color: ink.soft }}>
              {t('shareCards.thanks.asked', {
                date: dates.dayMonth(card.askedOn),
              }).toLocaleUpperCase()}
            </Text>
            <Text
              {...ON_CARD}
              numberOfLines={1}
              style={{ ...mono(11), color: ink.soft, flexShrink: 1 }}
            >
              {t('shareCards.thanks.landed', {
                date: dates.stamp(card.landedOn),
                time: dates.clock(card.landedAt),
              }).toLocaleUpperCase()}
            </Text>
          </View>
        </View>
        <PaperEdge color={ink.paper} shadow={false} />
      </View>
    </View>
  );
}

function ThanksLayout(props: CardLayoutProps<ThanksCardData>) {
  const { data, format, inks, serious } = props;
  const { t } = useI18n();
  const dates = useDiaryDates();
  const story = format === 'story';
  const { card } = data;
  const day = dates.stamp(card.landedOn);
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {(data.from
            ? t('shareCards.thanks.kicker', { date: day, name: data.from })
            : day
          ).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={story ? 3 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {card.name
            ? t('shareCards.thanks.title', { name: card.name })
            : t('shareCards.thanks.titleNoName')}
        </Text>
        <View style={story ? null : { marginVertical: -24 }}>
          <Receipt {...props} />
        </View>
        {story && data.line && !serious ? (
          <CardCompanion line={data.line} inks={inks} mood="wave" />
        ) : null}
        <View style={{ flex: 1 }} />
        <CardMark inks={inks} path="thanks" />
      </View>
    </CardGround>
  );
}

export const thanksShareCard = defineCard<ThanksCardData>({
  path: 'thanks',
  useData: useThanksCard,
  hasAmounts: () => true,
  amountsShown: true,
  // The PAID stamp lands as the preview opens.
  settleMs: () => 520,
  fileKey: (d) => d.card.code,
  Layout: ThanksLayout,
});

import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  addDays,
  weekdayMondayFirst,
  type DailyNumber,
  type LatePay,
  type LocalDate,
  type PaydayAnswer,
  type Rhythm,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { catchInk } from '@6pm/theme';

import { periodInputOf } from '../../data/money-store';
import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { CategoryTile } from '../../ui/category-tile';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { FitWidth } from '../../ui/layout/fit-width';
import { PaperEdge } from '../../ui/paper-edge';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono, tabular } from '../../ui/type/fonts';
import { AmountKeypadSheet } from '../quick-add/amount-keypad-sheet';
import { AmountText } from '../quick-add/amount-text';
import { CloseCardButton } from './close-card-button';

/** The pay's tile: the money-in glyph on a warm hue, as the payday card draws it. */
const PAY_HUE = 70;

/** What the payday card shows about the pay the month waits for and the days while it does. */
export interface LatePayCard {
  readonly kicker: string;
  /** "Every Friday", as the pay comes. */
  readonly rhythm: string;
  /** "Due Fri 20 Nov". */
  readonly due: string;
  /** What the pay brings, drawn dashed: it has not come. */
  readonly amount: number;
  /** Left of the stretch before it, and what is in hand. */
  readonly left: number;
  readonly inHand: number;
  /** The day as it stays, and the days what is left and in hand cover at it. */
  readonly line: number;
  readonly days: number;
  /** Paid by the week: what is left is "from last week". */
  readonly weekly: boolean;
}

/**
 * The first card of a payday close when the pay has not landed: what the month waits for, what is
 * left and in hand, and how long the day lasts at its number while it waits. Came short opens the
 * keypad for what did come; Not yet moves on and the close asks again tomorrow; It landed opens
 * Quick add's money in on the pay. Never a debt: no warm colour, no "overspent".
 */
export function PaydayStep({
  card,
  onAnswer,
}: {
  readonly card: LatePayCard;
  /** `amount`: what came, for a pay that came short. */
  readonly onAnswer: (answer: PaydayAnswer, amount?: number) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const [typing, setTyping] = useState(false);
  const [answered, setAnswered] = useState(false);
  const answer = (choice: PaydayAnswer, amount?: number) => {
    if (answered) return;
    setAnswered(true);
    haptics.tap();
    onAnswer(choice, amount);
  };
  const row = (label: string, value: string, strong = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
      <Text
        numberOfLines={1}
        style={{
          ...mono(11.5, strong ? 500 : 400, 0.1),
          color: strong ? catchInk.ink : catchInk.note,
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          ...mono(11.5, strong ? 600 : 400),
          ...tabular,
          color: strong ? catchInk.ink : catchInk.note,
        }}
      >
        {value}
      </Text>
    </View>
  );
  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1, gap: 18 }}>
      <View style={{ gap: 6, paddingTop: 2 }}>
        <Text style={{ ...mono(11, 400, 0.14), color: palette.inkSoft }}>{card.kicker}</Text>
        <Text style={{ ...leading(display(40, 500, -0.01), 40.8), color: palette.ink }}>
          {t('close.payday.title')}
        </Text>
        <Text style={{ ...body(15), lineHeight: 22, color: palette.inkSoft }}>
          {t('close.payday.sub')}
        </Text>
      </View>
      <Animated.View
        entering={FadeInDown.duration(420).delay(80)}
        style={{ marginHorizontal: 4, boxShadow: catchInk.slipShadow, borderRadius: 6 }}
      >
        <View
          style={{
            paddingTop: 20,
            paddingHorizontal: 22,
            paddingBottom: 18,
            gap: 12,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            overflow: 'hidden',
            experimental_backgroundImage: `linear-gradient(180deg, ${catchInk.paperTop}, ${catchInk.paperBottom})`,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text numberOfLines={1} style={{ ...mono(11.5, 400, 0.1), color: catchInk.soft }}>
              {card.rhythm.toUpperCase()}
            </Text>
            <Text style={{ ...mono(11.5, 400, 0.1), color: catchInk.soft }}>
              {t('close.payday.notSeen')}
            </Text>
          </View>
          <DashedRule color={catchInk.rule} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <CategoryTile icon="payments" hue={PAY_HUE} size={44} radius={15} glyph={24} />
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Text style={{ ...body(20, 650, -0.02), color: catchInk.ink }}>
                {t('close.payday.yourPay')}
              </Text>
              <Text style={{ ...body(13), color: catchInk.soft }}>{card.due}</Text>
            </View>
          </View>
          <View style={{ gap: 6, paddingVertical: 8 }}>
            {row(
              t(card.weekly ? 'close.payday.leftWeek' : 'close.payday.leftPay'),
              money.number(Math.max(0, card.left)),
            )}
            {card.inHand > 0 ? row(t('close.payday.inHand'), money.number(card.inHand)) : null}
            {card.line > 0
              ? row(
                  t('close.payday.wait', { amount: money.number(card.line) }),
                  t('close.payday.waitDays', { count: card.days }),
                  true,
                )
              : null}
          </View>
          <View
            style={{
              height: 58,
              borderRadius: 10,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: catchInk.rule,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}
          >
            <FitWidth height={50} align="center">
              <AmountText
                maxFontSizeMultiplier={1}
                parts={money.parts(card.amount)}
                numberOfLines={1}
                gap={' '}
                style={{ ...display(40, 500, -0.02), ...tabular, color: catchInk.markSoft }}
                symbol={display(17, 500)}
              />
            </FitWidth>
          </View>
        </View>
        <PaperEdge color={catchInk.paperBottom} />
      </Animated.View>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        <CloseCardButton
          icon="edit"
          label={t('close.payday.short')}
          primary={false}
          onPress={() => {
            if (answered) return;
            haptics.tap();
            setTyping(true);
          }}
        />
        <CloseCardButton
          icon="schedule"
          label={t('close.payday.notYet')}
          primary={false}
          onPress={() => answer('notYet')}
        />
        <CloseCardButton
          icon="check"
          label={t('close.payday.landed')}
          primary
          onPress={() => answer('landed')}
        />
      </View>
      {typing ? (
        <AmountKeypadSheet
          title={t('close.payday.shortTitle')}
          decimals={money.currency.minorDigits > 0}
          onAmount={(amount) => {
            if (amount > 0) answer('short', amount);
          }}
          onClose={() => setTyping(false)}
        />
      ) : null}
    </Animated.View>
  );
}

/** "Every Friday", "Every other Friday", "Twice a month", as a pay's rhythm comes. */
export function rhythmLabel(
  rhythm: Rhythm,
  t: ReturnType<typeof useI18n>['t'],
  weekday: (index: number) => string,
): string {
  switch (rhythm.kind) {
    case 'weekly':
      return t('close.payday.everyWeekday', { weekday: weekday(rhythm.weekday) });
    case 'everyTwoWeeks':
      return t('close.payday.everyOther', {
        weekday: weekday(weekdayMondayFirst(rhythm.anchor)),
      });
    case 'twiceMonthly':
      return t('onboarding.pay.twiceMonthly');
    case 'monthly':
    case 'none':
      return t('close.payday.yourPay');
  }
}

/**
 * What the payday card shows for the late pay: its rhythm and date, what is left of the stretch
 * before it and what is in hand, and the day as it stays while the month waits (`incomePeriod`).
 */
export function useLatePayCard(
  late: LatePay | undefined,
  number: DailyNumber | null,
  closing: LocalDate,
): LatePayCard | null {
  const snap = useMoney();
  const { t, language } = useI18n();
  const income = snap.plan?.incomes?.find((i) => i.id === late?.incomeId);
  if (late === undefined || income === undefined || number === null) return null;
  const locale = localeOf(language);
  const at = (day: LocalDate) => new Date(`${day}T12:00:00`);
  // Monday first, as the domain's weeks run: 2 Nov 2026 was a Monday.
  const weekday = (index: number) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(at(addDays('2026-11-02', index)));
  const short = (day: LocalDate) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(
      at(day),
    );
  const inHand = Math.max(0, periodInputOf(snap)?.inHand ?? 0);
  const left = number.startFree;
  return {
    // The date only, as the cards' kicker: the close counts no cards in its header.
    kicker: short(closing).toUpperCase(),
    rhythm: rhythmLabel(income.rhythm, t, weekday),
    due: t('close.payday.due', { date: short(late.due) }),
    amount: income.amount,
    left: left - inHand,
    inHand,
    line: number.line,
    days: number.line > 0 ? Math.floor(Math.max(0, left) / number.line) : 0,
    weekly: income.rhythm.kind === 'weekly',
  };
}

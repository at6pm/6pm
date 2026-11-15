import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

import { addDays, type LocalDate } from '@6pm/domain';
import { incomeInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { Symbol } from '../../ui/icons/symbol';
import { useTheme } from '../../ui/theme/theme';
import { OfferedChip } from '../sharing/offered-chip';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import type { CoverRuler } from '../plan/income-plan-view';

const dateOf = (day: LocalDate) => new Date(`${day}T12:00:00`);

/** A meter whose track is dashed: dashed means "not in yet", everywhere in 6pm. */
export function DashedMeter({ color }: { readonly color: string }) {
  return (
    <View
      style={{
        height: 6,
        borderRadius: 6,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: color,
      }}
    />
  );
}

/**
 * Today's hero before anything has landed (or while a landing still owes the bills): no number,
 * the words in its place at the hero's size, a dashed meter, and what the bills still need, in
 * ink, never in the warm colour of "over".
 */
export function NothingLandedHero({
  short,
  billsStillNeed,
  nextNeed,
}: {
  /** Something landed, but the bills still need more. */
  readonly short: boolean;
  readonly billsStillNeed: number;
  readonly nextNeed: { readonly name: string; readonly due: LocalDate } | null;
}) {
  const { palette } = useTheme();
  const { t, weekdayDayShort } = useI18n();
  const money = useMoneyFormat();
  const track = palette.dark ? 'rgba(255,255,255,.32)' : 'rgba(27,30,46,.22)';
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...body(15, 500), color: palette.inkSoft }}>{t('today.safeToSpend')}</Text>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{ ...leading(display(54, 500, -0.03), 54), color: palette.ink, maxWidth: 300 }}
      >
        {short ? t('income.today.billsFirst') : t('income.today.nothingLanded')}
      </Text>
      <View style={{ gap: 8, paddingTop: 10, maxWidth: 262 }}>
        <DashedMeter color={track} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ ...body(13.5, 500), ...tabular, color: palette.inkSoft }}>
            {billsStillNeed > 0
              ? t('income.today.billsStillNeed', { amount: money.short(billsStillNeed) })
              : ''}
          </Text>
          {nextNeed ? (
            <Text style={{ ...body(13.5, 500), color: palette.inkSoft }}>
              {t('income.today.byDate', {
                name: nextNeed.name,
                date: weekdayDayShort(dateOf(nextNeed.due)),
              })}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** The ruler's ticks close up as a day passes; the day that left fades out. */
const closeUp = LinearTransition.duration(300).reduceMotion(ReduceMotion.System);

/**
 * The line under the meter for money that only lands: "Covered 47 days · to Thu 24 Dec" over a
 * ruler of a tick a day, in ink to the day the money lasts to and in the in-hand lavender after.
 * The evening a landing is placed, and when the days first pass 30, Days covered is offered beside
 * the line (once each), in the line's own room.
 */
export function CoverRulerLine({
  today,
  ruler,
  offer = [],
}: {
  readonly today: LocalDate;
  readonly ruler: CoverRuler;
  /** The moments Days covered is offered at (`coveredMoments`). */
  readonly offer?: readonly string[];
}) {
  const { palette } = useTheme();
  const { t, weekdayDayShort } = useI18n();
  const beyond = palette.dark ? incomeInk.rulerInHand.dark : incomeInk.rulerInHand.light;
  const ticks = Array.from({ length: ruler.covered }, (_, k) => addDays(today, k));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', height: 12, gap: ruler.covered > 60 ? 1 : 2 }}>
        {ticks.map((day, k) => (
          <Animated.View
            key={day}
            layout={closeUp}
            entering={FadeIn.duration(300).delay(k * 20)}
            exiting={FadeOut.duration(300)}
            style={{
              flex: 1,
              borderRadius: 1,
              backgroundColor: k < ruler.stretch ? palette.ink : beyond,
              opacity: k < ruler.stretch ? 1 : 0.7,
            }}
          />
        ))}
      </View>
      <View>
        <Text style={{ ...body(13, 500), color: palette.inkSoft }}>
          <Text style={{ ...body(13, 700), color: palette.ink }}>
            {t('income.today.covered', { count: ruler.covered })}
          </Text>
          {t('income.today.coveredTo', { date: weekdayDayShort(dateOf(ruler.to)) })}
        </Text>
        {/* Centred on the line, over the hero's room: the hero keeps its height. */}
        <View style={{ position: 'absolute', right: 0, top: -6 }}>
          <OfferedChip
            moments={offer}
            card="covered"
            of={today}
            size="small"
            label={t('shareCards.chip')}
          />
        </View>
      </View>
    </View>
  );
}

/** Weekly pay on payday: "Paid today · next pay Fri 20", the one line under the meter. */
export function PaidTodayLine({ next }: { readonly next: LocalDate }) {
  const { palette } = useTheme();
  const { t, weekdayDayShort } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Symbol name="payments" size={16} color={palette.ink} />
      <Text style={{ ...body(13, 500), color: palette.inkSoft }}>
        <Text style={{ ...body(13, 700), color: palette.ink }}>{t('income.today.paidToday')}</Text>
        {t('income.today.nextPay', { date: weekdayDayShort(dateOf(next)) })}
      </Text>
    </View>
  );
}

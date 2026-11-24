import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import type { LocalDate } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { Companion } from '../../ui/companion/companion';
import { body, display, leading } from '../../ui/type/fonts';
import { HEADING_BREAKS, headingWords, WordFitText } from '../../ui/type/word-fit-text';
import { MoneyCameInCard } from '../today/money-came-in-card';
import { DashedMeter } from '../today/landed-hero';
import { fadeEntering, popEntering, riseEntering, ease } from './onboarding-motion';
import type { OnboardingPalette } from './onboarding-palette';

/**
 * The last step for money that only lands: no number is made from a guess. It is Today as it
 * will open, before anything has landed: what the bills still need, and "I got paid".
 */
export function StepFirstLanded({
  pal,
  billsStillNeed,
  firstDue,
  closeAt,
  reminded,
  onGotPaid,
}: {
  readonly pal: OnboardingPalette;
  readonly billsStillNeed: number;
  /** The first bill to fall due, by name. */
  readonly firstDue: { readonly name: string; readonly due: LocalDate } | null;
  readonly closeAt: string;
  readonly reminded: boolean;
  readonly onGotPaid: () => void;
}) {
  const { t, weekdayDayShort } = useI18n();
  const money = useMoneyFormat();
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View entering={fadeEntering(800, 0, reduceMotion)} style={{ flex: 1, gap: 14 }}>
      <View style={{ flex: 0.5 }} />
      <Animated.View
        entering={popEntering(800, 200, reduceMotion, ease.popIn)}
        style={{ alignSelf: 'center' }}
      >
        <Companion size={96} mood="calm" />
      </Animated.View>
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <Text style={{ ...body(15, 500), color: pal.inkSoft }}>{t('today.safeToSpend')}</Text>
        <WordFitText style={{ ...leading(display(44, 500, -0.03), 46), color: pal.ink }}>
          {t('income.today.nothingLanded')}
        </WordFitText>
        <View style={{ paddingTop: 10, gap: 8 }}>
          <DashedMeter color={pal.track} />
          {billsStillNeed > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ ...body(13.5, 500), color: pal.inkSoft }}>
                {t('income.today.billsStillNeed', { amount: money.short(billsStillNeed) })}
              </Text>
              {firstDue ? (
                <Text style={{ ...body(13.5, 500), color: pal.inkSoft }}>
                  {t('income.today.byDate', {
                    name: firstDue.name,
                    date: weekdayDayShort(new Date(`${firstDue.due}T12:00:00`)),
                  })}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      <Animated.View entering={riseEntering(500, 600, reduceMotion)}>
        <MoneyCameInCard
          bg={pal.cell}
          ink={pal.ink}
          inkSoft={pal.inkSoft}
          shadow={pal.cardShadow}
          onGotPaid={onGotPaid}
        />
      </Animated.View>
      <Text
        {...HEADING_BREAKS}
        style={{
          ...leading(display(19, 500), 23),
          textAlign: 'center',
          color: pal.ink,
          paddingTop: 4,
        }}
      >
        {headingWords(
          reminded
            ? t('onboarding.reveal.seeYou', { time: closeAt })
            : t('onboarding.reveal.noReminder', { time: closeAt }),
        )}
      </Text>
      <View style={{ flex: 1 }} />
    </Animated.View>
  );
}

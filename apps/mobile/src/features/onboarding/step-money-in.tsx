import { useRouter } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';

import type { Payday } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { deviceCurrencyGuess, startingCurrency } from '../../money/device-money';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';
import { currencyName } from '../currency/currency-choices';
import { IncomeWheels, PaydayPicker } from './money-in-controls';
import { keypadInksOf, type OnboardingPalette } from './onboarding-palette';
import { Card, StepHeading } from './step-parts';
import { GuideHints, useMoneyInGuide } from './wheel-guide';

/** The wheels' strips reach up into the card's top padding and down to the hints. */
const REACH_Y = { top: 12, bottom: 6 } as const;

/**
 * Money in: millions and hundred thousands on wheels (the home currency's steps), then payday on
 * a strip of days. The first time through, a ghost finger shows how the wheels move until they
 * are first touched.
 */
export function StepMoneyIn({
  pal,
  income,
  payday,
  dailyHint,
  guide,
  onIncome,
  onPayday,
  onGuideDone,
}: {
  readonly pal: OnboardingPalette;
  readonly income: number;
  readonly payday: Payday;
  /** Money in alone, spread over the days to payday by the domain engine. */
  readonly dailyHint: number;
  /** Play the gesture guide: only until the wheels are first touched, the first time through. */
  readonly guide: boolean;
  readonly onIncome: (income: number) => void;
  readonly onPayday: (payday: Payday) => void;
  readonly onGuideDone: () => void;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const shown = useMoneyInGuide(guide, onGuideDone);
  const router = useRouter();
  // A phone of two minds about its currency (in Vietnam, region United States) says which one it
  // is counting in, with the way to change it; so does one whose person already changed it.
  const picked = useSyncExternalStore(startingCurrency.subscribe, startingCurrency.get);
  const askCurrency = picked !== null || deviceCurrencyGuess().candidates.length > 1;
  return (
    <View style={{ gap: 14 }}>
      <StepHeading
        title={t('onboarding.income.title')}
        sub={t('onboarding.income.sub')}
        pal={pal}
      />
      <Card pal={pal} style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 14, gap: 6 }}>
        <IncomeWheels
          key={money.currency.code}
          income={income}
          onIncome={onIncome}
          colours={pal}
          reachY={REACH_Y}
          guide={shown}
          guidePal={pal}
          keypadInks={keypadInksOf(pal)}
        />
        <GuideHints guide={shown} pal={pal} />
        <Text
          style={{ ...body(13.5, 550), paddingTop: 4, textAlign: 'center', color: pal.inkSoft }}
        >
          {t('onboarding.income.daily', { amount: money.short(dailyHint) })}
        </Text>
        {askCurrency ? (
          <PressScale
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              haptics.tick();
              router.push('/currency');
            }}
            style={{ alignSelf: 'center', paddingTop: 2 }}
          >
            <Text style={{ ...body(13.5, 650), textAlign: 'center', color: pal.ink }}>
              {t('onboarding.income.currency', { currency: currencyName(money.currency) })}
            </Text>
          </PressScale>
        ) : null}
      </Card>
      <Card pal={pal} style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 10 }}>
        <Text style={{ ...body(15, 650), color: pal.ink }}>{t('onboarding.payday.title')}</Text>
        <PaydayPicker payday={payday} onPayday={onPayday} colours={pal} />
      </Card>
    </View>
  );
}

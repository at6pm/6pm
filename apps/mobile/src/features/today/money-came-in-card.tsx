import type { Href } from 'expo-router';
import { Text, View } from 'react-native';

import { moneyInInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';

/** Quick add on its money-in face ("I got paid"); Quick add reads `face`. */
export const GOT_PAID = { pathname: '/quick-add', params: { face: 'in' } } as unknown as Href;

/**
 * "Money came in?": the one thing that changes the day for someone whose money only lands, before
 * anything has. "I got paid" opens Quick add on its money-in face. Drawn in the inks it is given,
 * so Today and the last onboarding step can both carry it.
 */
export function MoneyCameInCard({
  bg,
  ink,
  inkSoft,
  shadow,
  onGotPaid,
}: {
  readonly bg: string;
  readonly ink: string;
  readonly inkSoft: string;
  readonly shadow?: string;
  readonly onGotPaid: () => void;
}) {
  const { t } = useI18n();
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: bg,
        boxShadow: shadow,
        paddingTop: 14,
        paddingHorizontal: 14,
        paddingBottom: 14,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: moneyInInk.futureYou,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="download" size={21} color={moneyInInk.futureYouFg} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ ...body(17, 600), color: ink }}>{t('income.today.cameIn')}</Text>
          <Text style={{ ...body(13, 500), color: inkSoft }}>{t('income.today.cameInSub')}</Text>
        </View>
      </View>
      <PressScale
        scaleTo={0.97}
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          onGotPaid();
        }}
        style={{
          height: 48,
          borderRadius: 99,
          backgroundColor: moneyInInk.futureYou,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Symbol name="add" size={18} color={moneyInInk.futureYouFg} />
        <Text style={{ ...body(15.5, 650), color: moneyInInk.futureYouFg }}>
          {t('income.today.gotPaid')}
        </Text>
      </PressScale>
    </View>
  );
}
